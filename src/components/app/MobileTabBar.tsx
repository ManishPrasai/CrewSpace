"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn"
import { navItems } from "./nav-items";

function isActive(pathname: string, href: string, feedHref: string): boolean {
  if (href === feedHref) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

// handoff/02-visual-design-spec.md: bottom tab bar, < 768, safe-area padding.
export function MobileTabBar({ slug }: { slug: string }) {
  const pathname = usePathname();
  const feedHref = `/w/${slug}`;

  return (
    <nav
      aria-label="Workspace"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {navItems(slug).map((item) => {
        const active = isActive(pathname, item.href, feedHref);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium",
              active ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" strokeWidth={1.5} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
