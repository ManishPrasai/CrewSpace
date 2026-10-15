"use client";

import { useActionState, useEffect } from "react";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { createInvitation } from "../actions";

export function InviteMemberForm({
  workspaceId,
  slug,
  onSent,
}: {
  workspaceId: string;
  slug: string;
  onSent?: () => void;
}) {
  const [state, formAction] = useActionState(createInvitation, null);
  const fieldErrors = state && !state.ok ? state.error.fieldErrors : undefined;

  useEffect(() => {
    if (state?.ok) {
      onSent?.();
    }
    // onSent is a stable callback from the parent, safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="slug" value={slug} />
      <Field label="Email" htmlFor="invite-email" error={fieldErrors?.email?.[0]}>
        <Input id="invite-email" name="email" type="email" autoComplete="off" required />
      </Field>
      <Field label="Role" htmlFor="invite-role">
        <NativeSelect id="invite-role" name="role" defaultValue="member">
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </NativeSelect>
      </Field>
      {state && !state.ok && !fieldErrors && <FormAlert tone="error">{state.error.message}</FormAlert>}
      <SubmitButton pendingLabel="Sending...">Send invite</SubmitButton>
    </form>
  );
}
