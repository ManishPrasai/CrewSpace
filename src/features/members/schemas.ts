import { z } from "zod";

export const changeMemberRoleSchema = z.object({
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["admin", "member"]),
});

export const removeMemberSchema = z.object({
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const leaveWorkspaceSchema = z.object({
  workspaceId: z.string().uuid(),
});

export type ChangeMemberRoleInput = z.infer<typeof changeMemberRoleSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
export type LeaveWorkspaceInput = z.infer<typeof leaveWorkspaceSchema>;
