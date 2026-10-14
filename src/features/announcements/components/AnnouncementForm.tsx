"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAnnouncement } from "../actions";

export function AnnouncementForm({ workspaceId, slug }: { workspaceId: string; slug: string }) {
  const [state, formAction, pending] = useActionState(createAnnouncement, null);
  const fieldErrors = state && !state.ok ? state.error.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="slug" value={slug} />
      <div className="flex flex-col gap-1">
        <label htmlFor="title">Title</label>
        <Input id="title" name="title" required />
        {fieldErrors?.title && <p role="alert">{fieldErrors.title[0]}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="body">Body</label>
        <textarea
          id="body"
          name="body"
          rows={4}
          required
          className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
        />
        {fieldErrors?.body && <p role="alert">{fieldErrors.body[0]}</p>}
      </div>
      {state && !state.ok && !fieldErrors && <p role="alert">{state.error.message}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Posting..." : "Post announcement"}
      </Button>
    </form>
  );
}
