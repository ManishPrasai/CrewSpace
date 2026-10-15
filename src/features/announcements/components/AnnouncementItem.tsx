"use client";

import { useActionState, useEffect, useState } from "react";
import { MoreHorizontalIcon } from "lucide-react";
import { Avatar } from "@/components/app/Avatar";
import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { deleteAnnouncement, updateAnnouncement } from "../actions";
import type { Announcement } from "../queries";

// handoff/02-visual-design-spec.md: avatar 32, name, time, no role badge
// (R06 - a role badge would show the author's CURRENT role, not their
// role when they posted, which the audit found misleading). Hover/
// focus-within reveals Edit + a (.) menu with a #FAFAF8-ish background;
// on touch it's always visible (03-components.md).
export function AnnouncementItem({
  announcement,
  slug,
  canManage,
  onUpdated,
  onDeleted,
}: {
  announcement: Announcement;
  slug: string;
  canManage: boolean;
  onUpdated: (id: string, title: string, body: string) => void;
  onDeleted: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateState, updateAction, updatePending] = useActionState(updateAnnouncement, null);

  useEffect(() => {
    if (updateState?.ok) {
      onUpdated(announcement.id, updateState.data.title, updateState.data.body);
      setIsEditing(false);
      toast.add({ title: "Saved", type: "success" });
    }
    // onUpdated is a stable setter from the parent's useState, safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateState, announcement.id]);

  const fieldErrors = updateState && !updateState.ok ? updateState.error.fieldErrors : undefined;
  const time = new Date(announcement.createdAt).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isEditing) {
    return (
      <li className="rounded-xl bg-muted/60 px-3.5 py-5">
        <form action={updateAction} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={announcement.id} />
          <input type="hidden" name="slug" value={slug} />
          <Field label="Title" htmlFor={`title-${announcement.id}`} error={fieldErrors?.title?.[0]}>
            <Input name="title" defaultValue={announcement.title} required />
          </Field>
          <Field label="Body" htmlFor={`body-${announcement.id}`} error={fieldErrors?.body?.[0]}>
            <Textarea name="body" defaultValue={announcement.body} required minRows={4} />
          </Field>
          {updateState && !updateState.ok && !fieldErrors && (
            <FormAlert tone="error">{updateState.error.message}</FormAlert>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={updatePending}>
              Cancel
            </Button>
            <SubmitButton pendingLabel="Saving...">Save</SubmitButton>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="group/post -mx-3.5 rounded-xl px-3.5 py-5 hover:bg-muted/60">
      <div className="flex items-center gap-2.5 text-[13.5px]">
        <Avatar id={announcement.authorId ?? announcement.id} name={announcement.authorName} size={32} />
        <span className="font-semibold">{announcement.authorName ?? "Unknown"}</span>
        <time className="text-muted-foreground">{time}</time>
        {canManage && (
          <div className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity group-hover/post:opacity-100 group-focus-within/post:opacity-100 [@media(hover:none)]:opacity-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <ConfirmDialog
              trigger={
                <Button type="button" variant="ghost" size="icon-sm" aria-label="More actions">
                  <MoreHorizontalIcon />
                </Button>
              }
              title="Delete this announcement?"
              body="This can't be undone. Everyone in the workspace will stop seeing it."
              confirmLabel="Delete"
              pendingLabel="Deleting..."
              action={deleteAnnouncement}
              hiddenFields={{ id: announcement.id, slug }}
              onConfirmed={() => {
                onDeleted(announcement.id);
                toast.add({ title: "Announcement deleted", type: "success" });
              }}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 pl-[42px]">
        <h3 className="text-[19px] font-semibold tracking-[-0.015em]">{announcement.title}</h3>
        <p className="max-w-[34em] whitespace-pre-wrap text-[16px] leading-[1.7] text-foreground/90">
          {announcement.body}
        </p>
      </div>
    </li>
  );
}
