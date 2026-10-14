"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createInvitation } from "../actions";

export function InviteMemberForm({ workspaceId, slug }: { workspaceId: string; slug: string }) {
  const [state, formAction, pending] = useActionState(createInvitation, null);
  const fieldErrors = state && !state.ok ? state.error.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="slug" value={slug} />
      <div className="flex flex-col gap-1">
        <label htmlFor="email">Email</label>
        <Input id="email" name="email" type="email" autoComplete="off" required />
        {fieldErrors?.email && <p role="alert">{fieldErrors.email[0]}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="role">Role</label>
        <select id="role" name="role" defaultValue="member">
          <option value="admin">admin</option>
          <option value="member">member</option>
        </select>
      </div>
      {state?.ok && <p role="status">Invitation sent.</p>}
      {state && !state.ok && !fieldErrors && <p role="alert">{state.error.message}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send invite"}
      </Button>
    </form>
  );
}
