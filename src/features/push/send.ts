import webpush, { WebPushError } from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientEnv, serverEnv } from "@/lib/env";

webpush.setVapidDetails(
  serverEnv.VAPID_SUBJECT,
  clientEnv.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  serverEnv.VAPID_PRIVATE_KEY,
);

// Fire-and-logged, never thrown: the caller (createAnnouncement) must
// never fail because a push happened to fail (docs/api.md).
export async function sendAnnouncementPush(
  workspaceId: string,
  announcement: { title: string; body: string },
  authorId: string,
): Promise<void> {
  try {
    const admin = createAdminClient();

    const { data: members, error: membersError } = await admin
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", workspaceId);
    if (membersError) throw membersError;

    const recipientIds = (members ?? [])
      .map((m) => m.user_id)
      .filter((id) => id !== authorId);
    if (recipientIds.length === 0) return;

    const { data: subscriptions, error: subscriptionsError } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .in("user_id", recipientIds);
    if (subscriptionsError) throw subscriptionsError;
    if (!subscriptions || subscriptions.length === 0) return;

    const { data: workspace } = await admin
      .from("workspaces")
      .select("slug")
      .eq("id", workspaceId)
      .single();

    const payload = JSON.stringify({
      title: announcement.title,
      body: announcement.body.slice(0, 120),
      url: `/w/${workspace?.slug ?? ""}`,
    });

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush
          .sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
          )
          .catch((error: unknown) => {
            // Tag which subscription a 404/410 (gone) came from so the
            // cleanup pass below knows which row to delete.
            if (error instanceof WebPushError && (error.statusCode === 404 || error.statusCode === 410)) {
              return { staleSubscriptionId: sub.id as string };
            }
            throw error;
          }),
      ),
    );

    const staleIds = results
      .filter(
        (r): r is PromiseFulfilledResult<{ staleSubscriptionId: string }> =>
          r.status === "fulfilled" && typeof r.value === "object" && "staleSubscriptionId" in r.value,
      )
      .map((r) => r.value.staleSubscriptionId);

    if (staleIds.length > 0) {
      await admin.from("push_subscriptions").delete().in("id", staleIds);
    }
  } catch (error) {
    console.error("sendAnnouncementPush failed", error);
  }
}
