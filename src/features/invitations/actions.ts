"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isUniqueViolation } from "@/lib/errors";
import { err, ok, type ActionResult } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";
import { sendInvitationEmail } from "./email";
import {
  acceptInvitationSchema,
  createInvitationSchema,
  resendInvitationSchema,
  revokeInvitationSchema,
} from "./schemas";
import { generateInvitationToken } from "./token";

const RATE_LIMIT_PER_HOUR = 20;

// Shared by createInvitation and resendInvitation ("Revoke + create new
// token" per docs/api.md) - both end with the same insert-then-email
// sequence.
async function insertInvitationAndSendEmail(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
  email: string,
  role: "admin" | "member",
): Promise<ActionResult<void>> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from("invitations")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .gte("created_at", oneHourAgo);

  if (countError) {
    console.error("rate limit check failed", countError);
    return err("INTERNAL", "Something went wrong. Please try again.");
  }
  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return err("RATE_LIMITED", "Too many invitations sent recently. Try again later.");
  }

  const { data: alreadyMember, error: memberCheckError } = await supabase.rpc(
    "is_email_workspace_member",
    { p_ws: workspaceId, p_email: email },
  );
  if (memberCheckError) {
    console.error("is_email_workspace_member failed", memberCheckError);
    return err("INTERNAL", "Something went wrong. Please try again.");
  }
  if (alreadyMember) {
    return err("CONFLICT", "That email is already a member of this workspace.");
  }

  const { token, tokenHash } = generateInvitationToken();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error: insertError } = await supabase.from("invitations").insert({
    workspace_id: workspaceId,
    email,
    role,
    token_hash: tokenHash,
    invited_by: user?.id,
  });

  if (insertError) {
    if (isUniqueViolation(insertError)) {
      return err("CONFLICT", "There's already a pending invitation for that email.");
    }
    if (insertError.message.includes("SEAT_LIMIT")) {
      return err("SEAT_LIMIT", "You've reached the free plan's 5-seat limit.");
    }
    console.error("createInvitation insert failed", insertError);
    return err("INTERNAL", "Something went wrong. Please try again.");
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name")
    .eq("id", workspaceId)
    .single();

  const { error: emailError } = await sendInvitationEmail({
    to: email,
    workspaceName: workspace?.name ?? "your workspace",
    role,
    token,
  });
  if (emailError) {
    // The row exists and can be resent - don't fail the whole action
    // just because the email didn't go out this time.
    console.error("sendInvitationEmail failed", emailError);
  }

  return ok();
}

export async function createInvitation(
  _prevState: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = createInvitationSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const result = await insertInvitationAndSendEmail(
    supabase,
    parsed.data.workspaceId,
    parsed.data.email.toLowerCase(),
    parsed.data.role,
  );

  if (result.ok) {
    const slug = formData.get("slug")?.toString();
    if (slug) {
      revalidatePath(`/w/${slug}/members`);
    }
  }
  return result;
}

export async function revokeInvitation(
  _prevState: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = revokeInvitationSchema.safeParse({
    invitationId: formData.get("invitationId"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", parsed.data.invitationId)
    .is("accepted_at", null)
    .is("revoked_at", null)
    .select("id");

  if (error) {
    console.error("revokeInvitation failed", error);
    return err("INTERNAL", "Something went wrong. Please try again.");
  }
  if (!data || data.length === 0) {
    return err("FORBIDDEN", "That invitation can't be revoked.");
  }

  const slug = formData.get("slug")?.toString();
  if (slug) {
    revalidatePath(`/w/${slug}/members`);
  }
  return ok();
}

export async function resendInvitation(
  _prevState: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = resendInvitationSchema.safeParse({
    invitationId: formData.get("invitationId"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();

  const { data: invitation, error: fetchError } = await supabase
    .from("invitations")
    .select("workspace_id, email, role")
    .eq("id", parsed.data.invitationId)
    .is("accepted_at", null)
    .is("revoked_at", null)
    .maybeSingle();

  if (fetchError) {
    console.error("resendInvitation fetch failed", fetchError);
    return err("INTERNAL", "Something went wrong. Please try again.");
  }
  if (!invitation) {
    return err("NOT_FOUND", "That invitation could not be found.");
  }

  const { error: revokeError } = await supabase
    .from("invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", parsed.data.invitationId);

  if (revokeError) {
    console.error("resendInvitation revoke failed", revokeError);
    return err("INTERNAL", "Something went wrong. Please try again.");
  }

  const result = await insertInvitationAndSendEmail(
    supabase,
    invitation.workspace_id,
    invitation.email,
    invitation.role,
  );

  if (result.ok) {
    const slug = formData.get("slug")?.toString();
    if (slug) {
      revalidatePath(`/w/${slug}/members`);
    }
  }
  return result;
}

export async function acceptInvitation(
  _prevState: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = acceptInvitationSchema.safeParse({
    token: formData.get("token"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { data: workspaceId, error } = await supabase.rpc("accept_invitation", {
    p_token: parsed.data.token,
  });

  if (error) {
    if (error.message.includes("UNAUTHENTICATED")) {
      return err("UNAUTHENTICATED", "Please log in to accept this invitation.");
    }
    if (error.message.includes("SEAT_LIMIT")) {
      return err("SEAT_LIMIT", "This workspace has reached the free plan's 5-seat limit.");
    }
    // Not found, wrong email, expired, revoked, already accepted: one
    // generic message, same as the RPC itself never reveals which.
    return err("INVITE_INVALID", "This invitation is invalid or has expired.");
  }

  // accept_invitation returns the workspace id, not the slug - look it
  // up to redirect somewhere real. The caller is a member now, so RLS
  // allows this.
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("slug")
    .eq("id", workspaceId)
    .single();

  redirect(workspace ? `/w/${workspace.slug}` : "/workspaces");
}
