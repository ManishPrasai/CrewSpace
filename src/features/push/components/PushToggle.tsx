"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deletePushSubscription, savePushSubscription } from "../actions";

// Read directly rather than through @/lib/env's clientEnv: that module
// also defines the server secrets schema, and importing it into a real
// client component (this is the first one in the app to need any env
// var) drags the whole thing into the client bundle. Next.js statically
// inlines NEXT_PUBLIC_* vars at build time regardless of import style.
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output: Uint8Array<ArrayBuffer> = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

export function PushToggle() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }
    setSupported(true);

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setSubscribed(subscription !== null))
      .catch(() => {});
  }, []);

  function handleEnable() {
    setError(null);
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setError("Notifications permission was not granted.");
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        const json = subscription.toJSON();
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
          setError("This browser returned an incomplete subscription.");
          return;
        }

        const result = await savePushSubscription({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        });
        if (!result.ok) {
          setError(result.error.message);
          return;
        }
        setSubscribed(true);
      } catch {
        setError("Could not enable notifications on this device.");
      }
    });
  }

  function handleDisable() {
    setError(null);
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await deletePushSubscription(subscription.endpoint);
          await subscription.unsubscribe();
        }
        setSubscribed(false);
      } catch {
        setError("Could not disable notifications on this device.");
      }
    });
  }

  if (!supported) {
    return (
      <p className="text-sm text-muted-foreground">
        Push notifications aren&apos;t supported in this browser.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant={subscribed ? "outline" : "default"}
        onClick={subscribed ? handleDisable : handleEnable}
        disabled={isPending}
      >
        {isPending
          ? "Working..."
          : subscribed
            ? "Disable notifications on this device"
            : "Enable notifications on this device"}
      </Button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
