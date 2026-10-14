"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteAnnouncement, updateAnnouncement } from "../actions";
import type { Announcement } from "../queries";

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
  const [deleteState, deleteAction, deletePending] = useActionState(deleteAnnouncement, null);

  useEffect(() => {
    if (updateState?.ok) {
      onUpdated(announcement.id, updateState.data.title, updateState.data.body);
      setIsEditing(false);
    }
    // onUpdated is a stable setter from the parent's useState, safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateState, announcement.id]);

  useEffect(() => {
    if (deleteState?.ok) {
      onDeleted(announcement.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteState, announcement.id]);

  const fieldErrors = updateState && !updateState.ok ? updateState.error.fieldErrors : undefined;

  if (isEditing) {
    return (
      <li className="flex flex-col gap-2 border-b py-3">
        <form action={updateAction} className="flex flex-col gap-2">
          <input type="hidden" name="id" value={announcement.id} />
          <input type="hidden" name="slug" value={slug} />
          <Input name="title" defaultValue={announcement.title} required />
          {fieldErrors?.title && <p role="alert">{fieldErrors.title[0]}</p>}
          <textarea
            name="body"
            defaultValue={announcement.body}
            rows={4}
            required
            className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          />
          {fieldErrors?.body && <p role="alert">{fieldErrors.body[0]}</p>}
          {updateState && !updateState.ok && !fieldErrors && (
            <p role="alert">{updateState.error.message}</p>
          )}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={updatePending}>
              {updatePending ? "Saving..." : "Save"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-1 border-b py-3">
      <h3 className="text-base font-semibold">{announcement.title}</h3>
      <p className="whitespace-pre-wrap">{announcement.body}</p>
      <p className="text-sm text-muted-foreground">
        {announcement.authorName ?? "Unknown"} &middot;{" "}
        {new Date(announcement.createdAt).toLocaleString()}
      </p>
      {canManage && (
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={announcement.id} />
            <input type="hidden" name="slug" value={slug} />
            <Button type="submit" size="sm" variant="destructive" disabled={deletePending}>
              Delete
            </Button>
          </form>
        </div>
      )}
      {deleteState && !deleteState.ok && <p role="alert">{deleteState.error.message}</p>}
    </li>
  );
}
