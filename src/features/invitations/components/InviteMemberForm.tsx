"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { createInvitation } from "../actions";

export function InviteMemberForm({
  workspaceId,
  slug,
  seatsLeft,
  onSent,
}: {
  workspaceId: string;
  slug: string;
  /** Free-plan seats remaining (handoff S8's "N seat(s) left on Free"
      hint) - omitted on Pro, where there's no seat cap to show. */
  seatsLeft?: number;
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
      <div className="flex items-center justify-between gap-3">
        {seatsLeft !== undefined ? (
          <p className="text-[12.5px] text-muted-foreground">
            {seatsLeft} seat{seatsLeft === 1 ? "" : "s"} left on Free
          </p>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <SubmitButton pendingLabel="Sending...">Send invite</SubmitButton>
        </div>
      </div>
    </form>
  );
}
