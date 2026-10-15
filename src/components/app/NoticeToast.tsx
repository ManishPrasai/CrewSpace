"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/toast";

// handoff/05-dependencies.md R14: redirecting actions (ones that can't
// stay on the page and return state via useActionState) append
// ?notice=<code> to their existing redirect target instead. Mounted
// once in the root layout so it works regardless of which page the
// redirect lands on. Allow-listed codes only - an unrecognized value is
// silently ignored, never reflected back into the toast.
const MESSAGES: Record<string, string> = {
  posted: "Announcement posted",
  saved: "Saved",
  deleted: "Workspace deleted",
  removed: "Member removed",
  left: "You left the workspace",
  role_updated: "Role updated",
  invite_sent: "Invitation sent",
  invite_resent: "Invitation resent",
  invite_revoked: "Invitation revoked",
};

export function NoticeToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const notice = searchParams.get("notice");

  useEffect(() => {
    if (!notice) return;
    const message = MESSAGES[notice];
    if (message) {
      toast.add({ title: message, type: "success" });
    }
    const params = new URLSearchParams(searchParams);
    params.delete("notice");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // Only re-runs when the notice code itself changes - searchParams/
    // router/pathname intentionally excluded to avoid looping after the
    // replace() above changes them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notice]);

  return null;
}
