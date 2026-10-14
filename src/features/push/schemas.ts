import { z } from "zod";

export const savePushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
});

export const deletePushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
});

export type SavePushSubscriptionInput = z.infer<typeof savePushSubscriptionSchema>;
export type DeletePushSubscriptionInput = z.infer<typeof deletePushSubscriptionSchema>;
