import { z } from "zod";

// Must match the DB check constraints in supabase/migrations exactly.
export const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(60),
  slug: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens only."),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
