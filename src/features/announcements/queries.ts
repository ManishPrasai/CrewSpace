import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

export type Announcement = {
  id: string;
  authorId: string | null;
  authorName: string | null;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type AnnouncementPage = {
  items: Announcement[];
  nextCursor: string | null;
};

// Cursor pagination on created_at, 20 per page (docs/api.md). profiles and
// announcements both reference auth.users separately with no FK between
// them, so PostgREST can't embed one in the other - same two-query merge
// used for workspace_members + profiles in features/members/queries.ts.
export async function getAnnouncements(
  workspaceId: string,
  cursor?: string,
): Promise<AnnouncementPage> {
  const supabase = await createClient();

  let query = supabase
    .from("announcements")
    .select("id, author_id, title, body, created_at, updated_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data: rows, error } = await query;
  if (error) {
    throw error;
  }
  if (!rows || rows.length === 0) {
    return { items: [], nextCursor: null };
  }

  const authorIds = [...new Set(rows.map((r) => r.author_id).filter((id): id is string => id !== null))];
  const { data: profiles, error: profilesError } =
    authorIds.length > 0
      ? await supabase.from("profiles").select("id, full_name").in("id", authorIds)
      : { data: [], error: null };
  if (profilesError) {
    throw profilesError;
  }

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const items = rows.map((r) => ({
    id: r.id,
    authorId: r.author_id,
    authorName: r.author_id ? (nameById.get(r.author_id) ?? null) : null,
    title: r.title,
    body: r.body,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  return {
    items,
    nextCursor: rows.length === PAGE_SIZE ? rows[rows.length - 1].created_at : null,
  };
}
