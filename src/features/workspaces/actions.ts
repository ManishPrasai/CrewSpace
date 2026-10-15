"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { err, ok, type ActionResult } from "@/lib/result";
import { isUniqueViolation } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { createWorkspaceSchema, deleteWorkspaceSchema, renameWorkspaceSchema } from "./schemas";

export async function createWorkspace(
  _prevState: ActionResult<{ slug: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ slug: string }>> {
  const parsed = createWorkspaceSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_workspace", {
    p_name: parsed.data.name,
    p_slug: parsed.data.slug,
  });

  if (error) {
    if (isUniqueViolation(error)) {
      return err("CONFLICT", "That URL is already taken.", {
        slug: ["That URL is already taken."],
      });
    }
    console.error("createWorkspace failed", error);
    return err("INTERNAL", "Something went wrong. Please try again.");
  }

  revalidatePath("/workspaces");
  redirect(`/w/${parsed.data.slug}`);
}

export async function renameWorkspace(
  _prevState: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = renameWorkspaceSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  // RLS (owner/admin only) and the column grant (name only) already
  // enforce who can do this and what they can touch - this is a plain
  // update through the user-scoped client, no RPC needed. .select()
  // lets us tell "not owner/admin" (0 rows, RLS silently filtered) apart
  // from a real failure.
  const { data, error } = await supabase
    .from("workspaces")
    .update({ name: parsed.data.name })
    .eq("id", parsed.data.workspaceId)
    .select("slug");

  if (error) {
    console.error("renameWorkspace failed", error);
    return err("INTERNAL", "Something went wrong. Please try again.");
  }
  if (!data || data.length === 0) {
    return err("FORBIDDEN", "Only the owner or an admin can rename this workspace.");
  }

  revalidatePath(`/w/${data[0].slug}`);
  revalidatePath("/workspaces");
  return ok();
}

export async function deleteWorkspace(
  _prevState: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = deleteWorkspaceSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    slugConfirmation: formData.get("slugConfirmation"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { data: workspace, error: fetchError } = await supabase
    .from("workspaces")
    .select("slug, plan")
    .eq("id", parsed.data.workspaceId)
    .single();
  if (fetchError || !workspace) {
    return err("NOT_FOUND", "Workspace not found.");
  }

  if (workspace.slug !== parsed.data.slugConfirmation) {
    return err("VALIDATION", "Type the workspace's URL exactly to confirm deletion.", {
      slugConfirmation: ["Doesn't match this workspace's URL."],
    });
  }
  if (workspace.plan !== "free") {
    return err("CONFLICT", "Cancel the Pro subscription before deleting this workspace.");
  }

  // RLS (owner, and only while plan='free') is the real enforcement -
  // the checks above exist to give a specific reason, since a blocked
  // DELETE just silently affects 0 rows rather than throwing.
  const { data, error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", parsed.data.workspaceId)
    .select("id");

  if (error) {
    console.error("deleteWorkspace failed", error);
    return err("INTERNAL", "Something went wrong. Please try again.");
  }
  if (!data || data.length === 0) {
    return err("FORBIDDEN", "Only the owner can delete this workspace.");
  }

  revalidatePath("/workspaces");
  redirect("/workspaces?notice=deleted");
}
