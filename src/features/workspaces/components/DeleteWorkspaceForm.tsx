"use client";

import { useActionState, useState } from "react";
import { CircleAlertIcon } from "lucide-react";
import Link from "next/link";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { deleteWorkspace } from "../actions";

// handoff/02-visual-design-spec.md (D4): a destructive-tinted nested
// container. The typed-value-must-match-slug gate that disables the
// button is a client hint (04-routes.md) - the server validates the
// same thing regardless, so this degrades to a plain enabled button
// without JS, same safety either way.
export function DeleteWorkspaceForm({
  workspaceId,
  slug,
  canDelete,
}: {
  workspaceId: string;
  slug: string;
  canDelete: boolean;
}) {
  const [state, formAction, pending] = useActionState(deleteWorkspace, null);
  const [typed, setTyped] = useState("");
  const fieldErrors = state && !state.ok ? state.error.fieldErrors : undefined;

  return (
    <div className="rounded-xl border border-destructive/20 bg-destructive-soft/40 p-1.5">
      <div className="flex flex-col gap-3.5 rounded-[10px] border border-destructive/15 bg-background p-4.5">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-[14.5px] font-semibold">Delete workspace</h3>
          <p className="text-[13px] leading-snug text-muted-foreground">
            Permanently deletes {slug}, its announcements and every membership. This can&rsquo;t be undone.
          </p>
        </div>

        {!canDelete && (
          <div className="flex items-center gap-2.5 rounded-[10px] bg-warning-soft px-3 py-2.5 text-[13px] text-warning">
            <CircleAlertIcon className="size-4 shrink-0" />
            <span className="flex-1">
              This workspace has an active Pro subscription. Cancel it on the Billing page before deleting.
            </span>
            <Link href={`/w/${slug}/billing`} className="shrink-0 font-medium underline underline-offset-2">
              Go to Billing
            </Link>
          </div>
        )}

        <form action={formAction} className={canDelete ? "flex flex-col gap-2" : "flex flex-col gap-2 opacity-55"}>
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <div className="flex items-center gap-2">
            <Input
              name="slugConfirmation"
              autoComplete="off"
              required
              disabled={!canDelete}
              placeholder={`Type ${slug} to confirm`}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              aria-invalid={Boolean(fieldErrors?.slugConfirmation)}
            />
            <SubmitButton
              variant="destructiveSolid"
              pendingLabel="Deleting..."
              disabled={!canDelete || pending || typed !== slug}
            >
              Delete workspace
            </SubmitButton>
          </div>
          {fieldErrors?.slugConfirmation && <FormAlert tone="error">{fieldErrors.slugConfirmation[0]}</FormAlert>}
          {state && !state.ok && !fieldErrors && <FormAlert tone="error">{state.error.message}</FormAlert>}
        </form>
      </div>
    </div>
  );
}
