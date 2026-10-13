import { createClient } from "@/lib/supabase/server";

export type MyWorkspace = {
  role: "owner" | "admin" | "member";
  id: string;
  name: string;
  slug: string;
  plan: "free" | "pro";
};

// Plain data reads, not server actions - RLS governs what comes back, so
// no ActionResult wrapping. Throws on an unexpected error (Next.js error
// boundaries handle that); there's no user-facing failure mode to shape
// here beyond "something went wrong".
//
// Every query below explicitly filters workspace_members by the current
// user's id. RLS on workspace_members scopes to "any row in a workspace
// I belong to" (intentional - any member can see the full member list,
// needed for Day 3), not "only my own row". Relying on RLS alone here
// returned every member's row once a workspace had more than one
// member, not just mine - caught via real end-to-end testing with two
// users in the same workspace, not assumed.
async function getCurrentUserId(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getMyWorkspaces(): Promise<MyWorkspace[]> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("workspace_members")
    .select("role, workspaces(id, name, slug, plan)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => {
    const workspace = Array.isArray(row.workspaces) ? row.workspaces[0] : row.workspaces;
    return {
      role: row.role,
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      plan: workspace.plan,
    };
  });
}

// A non-member has no row in workspace_members for (this workspace, me),
// so this naturally returns null - no separate membership check needed.
export async function getWorkspaceBySlug(slug: string): Promise<MyWorkspace | null> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("workspace_members")
    .select("role, workspaces!inner(id, name, slug, plan)")
    .eq("user_id", userId)
    .eq("workspaces.slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }

  const workspace = Array.isArray(data.workspaces) ? data.workspaces[0] : data.workspaces;
  return {
    role: data.role,
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    plan: workspace.plan,
  };
}

export async function getMyRole(
  workspaceId: string,
): Promise<"owner" | "admin" | "member" | null> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data?.role ?? null;
}
