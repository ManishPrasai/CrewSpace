"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { changeMemberRole } from "../actions";

const ROLE_OPTIONS = [
  {
    value: "admin" as const,
    label: "Admin",
    description: "Posts, edits and deletes announcements. Invites and removes members. Renames the workspace.",
  },
  {
    value: "member" as const,
    label: "Member",
    description: "Reads announcements and sees members. Can leave the workspace.",
  },
];

// handoff/02-visual-design-spec.md (D3): radio cards, a "current" tag on
// the member's existing role, and an "Unsaved change" footer hint - the
// hint and the disabled-until-changed Update button are JS niceties on
// top of a form that submits correctly either way.
export function RoleEditor({
  workspaceId,
  userId,
  slug,
  memberName,
  currentRole,
}: {
  workspaceId: string;
  userId: string;
  slug: string;
  memberName: string;
  currentRole: "admin" | "member";
}) {
  const [state, formAction, pending] = useActionState(changeMemberRole, null);
  const [selected, setSelected] = useState(currentRole);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="slug" value={slug} />
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[14.5px] font-semibold">Role</h2>
        <p className="text-[13px] text-muted-foreground">Only the owner can change roles.</p>
      </div>
      <div role="radiogroup" aria-label="Role" className="flex flex-col gap-2">
        {ROLE_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-[11px] border border-input p-3.5 has-checked:ring-[1.5px] has-checked:ring-foreground"
          >
            <input
              type="radio"
              name="role"
              value={option.value}
              defaultChecked={option.value === currentRole}
              onChange={() => setSelected(option.value)}
              className="mt-0.5"
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-[14px] font-semibold">
                {option.label}
                {option.value === currentRole && (
                  <span className="font-normal text-muted-foreground"> · current</span>
                )}
              </span>
              <span className="text-[13px] leading-snug text-muted-foreground">{option.description}</span>
            </span>
          </label>
        ))}
      </div>
      {state && !state.ok && <FormAlert tone="error">{state.error.message}</FormAlert>}
      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-[12.5px] text-muted-foreground">
          {selected !== currentRole
            ? `Unsaved change: ${currentRole === "admin" ? "Admin" : "Member"} → ${selected === "admin" ? "Admin" : "Member"}`
            : `${memberName} is currently ${currentRole === "admin" ? "an Admin" : "a Member"}.`}
        </p>
        <div className="flex gap-2">
          <Button type="reset" variant="outline" size="sm" onClick={() => setSelected(currentRole)}>
            Cancel
          </Button>
          <SubmitButton size="sm" pendingLabel="Updating..." disabled={pending || selected === currentRole}>
            Update role
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
