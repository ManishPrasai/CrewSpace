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
    <div className="flex h-dvh flex-col bg-canvas">
      {/* handoff/06-accessibility-and-qa.md: first tab stop, moves focus
          to main#content - only visible while focused. */}
      <a
        href="#content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-foreground focus-visible:px-3 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-background"
      >
        Skip to content
      </a>
      {/* Mobile top bar (<768) - no dedicated component, just this one spot. */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 md:hidden">
        <WorkspaceSwitcher current={workspace} workspaces={workspaces} />
        <AccountMenu user={user} slug={slug} compact />
      </div>

      {/* flex-1 here, not min-h-screen on <main> below: the previous
          version relied on <main>'s own min-h-screen to fill the
          viewport, but md:min-h-0 (added for a since-forgotten reason)
          cascades to every larger breakpoint too via Tailwind's
          min-width semantics, silently zeroing that min-height at
          every desktop size - confirmed via a real computed-style
          check (min-height came back "0px" at 1440px), not assumed.
          Giving this row flex-1 inside the column above makes it (and
          main, sidebar, rail within it) fill the real remaining
          viewport height regardless of content length, at every size.
          The outer wrapper is also h-dvh (a hard cap), not min-h-dvh:
          with only a minimum, a page taller than the viewport (e.g.
          Settings) grew this row past the viewport instead of scrolling
          internally, dragging the sidebar - and the account control
          pinned to its bottom via mt-auto - down and off-screen with it.
          Capping the column's height and giving <main> its own
          overflow-y-auto keeps the sidebar/topbar/tab-bar chrome fixed
          and scrolls only the content panel - confirmed via a real
          scroll-position check on the Settings page (previously taller
          than any viewport in this test workspace), not assumed.
          min-h-0 has to be set on THIS row too, not just on <main>:
          a flex item's min-height defaults to "auto" (its content's
          intrinsic size), not 0, so without overriding it here as well
          the row refused to shrink below main's content height even
          though main itself had min-h-0 - confirmed via getBoundingClientRect
          still reporting the full content height on this row after only
          fixing <main>. */}
      <div className="flex min-h-0 flex-1 lg:p-2">
        <AppSidebar current={workspace} workspaces={workspaces} user={user} seatsUsed={billing.seatsUsed} />
        <AppRail current={workspace} workspaces={workspaces} user={user} />

        <main
          id="content"
          tabIndex={-1}
          className="min-h-0 flex-1 overflow-y-auto rounded-t-[22px] bg-background pb-20 outline-none md:rounded-none md:pb-0 lg:rounded-xl lg:border lg:border-border lg:shadow-raised"
        >
          {children}
        </main>
      </div>

      <MobileTabBar slug={slug} />
    </div>
  );
}
