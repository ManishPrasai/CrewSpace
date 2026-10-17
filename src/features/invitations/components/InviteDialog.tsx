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
export function InviteDialog({
  workspaceId,
  workspaceName,
  slug,
  seatsLeft,
}: {
  workspaceId: string;
  workspaceName: string;
  slug: string;
  seatsLeft?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" />}>
        <PlusIcon />
        Invite people
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite people</DialogTitle>
          <DialogDescription>They&rsquo;ll get an email with a link to join {workspaceName}.</DialogDescription>
        </DialogHeader>
        <InviteMemberForm
          workspaceId={workspaceId}
          slug={slug}
          seatsLeft={seatsLeft}
          onSent={() => {
            setOpen(false);
            toast.add({ title: "Invitation sent", type: "success" });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
