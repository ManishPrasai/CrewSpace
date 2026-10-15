"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// handoff: S15 (shell error state).
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-[15px] font-medium">Something went wrong.</p>
      <p className="max-w-[34em] text-[14.5px] text-muted-foreground">
        Try again, or come back in a moment if the problem continues.
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
