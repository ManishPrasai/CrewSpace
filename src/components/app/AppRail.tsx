"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn"
import { AccountMenu } from "@/features/auth/components/AccountMenu";
import { WorkspaceSwitcher } from "@/features/workspaces/components/WorkspaceSwitcher";
import type { MyWorkspace } from "@/features/workspaces/queries";
import { BrandMark } from "./BrandMark";
import { navItems } from "./nav-items";

function isActive(pathname: string, href: string, feedHref: string): boolean {
  if (href === feedHref) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

// handoff/02-visual-design-spec.md: 64px icon rail, 768-1023.
export function AppRail({
  current,
  workspaces,
  user,
}: {
  current: MyWorkspace;
  workspaces: MyWorkspace[];
  user: { name: string | null; email: string | null };
}) {
  const pathname = usePathname();
  const feedHref = `/w/${current.slug}`;

  return (
    <nav
      aria-label="Workspace"
      className="hidden w-16 shrink-0 flex-col items-center gap-1 py-3 md:flex lg:hidden"
    >
      <WorkspaceSwitcher current={current} workspaces={workspaces} compact />

      <div className="my-2 flex flex-1 flex-col gap-1">
        {navItems(current.slug).map((item) => {
          const active = isActive(pathname, item.href, feedHref);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              className={cn(
                "flex size-10 items-center justify-center rounded-md transition-colors",
                active
                  ? "bg-background text-foreground shadow-raised"
                  : "text-foreground-2 hover:bg-background/60 hover:text-foreground",
              )}
            >
              {active ? <BrandMark variant="leaf" size={14} /> : <Icon className="size-4" strokeWidth={1.5} />}
            </Link>
          );
        })}
      </div>

      <AccountMenu user={user} slug={current.slug} compact />
    </nav>
  );
}
