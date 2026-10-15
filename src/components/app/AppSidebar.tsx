"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { AccountMenu } from "@/features/auth/components/AccountMenu";
import { WorkspaceSwitcher } from "@/features/workspaces/components/WorkspaceSwitcher";
import type { MyWorkspace } from "@/features/workspaces/queries";
import { BrandMark } from "./BrandMark";
import { navItems } from "./nav-items";

function isActive(pathname: string, href: string, feedHref: string): boolean {
  if (href === feedHref) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

// handoff/02-visual-design-spec.md: 264px sidebar (232 at 1024-1279).
// Active item: raised white pill + leaf marker. Seat card only on Free
// at >=4/5 seats.
export function AppSidebar({
  current,
  workspaces,
  user,
  seatsUsed,
}: {
  current: MyWorkspace;
  workspaces: MyWorkspace[];
  user: { name: string | null; email: string | null };
  seatsUsed?: number;
}) {
  const pathname = usePathname();
  const feedHref = `/w/${current.slug}`;
  const showSeatCard = current.plan === "free" && (seatsUsed ?? 0) >= 4;

  return (
    <nav
      aria-label="Workspace"
      className="hidden w-[232px] shrink-0 flex-col gap-1 p-3 lg:flex lg:w-[264px]"
    >
      <div className="mb-2">
        <WorkspaceSwitcher current={current} workspaces={workspaces} />
      </div>

      {navItems(current.slug).map((item) => {
        const active = isActive(pathname, item.href, feedHref);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-[14px] font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-raised"
                : "text-foreground-2 hover:bg-background/60 hover:text-foreground",
            )}
          >
            {active ? <BrandMark variant="leaf" size={14} /> : <Icon className="size-4" strokeWidth={1.5} />}
            {item.label}
          </Link>
        );
      })}

      {showSeatCard && (
        <div className="mt-2 flex flex-col gap-2 rounded-lg border border-border-subtle bg-background p-3">
          <p className="text-[13px] font-medium">{seatsUsed} / 5 seats used</p>
          <Link href={`/w/${current.slug}/billing`} className="text-[13px] text-brand-ink hover:underline">
            Upgrade to Pro
          </Link>
        </div>
      )}

      <div className="mt-auto flex items-center gap-2 px-1 pt-2">
        <AccountMenu user={user} slug={current.slug} />
        <span className="truncate text-[13px] text-muted-foreground">{user.name ?? user.email}</span>
      </div>
    </nav>
  );
}
