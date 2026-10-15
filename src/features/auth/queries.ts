import { createClient } from "@/lib/supabase/server";

export type MyProfile = {
  fullName: string | null;
  email: string | null;
};

export async function getMyProfile(): Promise<MyProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  if (error) {
    throw error;
  }

  return { fullName: profile.full_name, email: user.email ?? null };
}
