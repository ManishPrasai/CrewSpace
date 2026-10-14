import { z } from "zod";

export const createAnnouncementSchema = z.object({
  workspaceId: z.string().uuid(),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(5000),
});

export const updateAnnouncementSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(5000),
});

export const deleteAnnouncementSchema = z.object({
  id: z.string().uuid(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type DeleteAnnouncementInput = z.infer<typeof deleteAnnouncementSchema>;
