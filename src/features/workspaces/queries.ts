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
