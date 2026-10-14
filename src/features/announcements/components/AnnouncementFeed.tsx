"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { loadMoreAnnouncements } from "../actions";
import { AnnouncementItem } from "./AnnouncementItem";
import type { Announcement } from "../queries";

export function AnnouncementFeed({
  workspaceId,
  slug,
  canManage,
  initialItems,
  initialCursor,
}: {
  workspaceId: string;
  slug: string;
  canManage: boolean;
  initialItems: Announcement[];
  initialCursor: string | null;
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    if (!cursor) return;
    startTransition(async () => {
      const page = await loadMoreAnnouncements(workspaceId, cursor);
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
    });
  }

  function handleUpdated(id: string, title: string, body: string) {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, title, body } : a)));
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((a) => a.id !== id));
  }

  if (items.length === 0) {
    return <p>No announcements yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <ul>
        {items.map((announcement) => (
          <AnnouncementItem
            key={announcement.id}
            announcement={announcement}
            slug={slug}
            canManage={canManage}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
          />
        ))}
      </ul>
      {cursor && (
        <Button type="button" variant="outline" onClick={handleLoadMore} disabled={isPending}>
          {isPending ? "Loading..." : "Load more"}
        </Button>
      )}
    </div>
  );
}
