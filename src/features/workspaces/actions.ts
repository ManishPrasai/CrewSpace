"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { err, type ActionResult } from "@/lib/result";
import { isUniqueViolation } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { createWorkspaceSchema } from "./schemas";

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
