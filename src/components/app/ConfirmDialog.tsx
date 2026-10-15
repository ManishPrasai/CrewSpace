"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ActionResult } from "@/lib/result";

// handoff/03-components.md: wraps a real <form action>, so it degrades to
// a plain confirm-page navigation without JS (see each call site's no-JS
// fallback route). Initial focus on Cancel; confirm is destructiveSolid.
// R29: closing (Esc, backdrop, Cancel) is blocked while the action is
// pending, and a failed action keeps the dialog open with the error shown.
export function ConfirmDialog({
  trigger,
  title,
  body,
  confirmLabel,
  pendingLabel = "Working...",
  action,
  hiddenFields,
  onConfirmed,
}: {
  trigger: React.ReactElement;
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  pendingLabel?: string;
  action: (
    prevState: ActionResult<void> | null,
    formData: FormData,
  ) => Promise<ActionResult<void>>;
  hiddenFields?: Record<string, string>;
  onConfirmed?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (state?.ok) {
      setOpen(false);
      onConfirmed?.();
    }
    // onConfirmed is a stable callback from the parent, safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <DialogTrigger render={trigger} />
      <DialogContent showCloseButton={false}>
        <form action={formAction} className="flex flex-col gap-4">
          {hiddenFields &&
            Object.entries(hiddenFields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{body}</DialogDescription>
          </DialogHeader>
          {state && !state.ok && <FormAlert tone="error">{state.error.message}</FormAlert>}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" autoFocus disabled={pending} />}>
              Cancel
            </DialogClose>
            <SubmitButton variant="destructiveSolid" pendingLabel={pendingLabel}>
              {confirmLabel}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
