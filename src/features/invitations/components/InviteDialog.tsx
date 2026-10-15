"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { InviteMemberForm } from "./InviteMemberForm";

// handoff/03-components.md: the existing InviteMemberForm inside a Dialog.
export function InviteDialog({ workspaceId, slug }: { workspaceId: string; slug: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" />}>
        <PlusIcon />
        Invite people
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite someone</DialogTitle>
          <DialogDescription>They&rsquo;ll get an email with a link to join.</DialogDescription>
        </DialogHeader>
        <InviteMemberForm
          workspaceId={workspaceId}
          slug={slug}
          onSent={() => {
            setOpen(false);
            toast.add({ title: "Invitation sent", type: "success" });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
