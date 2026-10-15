"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { renameWorkspace } from "../actions";

// handoff/02-visual-design-spec.md (D4): a bordered row group, label +
// hint on the left (180px), the control on the right. "Saved" appears
// inline next to the field for a few seconds rather than as a separate
// status line.
export function RenameWorkspaceForm({
  workspaceId,
  name,
}: {
  workspaceId: string;
  name: string;
}) {
  const [state, formAction, pending] = useActionState(renameWorkspace, null);
  const [showSaved, setShowSaved] = useState(false);
  const fieldErrors = state && !state.ok ? state.error.fieldErrors : undefined;

  useEffect(() => {
    if (state?.ok) {
      setShowSaved(true);
      const timeout = setTimeout(() => setShowSaved(false), 2500);
      return () => clearTimeout(timeout);
    }
  }, [state]);

  return (
    <form
      action={formAction}
      className="grid grid-cols-[180px_minmax(0,1fr)] items-center gap-5 border-b border-border-subtle p-4"
    >
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <div className="flex flex-col gap-0.5">
        <span className="text-[14px] font-medium">Name</span>
        <span className="text-[12.5px] text-muted-foreground">Owners and admins</span>
      </div>
      <div className="flex items-center gap-2">
        <Input name="name" defaultValue={name} required aria-invalid={Boolean(fieldErrors?.name)} />
        {showSaved && !pending ? (
          <span className="flex items-center gap-1.5 whitespace-nowrap text-[13.5px] font-medium text-success">
            <CheckIcon className="size-3.5" />
            Saved
          </span>
        ) : (
          <SubmitButton size="sm" pendingLabel="Saving...">
            Save
          </SubmitButton>
        )}
      </div>
      {fieldErrors?.name && <p role="alert" className="col-start-2 text-[13px] text-destructive">{fieldErrors.name[0]}</p>}
      {state && !state.ok && !fieldErrors && (
        <p role="alert" className="col-start-2 text-[13px] text-destructive">
          {state.error.message}
        </p>
      )}
    </form>
  );
}
