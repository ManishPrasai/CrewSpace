"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { err, ok, type ActionResult } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";
import { changeMemberRoleSchema, leaveWorkspaceSchema, removeMemberSchema } from "./schemas";

// The RPCs raise a plain exception with the ErrorCode itself as the
// message (FORBIDDEN, NOT_FOUND, UNAUTHENTICATED) - this maps that back
// to the real ActionResult shape with a user-facing message, verified
// against the actual raised error.message, not assumed.
function mapRpcError(message: string): ActionResult<void> {
  if (message.includes("FORBIDDEN")) {
    return err("FORBIDDEN", "You don't have permission to do that.");
  }
  if (message.includes("NOT_FOUND")) {
    return err("NOT_FOUND", "That member could not be found.");
  }
  if (message.includes("UNAUTHENTICATED")) {
    return err("UNAUTHENTICATED", "Please log in again.");
  }
  console.error("member RPC failed", message);
  return err("INTERNAL", "Something went wrong. Please try again.");
}

export async function changeMemberRole(
  _prevState: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = changeMemberRoleSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("change_member_role", {
    p_ws: parsed.data.workspaceId,
    p_user: parsed.data.userId,
    p_role: parsed.data.role,
  });

  if (error) {
    return mapRpcError(error.message);
  }

  const slug = formData.get("slug")?.toString();
  if (slug) {
    revalidatePath(`/w/${slug}/members`);
  }
  return ok();
}

export async function removeMember(
  _prevState: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = removeMemberSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    userId: formData.get("userId"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("remove_member", {
    p_ws: parsed.data.workspaceId,
    p_user: parsed.data.userId,
  });

  if (error) {
    return mapRpcError(error.message);
  }

  const slug = formData.get("slug")?.toString();
  if (slug) {
    revalidatePath(`/w/${slug}/members`);
  }
  return ok();
}

export async function leaveWorkspace(
  _prevState: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = leaveWorkspaceSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("leave_workspace", {
    p_ws: parsed.data.workspaceId,
  });

  if (error) {
    return mapRpcError(error.message);
  }

  revalidatePath("/workspaces");
  redirect("/workspaces?notice=left");
}
