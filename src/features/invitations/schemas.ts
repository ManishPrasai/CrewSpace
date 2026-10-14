import { z } from "zod";

export const createInvitationSchema = z.object({
  workspaceId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
});

export const revokeInvitationSchema = z.object({
  invitationId: z.string().uuid(),
});

export const resendInvitationSchema = z.object({
  invitationId: z.string().uuid(),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type RevokeInvitationInput = z.infer<typeof revokeInvitationSchema>;
export type ResendInvitationInput = z.infer<typeof resendInvitationSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
