"use client";

import { useRef, useState, useTransition } from "react";
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
  const [prevInitialItems, setPrevInitialItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [isPending, startTransition] = useTransition();
  // Deleted ids never reappear even if a concurrent revalidation's fresh
  // fetch still contains the row because its own revalidatePath hasn't
  // landed yet. UUIDs are never reused, so this never needs eviction.
  const deletedIdsRef = useRef<Set<string>>(new Set());

  // Create has no client-side callback like handleUpdated/handleDeleted
  // below - its only path back to the UI is the server round-trip
  // (revalidatePath -> fresh initialItems prop). Re-seeding `items` from
  // a changed `initialItems` only on mount (the old `useState(initialItems)`
  // behavior) silently dropped every new post until a full reload. This
  // adjusts state during render (not a useEffect, which would commit one
  // stale paint first) and merges the fresh first page with any
  // already-loaded "load more" pages, deduped by id.
  if (initialItems !== prevInitialItems) {
    setPrevInitialItems(initialItems);
    const freshIds = new Set(initialItems.map((a) => a.id));
    const extra = items.filter((a) => !freshIds.has(a.id) && !deletedIdsRef.current.has(a.id));
    setItems([...initialItems, ...extra]);
  }

  function handleLoadMore() {
    if (!cursor) return;
    startTransition(async () => {
      const page = await loadMoreAnnouncements(workspaceId, cursor);
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
    });
  }

  // ponytail: an edit can briefly show pre-edit text if a concurrent
  // revalidation's fetch landed just before this one - self-heals on the
  // edit's own next revalidation, no tombstone map needed for this case.
  function handleUpdated(id: string, title: string, body: string) {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, title, body } : a)));
  }

  function handleDeleted(id: string) {
    deletedIdsRef.current.add(id);
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
