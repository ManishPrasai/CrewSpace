import { createClient } from "@/lib/supabase/server";

export type Invitation = {
  id: string;
  email: string;
  role: "admin" | "member";
  expiresAt: string;
  createdAt: string;
};

// RLS (owner/admin only) already scopes this to the caller's own
// workspace membership - no extra filtering needed here.
export async function getInvitations(workspaceId: string): Promise<Invitation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invitations")
    .select("id, email, role, expires_at, created_at")
    .eq("workspace_id", workspaceId)
    .is("accepted_at", null)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    role: row.role,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  }));
}

export type InvitationPreview = {
  workspaceName: string;
  role: "admin" | "member";
  email: string;
};

// get_invitation_preview is callable by anon (not just authenticated) -
// deliberately, since /invite/[token] has to show "you're invited to X"
// before the visitor logs in or signs up. Returns null for not found/
// revoked/accepted/expired, never distinguishing which.
export async function getInvitationPreview(token: string): Promise<InvitationPreview | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_invitation_preview", { p_token: token });

  if (error) {
    throw error;
  }
  if (!data || data.length === 0) {
    return null;
  }

  const row = data[0];
  return { workspaceName: row.workspace_name, role: row.role, email: row.email };
}
