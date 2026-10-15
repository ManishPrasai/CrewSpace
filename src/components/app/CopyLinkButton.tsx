"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

// handoff/05-dependencies.md section A: Clipboard API, frontend-only.
export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
      toast.add({ title: "Link copied", type: "success" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.add({ title: "Couldn't copy the link", type: "error" });
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <CheckIcon /> : <CopyIcon />}
      Copy
    </Button>
  );
}
