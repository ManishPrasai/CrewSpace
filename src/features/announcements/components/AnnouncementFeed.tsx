"use client";

import { useState, useTransition } from "react";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { loadMoreAnnouncements } from "../actions";
import { AnnouncementItem } from "./AnnouncementItem";
import { FeedDayDivider, dayDividerLabel } from "./FeedDayDivider";
import type { Announcement } from "../queries";

export function AnnouncementFeed({
  workspaceId,
  workspaceName,
  slug,
  canManage,
  initialItems,
  initialCursor,
}: {
  workspaceId: string;
  workspaceName: string;
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
    return (
      <EmptyState
        variant="feedFirstPost"
        title={canManage ? "Your first announcement goes here" : "No announcements yet"}
        description={
          canManage
            ? `Everyone in ${workspaceName} reads it in this feed, newest first. Start with something useful: a welcome, a schedule or a decision.`
            : `Official updates from the owners and admins of ${workspaceName} will appear here.`
        }
      />
    );
  }

  // Grouped into one <ul> per day so the divider (a sibling, not a list
  // item) never ends up nested inside an <li> - <li> can't directly
  // contain another <li> without an intervening <ul>/<ol>.
  const groups: { key: string; date: string; items: Announcement[] }[] = [];
  for (const announcement of items) {
    const day = dayDividerLabel(announcement.createdAt);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.key === day) {
      lastGroup.items.push(announcement);
    } else {
      groups.push({ key: day, date: announcement.createdAt, items: [announcement] });
    }
  }

  return (
    <div className="flex flex-col">
      {groups.map((group) => (
        <div key={group.key + group.date}>
          <FeedDayDivider date={group.date} />
          <ol>
            {group.items.map((announcement) => (
              <AnnouncementItem
                key={announcement.id}
                announcement={announcement}
                slug={slug}
                canManage={canManage}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            ))}
          </ol>
        </div>
      ))}
      <div className="flex justify-center pt-5">
        {cursor ? (
          <Button type="button" variant="outline" onClick={handleLoadMore} disabled={isPending}>
            {isPending ? "Loading..." : "Load older announcements"}
          </Button>
        ) : (
          <p className="text-[13.5px] text-muted-foreground">That&rsquo;s everything.</p>
        )}
      </div>
    </div>
  );
}
