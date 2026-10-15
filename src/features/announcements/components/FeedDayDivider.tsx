function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

// handoff/03-components.md: "Today / Yesterday / weekday (<=6 days) /
// full date". The App Desktop frame (D1) shows a same-year date beyond 6
// days as "Thursday 8 October" (weekday + day + month, no year) rather
// than the written spec's single illustrative "8 October 2026" example -
// that example is read as "falls back to a full date", with the year
// only added once the post crosses into a previous calendar year.
export function dayDividerLabel(isoDate: string, now = new Date()): string {
  const date = new Date(isoDate);
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays >= 2 && diffDays <= 6) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
  }
  return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export function FeedDayDivider({ date }: { date: string }) {
  return (
    <div className="mt-9 flex items-center gap-3 first:mt-0">
      <span className="font-mono text-[11.5px] text-muted-foreground">{dayDividerLabel(date)}</span>
      <div className="h-px flex-1 bg-border-subtle" />
    </div>
  );
}
