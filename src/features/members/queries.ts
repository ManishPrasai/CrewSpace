import { createClient } from "@/lib/supabase/server";

export type Member = {
  userId: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: "owner" | "admin" | "member";
  joinedAt: string;
};

// workspace_members' SELECT policy already lets any member of a workspace
// see every row for it (not just their own - needed for exactly this
// page), and profiles' co-member policy lets them see full_name/
// avatar_url for the other members too. If the caller isn't a member of
// workspaceId at all, RLS returns zero rows rather than erroring - fine
// here since the page itself is already gated by the layout's
// notFound() check before this ever runs.
//
// Two separate queries, not an embedded select: workspace_members.user_id
// and profiles.id both reference auth.users(id), but neither table
// references the other directly, so PostgREST can't auto-detect an
// embeddable relationship between them (confirmed via the actual
// PGRST200 error - "Could not find a relationship" - not assumed).
export async function getMembers(workspaceId: string): Promise<Member[]> {
  const supabase = await createClient();
  const { data: members, error } = await supabase
    .from("workspace_members")
    .select("user_id, role, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }
  if (!members || members.length === 0) {
    return [];
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in(
      "id",
      members.map((m) => m.user_id),
    );

  if (profilesError) {
    throw profilesError;
  }

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return members.map((m) => {
    const profile = profileById.get(m.user_id);
    return {
      userId: m.user_id,
      fullName: profile?.full_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      role: m.role,
      joinedAt: m.created_at,
    };
  });
}
