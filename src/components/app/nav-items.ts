import { CreditCard, MessageSquare, Settings, Users } from "lucide-react";

// Shared by AppSidebar, AppRail and MobileTabBar so the four destinations
// stay in sync across breakpoints (handoff/02-visual-design-spec.md).
export function navItems(slug: string) {
  return [
    { href: `/w/${slug}`, label: "Feed", icon: MessageSquare },
    { href: `/w/${slug}/members`, label: "Members", icon: Users },
    { href: `/w/${slug}/billing`, label: "Billing", icon: CreditCard },
    { href: `/w/${slug}/settings`, label: "Settings", icon: Settings },
  ] as const;
}
