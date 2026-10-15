import { notFound } from "next/navigation";
import { AppRail } from "@/components/app/AppRail";
import { AppSidebar } from "@/components/app/AppSidebar";
import { MobileTabBar } from "@/components/app/MobileTabBar";
import { getMyProfile } from "@/features/auth/queries";
import { AccountMenu } from "@/features/auth/components/AccountMenu";
import { getBillingInfo } from "@/features/billing/queries";
import { WorkspaceSwitcher } from "@/features/workspaces/components/WorkspaceSwitcher";
import { getMyWorkspaces, getWorkspaceBySlug } from "@/features/workspaces/queries";

// handoff/02-visual-design-spec.md layout:
// - >=1024: 264px sidebar (232 at 1024-1279), white content panel
//   (1px border, 14px radius) inset 8px from the viewport.
// - 768-1023: 64px icon rail, content panel full-bleed.
// - <768: 56px top bar (switcher + avatar), white content sheet
//   (22px top radius), bottom tab bar, safe-area padding.
export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // The actual authorization gate: middleware only checks "is there a
  // session", not "is this user a member of this specific workspace".
  // getWorkspaceBySlug returns null for both "doesn't exist" and "exists
  // but I'm not a member" - RLS makes those indistinguishable on purpose.
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) {
    notFound();
  }

  const [workspaces, profile, billing] = await Promise.all([
    getMyWorkspaces(),
    getMyProfile(),
    getBillingInfo(workspace.id),
  ]);

  const user = { name: profile?.fullName ?? null, email: profile?.email ?? null };

  return (
    <div className="min-h-screen bg-canvas">
      {/* handoff/06-accessibility-and-qa.md: first tab stop, moves focus
          to main#content - only visible while focused. */}
      <a
        href="#content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-foreground focus-visible:px-3 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-background"
      >
        Skip to content
      </a>
      {/* Mobile top bar (<768) - no dedicated component, just this one spot. */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
        <WorkspaceSwitcher current={workspace} workspaces={workspaces} compact />
        <AccountMenu user={user} slug={slug} compact />
      </div>

      <div className="flex lg:p-2">
        <AppSidebar current={workspace} workspaces={workspaces} user={user} seatsUsed={billing.seatsUsed} />
        <AppRail current={workspace} workspaces={workspaces} user={user} />

        <main
          id="content"
          tabIndex={-1}
          className="min-h-screen flex-1 overflow-hidden rounded-t-[22px] bg-background pb-20 outline-none md:min-h-0 md:rounded-none md:pb-0 lg:rounded-xl lg:border lg:border-border lg:shadow-raised"
        >
          {children}
        </main>
      </div>

      <MobileTabBar slug={slug} />
    </div>
  );
}
