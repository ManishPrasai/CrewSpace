"use client";

import { useActionState, useEffect, useRef } from "react";
import { Avatar } from "@/components/app/Avatar";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { createAnnouncement } from "../actions";

// handoff/03-components.md: collapsed trigger <-> expanded form, a real
// <details>/<summary> so it works without JS (05-dependencies R15). N
// expands and focuses Title; Esc collapses and keeps the draft only in
// DOM state (not persisted) - both are JS enhancements on top of the
// native disclosure, never required for the form to work.
export function AnnouncementComposer({
  workspaceId,
  slug,
  workspaceName,
  authorId,
  authorName,
}: {
  workspaceId: string;
  slug: string;
  workspaceName: string;
  authorId: string;
  authorName: string | null;
}) {
  const [state, formAction] = useActionState(createAnnouncement, null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  function expand() {
    if (detailsRef.current) detailsRef.current.open = true;
    titleRef.current?.focus();
  }

  function collapse() {
    if (detailsRef.current) detailsRef.current.open = false;
  }

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      collapse();
      toast.add({ title: "Announcement posted", type: "success" });
    }
  }, [state]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      if (!isEditable && !e.metaKey && !e.ctrlKey && e.key.toLowerCase() === "n" && !detailsRef.current?.open) {
        e.preventDefault();
        expand();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function onFormKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      collapse();
    } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  // Body-specific: plain Enter posts, Shift+Enter inserts a newline -
  // matches chat-style composers, overriding a plain <textarea>'s
  // default of Enter always inserting a newline. Scoped to this field
  // only (not onFormKeyDown) so Title's native Enter-submits behavior
  // and multi-line editing elsewhere are both unaffected.
  function onBodyKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  const fieldErrors = state && !state.ok ? state.error.fieldErrors : undefined;

  return (
    <details ref={detailsRef} className="group/composer rounded-xl border border-border bg-background shadow-raised">
      <summary
        className="flex cursor-pointer list-none items-center gap-3 p-2.5 pl-3 [&::-webkit-details-marker]:hidden group-open/composer:hidden"
        onClick={(e) => {
          e.preventDefault();
          expand();
        }}
      >
        <Avatar id={authorId} name={authorName} size={30} />
        <span className="min-w-0 flex-1 truncate text-[15px] text-placeholder">
          Share an update with {workspaceName}…
        </span>
        <span className="hidden shrink-0 rounded-[5px] border border-border px-1.5 py-px font-mono text-[11px] text-muted-foreground sm:inline-block">
          N
        </span>
        <span className="flex h-8 shrink-0 items-center whitespace-nowrap rounded-md bg-primary px-3.5 text-[13.5px] font-medium text-primary-foreground">
          New announcement
        </span>
      </summary>

      <form
        ref={formRef}
        action={formAction}
        onKeyDown={onFormKeyDown}
        className="flex flex-col gap-3 p-4"
      >
        <input type="hidden" name="workspaceId" value={workspaceId} />
        <input type="hidden" name="slug" value={slug} />
        <Field label="Title" htmlFor="title" error={fieldErrors?.title?.[0]}>
          <Input ref={titleRef} name="title" required />
        </Field>
        <Field label="Body" htmlFor="body" error={fieldErrors?.body?.[0]}>
          <Textarea name="body" required minRows={4} onKeyDown={onBodyKeyDown} />
        </Field>
        {state && !state.ok && !fieldErrors && <FormAlert tone="error">{state.error.message}</FormAlert>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={collapse}>
            Cancel
          </Button>
          <SubmitButton pendingLabel="Posting...">Post</SubmitButton>
        </div>
      </form>
    </details>
  );
}
