"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Mirrors w/[slug]/error.tsx - getMyWorkspaces() throws on an
// unexpected error by design; without this file that fell through to
// Next's generic default error page instead of a styled retry.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-3 px-5 py-16 text-center">
      <p className="text-[15px] font-medium">Couldn&rsquo;t load your workspaces.</p>
      <p className="max-w-[34em] text-[14.5px] text-muted-foreground">
        Try again, or come back in a moment if the problem continues.
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
