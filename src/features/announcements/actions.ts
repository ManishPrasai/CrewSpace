"use server";

import { revalidatePath } from "next/cache";
import { err, ok, type ActionResult } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";
import { getAnnouncements, type AnnouncementPage } from "./queries";
import { createAnnouncementSchema, deleteAnnouncementSchema, updateAnnouncementSchema } from "./schemas";

// Thin wrapper so the "load more" button in the feed (a client component)
// can call a queries.ts function - queries.ts itself can't be imported
// into client code since it uses the server-only cookie-based client.
export async function loadMoreAnnouncements(
  workspaceId: string,
  cursor: string,
): Promise<AnnouncementPage> {
  return getAnnouncements(workspaceId, cursor);
}

export async function createAnnouncement(
  _prevState: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = createAnnouncementSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return err("UNAUTHENTICATED", "Please log in.");
  }

  const { error } = await supabase.from("announcements").insert({
    workspace_id: parsed.data.workspaceId,
    author_id: user.id,
    title: parsed.data.title,
    body: parsed.data.body,
  });

  if (error) {
    // RLS's WITH CHECK rejects a non-admin's insert with a plain
    // permission-denied error, not a custom code - one generic message
    // either way, matching every other action in this feature set.
    return err("FORBIDDEN", "You don't have permission to post announcements here.");
  }

  const slug = formData.get("slug")?.toString();
  if (slug) {
    revalidatePath(`/w/${slug}`);
  }
  return ok();
}

export async function updateAnnouncement(
  _prevState: ActionResult<{ title: string; body: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ title: string; body: string }>> {
  const parsed = updateAnnouncementSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .update({ title: parsed.data.title, body: parsed.data.body })
    .eq("id", parsed.data.id)
    .select("id");

  if (error) {
    return err("INTERNAL", "Something went wrong. Please try again.");
  }
  // RLS's USING clause hides rows a non-admin can't touch rather than
  // raising an error, so an unauthorized update just affects 0 rows.
  if (!data || data.length === 0) {
    return err("FORBIDDEN", "You don't have permission to edit this announcement.");
  }

  const slug = formData.get("slug")?.toString();
  if (slug) {
    revalidatePath(`/w/${slug}`);
  }
  return ok({ title: parsed.data.title, body: parsed.data.body });
}

export async function deleteAnnouncement(
  _prevState: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = deleteAnnouncementSchema.safeParse({
    id: formData.get("id"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", parsed.data.id)
    .select("id");

  if (error) {
    return err("INTERNAL", "Something went wrong. Please try again.");
  }
  if (!data || data.length === 0) {
    return err("FORBIDDEN", "You don't have permission to delete this announcement.");
  }

  const slug = formData.get("slug")?.toString();
  if (slug) {
    revalidatePath(`/w/${slug}`);
  }
  return ok();
}
