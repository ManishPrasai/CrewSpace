import Link from "next/link";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const CHECK = <CheckIcon className="size-4 shrink-0 text-brand-ink" aria-hidden="true" />;
const DASH = <span className="text-muted-foreground">—</span>;

const STEPS = [
  {
    n: "01",
    title: "Create a workspace",
    body: "Give it a name and a short URL. You become its owner.",
  },
  {
    n: "02",
    title: "Invite your crew",
    body: "Invite by email with the role already chosen. You can resend or revoke until they accept.",
  },
  {
    n: "03",
    title: "Post the official word",
    body: "Owners and admins post. Everyone reads the same feed, newest first.",
  },
];

const FEATURES = [
  {
    n: "01",
    title: "One feed, newest first",
    body: "Grouped by day, each post signed with its author's name and time.",
  },
  {
    n: "02",
    title: "Each person in one place",
    body: "Role, membership and removal all live in a member's details, not in the list.",
  },
  {
    n: "03",
    title: "Seats you can count",
    body: "Every invitation shows how many seats are left on your plan.",
  },
];

const ROLE_ROWS: { label: string; owner: boolean; admin: boolean; member: boolean }[] = [
  { label: "Read announcements, see members", owner: true, admin: true, member: true },
  { label: "Post, edit, delete announcements", owner: true, admin: true, member: false },
  { label: "Invite and remove members", owner: true, admin: true, member: false },
  { label: "Rename the workspace", owner: true, admin: true, member: false },
  { label: "Change roles", owner: true, admin: false, member: false },
  { label: "Billing and subscription", owner: true, admin: false, member: false },
  { label: "Delete the workspace", owner: true, admin: false, member: false },
];

// handoff: Brand & Landing (L2). The hero's three overlapping panels
// (feed, member details, invitation toast) are explicitly allowed to
// simplify to just the feed plus the toast below 1024px (L3's own
// note) - applied here at every size, one composition instead of two,
// since the full three-layer version is a lot of positioning for a
// marketing page that isn't the product itself.
export default function MarketingPage() {
  return (
    <>
      <section className="px-6 pt-16 sm:px-10 sm:pt-20 lg:px-16 lg:pt-24">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5">
              <span className="flex items-center gap-2.5 font-mono text-[12.5px] text-muted-foreground">
                <span className="size-3.5 rounded-full bg-brand" aria-hidden="true" />
                Announcements and members for small teams
              </span>
              <h1 className="text-[44px] font-semibold leading-[0.95] tracking-[-0.05em] sm:text-[72px] lg:text-[100px]">
                The official word,
                <br />
                for the whole{" "}
                <span className="font-accent font-normal italic tracking-[-0.025em] text-brand-ink">crew.</span>
              </h1>
            </div>
            <div className="flex max-w-[380px] flex-col gap-5">
              <p className="text-[16px] leading-[1.55] text-muted-foreground">
                One shared workspace where owners and admins post updates, everyone reads the same feed, and you
                always know who has access.
              </p>
              <div className="flex gap-2.5">
                <Button size="lg" render={<Link href="/signup" />}>
                  Create a workspace
                </Button>
                <Button size="lg" variant="outline" render={<Link href="/login" />}>
                  Log in
                </Button>
              </div>
              <span className="text-[13px] text-muted-foreground">Free for up to five people. No card needed.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pt-16 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-7">
          <div className="relative mx-auto hidden w-full max-w-[860px] rounded-2xl border border-border-subtle bg-muted/60 p-5 sm:block sm:p-8">
            <div className="flex overflow-hidden rounded-xl border border-border-subtle bg-background shadow-raised">
              <div className="hidden w-[150px] shrink-0 flex-col gap-3 p-3 text-[12px] md:flex">
                <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-muted/60 p-1.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-soft text-[11px] font-semibold text-brand-ink">
                    H
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold">Halden &amp; Co.</span>
                    <span className="text-muted-foreground">Owner · Free</span>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="rounded-md bg-muted px-2 py-1.5 font-medium">Announcements</span>
                  <span className="px-2 py-1.5 pl-6 text-muted-foreground">Members</span>
                  <span className="px-2 py-1.5 pl-6 text-muted-foreground">Billing</span>
                </div>
              </div>
              <div className="flex-1 border-l border-border-subtle p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="text-[19px] font-semibold tracking-[-0.02em]">Announcements</span>
                  <span className="rounded-md bg-primary px-2.5 py-1.5 text-[12px] font-medium text-primary-foreground">
                    New announcement
                  </span>
                </div>
                <div className="mt-4 flex flex-col gap-2 border-b border-border-subtle pb-4 text-[12.5px]">
                  <span className="font-mono text-[11px] text-muted-foreground">TODAY</span>
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#E7DCCB] text-[9.5px] font-semibold">
                      MO
                    </span>
                    <span className="font-semibold">Maya Okafor</span>
                    <span className="text-muted-foreground">09:12</span>
                  </div>
                  <span className="pl-8 text-[14px] font-semibold">Studio closed Friday 24 October</span>
                  <p className="pl-8 text-[13px] leading-[1.6] text-foreground/80">
                    We&rsquo;re closing the studio for the day so everyone can join the Lisbon offsite debrief
                    remotely.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -right-3 -bottom-5 flex w-[280px] items-center gap-3 rounded-xl bg-foreground p-3.5 text-background shadow-raised sm:-right-6">
              <div className="flex shrink-0">
                <span className="-mr-2 size-6 rounded-full border-2 border-foreground bg-[#E7DCCB]" />
                <span className="size-6 rounded-full border-2 border-foreground bg-[#D3E0E4]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-medium">Invitation sent to lena@halden.co</span>
                <span className="text-[12px] text-background/60">Joining as Member · 4 of 5 seats</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-7 pt-4 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.n} className="flex gap-3">
                <span className="pt-0.5 font-mono text-[12px] text-brand-ink">{f.n}</span>
                <div className="flex flex-col gap-1">
                  <span className="text-[15px] font-semibold">{f.title}</span>
                  <span className="text-[14px] leading-[1.55] text-muted-foreground">{f.body}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="what-it-is" className="px-6 pt-28 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-3">
          <span className="font-mono text-[12px] text-muted-foreground">What it is</span>
          <p className="text-[28px] font-medium leading-[1.15] tracking-[-0.03em] text-foreground sm:text-[40px]">
            <span className="text-muted-foreground">
              Crewspace isn&rsquo;t chat, and it isn&rsquo;t a project tool. It&rsquo;s
            </span>{" "}
            one feed <span className="text-muted-foreground">and</span>{" "}
            <span className="font-accent font-normal italic tracking-[-0.01em] text-brand-ink">
              the people allowed to read it.
            </span>
          </p>
        </div>
      </section>

      <section id="how-it-works" className="px-6 pt-28 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-9">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-[32px] font-semibold tracking-[-0.03em] sm:text-[40px]">Running in three steps.</h2>
            <p className="max-w-[320px] text-[14.5px] leading-[1.55] text-muted-foreground">
              Every step is a form your team has already seen, nothing to configure.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col gap-4 rounded-2xl border border-border-subtle p-2.5">
                <div className="flex h-[150px] items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
                  <span className="font-mono text-[12px]">UI preview</span>
                </div>
                <div className="flex flex-col gap-1.5 p-2">
                  <span className="font-mono text-[12px] text-brand-ink">{s.n}</span>
                  <span className="text-[17px] font-semibold tracking-[-0.02em]">{s.title}</span>
                  <span className="text-[14px] leading-[1.55] text-muted-foreground">{s.body}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="px-6 pt-28 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
          <div className="flex flex-col gap-4">
            <h2 className="text-[32px] font-semibold leading-[1.02] tracking-[-0.03em] sm:text-[40px]">
              Three roles.
              <br />
              <span className="font-accent font-normal italic tracking-[-0.015em] text-brand-ink">
                No guesswork.
              </span>
            </h2>
            <p className="text-[15.5px] leading-[1.6] text-muted-foreground">
              Roles are set per workspace, so the same person can be an owner in one and a member in another. When
              something isn&rsquo;t available, Crewspace says who can do it.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border-subtle p-2">
            <div className="min-w-[480px]">
              <div className="grid grid-cols-[minmax(0,1fr)_72px_72px_72px] px-4 py-3 text-[13px] font-medium text-muted-foreground">
                <span />
                <span>Owner</span>
                <span>Admin</span>
                <span>Member</span>
              </div>
              <div className="flex flex-col rounded-xl border border-border-subtle bg-muted/60 text-[14px]">
                {ROLE_ROWS.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[minmax(0,1fr)_72px_72px_72px] items-center border-b border-border-subtle p-4 last:border-b-0"
                  >
                    <span>{row.label}</span>
                    {row.owner ? CHECK : DASH}
                    {row.admin ? CHECK : DASH}
                    {row.member ? CHECK : DASH}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="px-6 pt-28 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-3">
            <h2 className="text-[32px] font-semibold tracking-[-0.03em] sm:text-[40px]">
              Free until you&rsquo;re more than five.
            </h2>
            <p className="text-[15.5px] leading-[1.6] text-muted-foreground">
              The owner upgrades from Billing. Checkout, invoices and cancellation are handled by Stripe.
            </p>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-border-subtle p-6">
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-semibold">Free</span>
              <span className="font-mono text-[12px] text-muted-foreground">Up to 5 members</span>
            </div>
            <span className="text-[32px] font-semibold tracking-[-0.04em]">5</span>
            <p className="border-t border-border-subtle pt-3.5 text-[14px] leading-[1.75] text-foreground/80">
              Announcements feed
              <br />
              Invitations and roles
              <br />
              Multiple workspaces per account
            </p>
            <Button className="mt-auto" render={<Link href="/signup" />}>
              Create a workspace
            </Button>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl bg-foreground p-6 text-background">
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-semibold">Pro</span>
              <span className="font-mono text-[12px] text-background/50">Monthly</span>
            </div>
            <span className="text-[32px] font-semibold tracking-[-0.04em]">6+</span>
            <p className="border-t border-background/15 pt-3.5 text-[14px] leading-[1.75] text-background/70">
              Everything in Free
              <br />
              More than five members
              <br />
              Manage or cancel in Stripe&rsquo;s portal
            </p>
            <Button
              className="mt-auto bg-background text-foreground hover:bg-background/90"
              render={<Link href="/signup" />}
            >
              Start on Free, upgrade later
            </Button>
          </div>
        </div>
      </section>

      <section className="px-6 pt-28 pb-8 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-8 border-t border-foreground pt-10 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-[40px] font-semibold leading-[0.95] tracking-[-0.05em] sm:text-[64px] lg:text-[84px]">
            Give your crew
            <br />
            one place to{" "}
            <span className="font-accent font-normal italic tracking-[-0.025em] text-brand-ink">look.</span>
          </h2>
          <div className="flex flex-col gap-2.5 sm:w-[220px]">
            <Button size="lg" render={<Link href="/signup" />}>
              Create a workspace
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/login" />}>
              Log in
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
