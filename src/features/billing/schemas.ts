import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  workspaceId: z.string().uuid(),
});

export const createPortalSessionSchema = z.object({
  workspaceId: z.string().uuid(),
});

export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;
export type CreatePortalSessionInput = z.infer<typeof createPortalSessionSchema>;
