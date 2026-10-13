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
export async function getMyWorkspaces(): Promise<MyWorkspace[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("role, workspaces(id, name, slug, plan)")
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

// Relies on RLS (is_workspace_member on both tables), not a manual
// user_id filter: a non-member has no row in workspace_members for this
// workspace, so the query naturally returns null rather than needing a
// separate membership check.
export async function getWorkspaceBySlug(slug: string): Promise<MyWorkspace | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("role, workspaces!inner(id, name, slug, plan)")
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
  const { data, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data?.role ?? null;
}
