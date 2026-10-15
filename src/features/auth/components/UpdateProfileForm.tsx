"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateProfile } from "../actions";

// Account -> Profile (handoff/05-dependencies.md D1). Same inline-row,
// inline-"Saved" pattern as RenameWorkspaceForm, for the same reason:
// it's a single field, a separate status line is more UI than the
// change deserves.
export function UpdateProfileForm({ fullName, slug }: { fullName: string; slug: string }) {
  const [state, formAction, pending] = useActionState(updateProfile, null);
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
      <input type="hidden" name="slug" value={slug} />
      <div className="flex flex-col gap-0.5">
        <span className="text-[14px] font-medium">Name</span>
        <span className="text-[12.5px] text-muted-foreground">Shown to people you share a workspace with</span>
      </div>
      <div className="flex items-center gap-2">
        <Input name="fullName" defaultValue={fullName} required aria-invalid={Boolean(fieldErrors?.fullName)} />
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
      {fieldErrors?.fullName && (
        <p role="alert" className="col-start-2 text-[13px] text-destructive">
          {fieldErrors.fullName[0]}
        </p>
      )}
      {state && !state.ok && !fieldErrors && (
        <p role="alert" className="col-start-2 text-[13px] text-destructive">
          {state.error.message}
        </p>
      )}
    </form>
  );
}
