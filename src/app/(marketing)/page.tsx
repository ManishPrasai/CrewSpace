import Link from "next/link";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { Avatar } from "@/components/app/Avatar";
import { BrandMark } from "@/components/app/BrandMark";
import { Button } from "@/components/ui/button";

const CHECK = <CheckIcon className="size-4 shrink-0 text-brand-ink" aria-hidden="true" />;
const DASH = <span className="text-muted-foreground">—</span>;

// Illustrative only - static marketing mockups of the real forms, not
// live controls (handoff: "running in three steps" preview panels,
// 03-components.md's own distinction between demonstration and
// product). Not <input>/<button> elements, so they're never
// keyboard-focusable controls that imply functionality they don't have.
function Step1Preview() {
  return (
    <div className="flex h-[210px] flex-col justify-center gap-2.5 rounded-xl border border-border-subtle bg-muted p-5.5">
      <span className="text-[12.5px] font-medium">Workspace name</span>
      <div className="flex h-[38px] items-center rounded-[9px] border border-input-hover bg-background px-3 text-[14px]">
        Halden &amp; Co.
      </div>
      <div className="flex h-[38px] items-center overflow-hidden rounded-[9px] border border-input-hover bg-background font-mono text-[12.5px]">
        <span className="flex h-full items-center border-r border-border-subtle bg-muted px-2.5 text-muted-foreground">
          crewspace.app/w/
        </span>
        <span className="px-2.5">halden-co</span>
      </div>
    </div>
  );
}

function Step2Preview() {
  return (
    <div className="flex h-[210px] flex-col justify-center gap-2.5 rounded-xl border border-border-subtle bg-muted p-5.5">
      <div className="flex gap-1.5">
        <div className="flex h-[38px] flex-1 items-center rounded-[9px] border border-brand bg-background px-3 text-[14px] ring-[3px] ring-brand-soft">
          lena@halden.co
        </div>
        <div className="flex h-[38px] items-center gap-1.5 rounded-[9px] border border-input-hover bg-background px-2.5 text-[13.5px]">
          Member
          <ChevronDownIcon className="size-3 text-muted-foreground" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] text-muted-foreground">1 seat left on Free</span>
        <span className="flex h-[34px] items-center rounded-[9px] bg-primary px-3.5 text-[13px] font-medium text-primary-foreground">
          Send invite
        </span>
      </div>
    </div>
  );
}

function Step3Preview() {
  return (
    <div className="flex h-[210px] flex-col items-center justify-center rounded-xl border border-border-subtle bg-muted p-5.5">
      <div className="flex w-full flex-col rounded-[10px] border border-input-hover bg-background">
        <span className="px-3 pt-2.5 pb-0.5 text-[14px] font-semibold">Office closed Friday</span>
        <span className="px-3 pb-3 text-[13px] leading-[1.5] text-muted-foreground">
          We&rsquo;re closing for the offsite debrief. Move Friday calls to…
        </span>
        <div className="flex justify-end border-t border-border-subtle p-1.5">
          <span className="flex h-7 items-center rounded-[7px] bg-primary px-2.5 text-[12.5px] font-medium text-primary-foreground">
            Post
          </span>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Create a workspace",
    body: "Give it a name and a short URL. You become its owner.",
    preview: <Step1Preview />,
  },
  {
    n: "02",
    title: "Invite your crew",
    body: "Invite by email with the role already chosen. You can resend or revoke until they accept.",
    preview: <Step2Preview />,
  },
  {
    n: "03",
    title: "Post the official word",
    body: "Owners and admins post. Everyone reads the same feed, newest first.",
    preview: <Step3Preview />,
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

// handoff: Brand & Landing (L2), reproduced against the actual
// `C v2 - Brand & Landing.dc.html` source rather than approximated -
// the 12-column grid, column spans and pixel values below are read
// directly from that file (lines 135-273), not re-interpreted. The
// full three-layer hero visual (feed + member-details popover +
// invitation toast, absolutely positioned) only fits the way it's
// drawn at the design's own 1440px frame width - shown from
// `min-[1440px]:`, with the simpler feed+toast composition below
// that, matching L3's own note that the layers "simplify... on
// tablet" (extended here to cover anything narrower than 1440).
export default function MarketingPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <section className="px-6 pt-16 sm:px-10 sm:pt-20 lg:px-16 lg:pt-[104px]">
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:gap-y-10">
          <div className="flex items-center gap-2.5 font-mono text-[12.5px] text-[#55544F] lg:col-span-12">
            <BrandMark variant="leaf" size={14} />
            Announcements and members for small teams
          </div>

          <h1 className="text-[44px] font-semibold leading-[0.92] tracking-[-0.055em] sm:text-[64px] lg:col-span-12 lg:text-[88px] xl:text-[120px]">
            The official word,
            <br />
            for the whole{" "}
            <span className="font-accent font-normal italic tracking-[-0.025em] text-brand-ink">crew.</span>
          </h1>

          <div className="flex flex-col gap-5 lg:col-span-5 lg:col-start-8">
            <p className="text-[16px] leading-[1.55] text-[#55544F] lg:text-[17px]">
              One shared workspace where owners and admins post updates, everyone reads the same feed, and you
              always know who has access.
            </p>
            <div className="flex gap-2">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/signup" />}
                className="h-[46px] rounded-[11px] px-[18px] text-[15px]"
              >
                Create a workspace
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/login" />}
                className="h-[46px] rounded-[11px] px-[18px] text-[15px]"
              >
                Log in
              </Button>
            </div>
            <span className="text-[13px] text-muted-foreground">Free for up to five people. No card needed.</span>
          </div>
        </div>
      </section>

      <section className="px-6 pt-16 sm:px-10 lg:px-16 lg:pt-[72px]">
        {/* Full three-layer composition - matches the design's 1440px frame pixel-for-pixel. */}
        <div className="relative mx-auto hidden h-[760px] min-[1440px]:block rounded-[28px] border border-[#DFDED9] bg-[#E9E9E5] overflow-hidden">
          <div className="absolute top-[56px] left-[56px] flex h-[640px] w-[980px] overflow-hidden rounded-2xl border border-[#DCDBD6] bg-background shadow-[0_30px_60px_-40px_rgba(0,0,0,.35)]">
            <div className="flex w-[210px] flex-col gap-3.5 p-2.5">
              <div className="flex items-center gap-2.5 rounded-[10px] border border-border bg-background p-1.5">
                <span className="flex size-[26px] shrink-0 items-center justify-center rounded-lg bg-brand-soft text-[12px] font-semibold text-brand-ink">
                  H
                </span>
                <div className="flex flex-col">
                  <span className="text-[12.5px] font-semibold">Halden &amp; Co.</span>
                  <span className="text-[11px] text-muted-foreground">Owner · Free</span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 text-[12.5px]">
                <div className="flex items-center gap-2 rounded-lg bg-background px-2.5 py-1.5 font-medium shadow-[0_1px_2px_rgba(0,0,0,.05)]">
                  <span className="size-2.5 rounded-full bg-brand" />
                  Announcements
                </div>
                <div className="py-1.5 pr-2.5 pl-[27px] text-muted-foreground">Members</div>
                <div className="py-1.5 pr-2.5 pl-[27px] text-muted-foreground">Billing</div>
                <div className="py-1.5 pr-2.5 pl-[27px] text-muted-foreground">Settings</div>
              </div>
            </div>
            <div className="m-1.5 ml-0 flex flex-1 flex-col gap-5 rounded-[11px] border border-border bg-background px-14 py-8">
              <div className="flex items-center justify-between">
                <span className="text-[22px] font-semibold tracking-[-0.03em]">Announcements</span>
                <span className="rounded-[9px] bg-primary px-3 py-2 text-[12.5px] font-medium text-primary-foreground">
                  New announcement
                </span>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">TODAY</span>
              <div className="flex flex-col gap-2 border-b border-border-subtle pb-5 text-[12.5px]">
                <div className="flex items-center gap-2">
                  <Avatar id="maya-okafor" name="Maya Okafor" size={24} />
                  <span className="font-semibold">Maya Okafor</span>
                  <span className="text-muted-foreground">09:12</span>
                </div>
                <span className="pl-[35px] text-[16px] font-semibold">Studio closed Friday 24 October</span>
                <p className="pl-[35px] text-[14px] leading-[1.65] text-foreground/80">
                  We&rsquo;re closing the studio for the day so everyone can join the Lisbon offsite debrief
                  remotely. Client calls booked for Friday should move to Thursday afternoon.
                </p>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">YESTERDAY</span>
              <div className="flex flex-col gap-2 text-[12.5px]">
                <div className="flex items-center gap-2">
                  <Avatar id="daniel-reyes" name="Daniel Reyes" size={24} />
                  <span className="font-semibold">Daniel Reyes</span>
                  <span className="text-muted-foreground">16:40</span>
                </div>
                <span className="pl-[35px] text-[16px] font-semibold">New file naming for client deliverables</span>
                <p className="pl-[35px] text-[14px] leading-[1.65] text-foreground/80">
                  From today, exported files follow client-project-version-date. Past work stays where it is.
                </p>
              </div>
            </div>
          </div>

          <div className="absolute top-[120px] right-[56px] flex w-[420px] flex-col overflow-hidden rounded-[18px] border border-[#DCDBD6] bg-background shadow-[0_40px_80px_-24px_rgba(26,26,25,.4),0_4px_12px_rgba(0,0,0,.06)]">
            <div className="flex items-center gap-3 px-[18px] py-4">
              <Avatar id="daniel-reyes" name="Daniel Reyes" size={40} />
              <div className="flex flex-1 flex-col">
                <span className="text-[15px] font-semibold">Daniel Reyes</span>
                <span className="text-[12.5px] text-muted-foreground">daniel@halden.co</span>
              </div>
              <span className="flex size-7 items-center justify-center rounded-lg text-[16px] text-muted-foreground">
                ×
              </span>
            </div>
            <div className="flex gap-0.5 px-[18px] pb-3">
              <span className="rounded-lg bg-muted px-2.5 py-1.5 text-[12.5px] font-medium">Membership</span>
              <span className="px-2.5 py-1.5 text-[12.5px] text-muted-foreground">Role</span>
            </div>
            <div className="flex flex-col gap-2.5 border-t border-border-subtle bg-muted p-3">
              <div className="flex flex-col rounded-xl border border-border-subtle bg-background text-[13px]">
                <div className="flex items-center justify-between border-b border-border-subtle px-3.5 py-2.5">
                  <span className="text-muted-foreground">Role</span>
                  <span className="rounded-full bg-muted px-2 py-px text-[12px] font-medium">Admin</span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-muted-foreground">Joined</span>
                  <span>2 Mar 2026</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-border-subtle bg-background p-1.5 text-[13px]">
                <div className="flex flex-col gap-0.5 rounded-lg p-2.5 ring-[1.5px] ring-inset ring-foreground">
                  <span className="font-semibold">Admin</span>
                  <span className="text-[11.5px] text-muted-foreground">Posts and manages members</span>
                </div>
                <div className="flex flex-col gap-0.5 rounded-lg p-2.5">
                  <span className="font-semibold">Member</span>
                  <span className="text-[11.5px] text-muted-foreground">Reads and leaves</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute right-[250px] bottom-[56px] flex w-[360px] items-center gap-3 rounded-2xl bg-foreground px-4 py-3.5 text-background shadow-[0_24px_50px_-20px_rgba(0,0,0,.5)]">
            <div className="flex shrink-0">
              <Avatar id="maya-okafor" name="Maya Okafor" size={24} className="-mr-2 ring-2 ring-foreground" />
              <Avatar id="daniel-reyes" name="Daniel Reyes" size={24} className="ring-2 ring-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-medium">Invitation sent to lena@halden.co</span>
              <span className="text-[12px] text-background/60">Joining as Member · 4 of 5 seats</span>
            </div>
          </div>

          <span className="absolute top-10 left-[300px] flex size-[26px] items-center justify-center rounded-full bg-brand font-mono text-[12px] text-white shadow-[0_0_0_4px_#E9E9E5]">
            1
          </span>
          <span className="absolute top-[107px] right-[43px] flex size-[26px] items-center justify-center rounded-full bg-brand font-mono text-[12px] text-white shadow-[0_0_0_4px_#E9E9E5]">
            2
          </span>
          <span className="absolute right-[597px] bottom-[101px] flex size-[26px] items-center justify-center rounded-full bg-brand font-mono text-[12px] text-white shadow-[0_0_0_4px_#E9E9E5]">
            3
          </span>
        </div>

        {/* Simplified feed+toast composition below 1440px (L3: layers simplify below the design's own frame width). */}
        <div className="relative mx-auto w-full max-w-[860px] rounded-2xl border border-border bg-muted p-5 min-[1440px]:hidden sm:p-8">
          <div className="flex overflow-hidden rounded-xl border border-border bg-background shadow-raised">
            <div className="hidden w-[150px] shrink-0 flex-col gap-3 p-3 text-[12px] md:flex">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-1.5">
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
                  <Avatar id="maya-okafor" name="Maya Okafor" size={24} />
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
              <Avatar id="maya-okafor" name="Maya Okafor" size={24} className="-mr-2 ring-2 ring-foreground" />
              <Avatar id="daniel-reyes" name="Daniel Reyes" size={24} className="ring-2 ring-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-medium">Invitation sent to lena@halden.co</span>
              <span className="text-[12px] text-background/60">Joining as Member · 4 of 5 seats</span>
            </div>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-7 min-[1440px]:mt-[28px] sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.n} className="flex gap-3">
              <span className="pt-0.5 font-mono text-[12px] text-brand-ink">{f.n}</span>
              <div className="flex flex-col gap-1">
                <span className="text-[15px] font-semibold">{f.title}</span>
                <span className="text-[14px] leading-[1.55] text-[#55544F]">{f.body}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="what-it-is" className="px-6 pt-28 sm:px-10 lg:px-16 lg:pt-[160px]">
        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-12 lg:gap-x-6">
          <span className="font-mono text-[12px] text-muted-foreground lg:col-span-2 lg:pt-3.5">What it is</span>
          <p className="text-[28px] leading-[1.15] font-medium tracking-[-0.03em] text-foreground lg:col-span-9 lg:text-[42px] lg:leading-[1.08] xl:text-[56px]">
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

      <section id="how-it-works" className="px-6 pt-28 sm:px-10 lg:px-16 lg:pt-[160px]">
        <div className="flex flex-col gap-9 lg:gap-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-[32px] leading-none font-semibold tracking-[-0.05em] lg:text-[52px]">
              Running in three steps.
            </h2>
            <p className="max-w-[360px] text-[14.5px] leading-[1.55] text-[#55544F] lg:text-[15px]">
              Every step is a form your team has already seen, nothing to configure.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col gap-0 rounded-[20px] border border-border bg-background p-2.5">
                {s.preview}
                <div className="flex flex-col gap-1.5 px-3.5 pt-5 pb-3.5">
                  <span className="font-mono text-[12px] text-brand-ink">{s.n}</span>
                  <span className="text-[19px] font-semibold tracking-[-0.02em]">{s.title}</span>
                  <span className="text-[14.5px] leading-[1.55] text-[#55544F]">{s.body}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="px-6 pt-28 sm:px-10 lg:px-16 lg:pt-[160px]">
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-x-6">
          <div className="flex flex-col gap-4 lg:col-span-4">
            <h2 className="text-[32px] leading-[1.02] font-semibold tracking-[-0.05em] lg:text-[52px] lg:leading-none">
              Three roles.
              <br />
              <span className="font-accent font-normal italic tracking-[-0.015em] text-brand-ink">
                No guesswork.
              </span>
            </h2>
            <p className="text-[15.5px] leading-[1.6] text-[#55544F] lg:text-[16px]">
              Roles are set per workspace, so the same person can be an owner in one and a member in another. When
              something isn&rsquo;t available, Crewspace says who can do it.
            </p>
          </div>
          <div className="overflow-x-auto rounded-[20px] border border-border bg-background p-2.5 lg:col-span-7 lg:col-start-6">
            <div className="min-w-[480px]">
              <div className="grid grid-cols-[minmax(0,1fr)_72px_72px_72px] px-4.5 py-3.5 text-[13px] font-medium text-[#55544F]">
                <span />
                <span>Owner</span>
                <span>Admin</span>
                <span>Member</span>
              </div>
              <div className="flex flex-col rounded-xl border border-border-subtle bg-muted text-[14.5px]">
                {ROLE_ROWS.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[minmax(0,1fr)_72px_72px_72px] items-center border-b border-border-subtle p-4.5 last:border-b-0"
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

      <section id="pricing" className="px-6 pt-28 sm:px-10 lg:px-16 lg:pt-[160px]">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-x-4">
          <div className="flex flex-col gap-3 lg:col-span-4 lg:pr-6">
            <h2 className="text-[32px] leading-none font-semibold tracking-[-0.05em] lg:text-[52px]">
              Free until you&rsquo;re more than five.
            </h2>
            <p className="text-[15.5px] leading-[1.6] text-[#55544F] lg:text-[16px]">
              The owner upgrades from Billing. Checkout, invoices and cancellation are handled by Stripe.
            </p>
          </div>
          <div className="flex flex-col gap-4.5 rounded-[20px] border border-border bg-background p-7 lg:col-span-4 lg:col-start-5">
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-semibold">Free</span>
              <span className="font-mono text-[12px] text-muted-foreground">Up to 5 members</span>
            </div>
            <div className="flex items-center gap-3.5">
              <div className="flex">
                {["#E7DCCB", "#D3E0E4", "#E0D9E8", "#E1E8DA", "#F2ECE1"].map((c, i) => (
                  <span
                    key={i}
                    className="-ml-2.5 size-[34px] rounded-full border-2 border-background first:ml-0"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <span className="text-[36px] font-semibold tracking-[-0.04em]">5</span>
            </div>
            <p className="border-t border-border-subtle pt-3.5 text-[14px] leading-[1.85] text-foreground/80">
              Announcements feed
              <br />
              Invitations and roles
              <br />
              Multiple workspaces per account
            </p>
            <Button
              className="mt-auto h-11 rounded-[11px] text-[15px]"
              nativeButton={false}
              render={<Link href="/signup" />}
            >
              Create a workspace
            </Button>
          </div>
          <div className="flex flex-col gap-4.5 rounded-[20px] bg-foreground p-7 text-background lg:col-span-4 lg:col-start-9">
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-semibold">Pro</span>
              <span className="font-mono text-[12px] text-background/50">Monthly</span>
            </div>
            <div className="flex items-center gap-3.5">
              <div className="flex">
                {["#E7DCCB", "#D3E0E4", "#E0D9E8", "#E1E8DA", "#F2ECE1"].map((c, i) => (
                  <span
                    key={i}
                    className="-ml-2.5 size-[34px] rounded-full border-2 border-foreground first:ml-0"
                    style={{ backgroundColor: c }}
                  />
                ))}
                <span className="-ml-2.5 flex size-[34px] items-center justify-center rounded-full border-2 border-foreground bg-brand text-[12px] font-semibold text-foreground">
                  +
                </span>
              </div>
              <span className="text-[36px] font-semibold tracking-[-0.04em]">6+</span>
            </div>
            <p className="border-t border-background/15 pt-3.5 text-[14px] leading-[1.85] text-background/70">
              Everything in Free
              <br />
              More than five members
              <br />
              Manage or cancel in Stripe&rsquo;s portal
            </p>
            <Button
              className="mt-auto h-11 rounded-[11px] bg-background text-[15px] text-foreground hover:bg-background/90"
              nativeButton={false}
              render={<Link href="/signup" />}
            >
              Start on Free, upgrade later
            </Button>
          </div>
        </div>
      </section>

      <section className="px-6 pt-28 pb-8 sm:px-10 lg:px-16 lg:pt-[160px]">
        <div className="flex flex-col gap-8 border-t border-foreground pt-10 lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-6">
          <h2 className="text-[40px] leading-[0.92] font-semibold tracking-[-0.055em] lg:col-span-9 lg:text-[72px] xl:text-[104px]">
            Give your crew
            <br />
            one place to{" "}
            <span className="font-accent font-normal italic tracking-[-0.025em] text-brand-ink">look.</span>
          </h2>
          <div className="flex flex-col gap-2.5 lg:col-span-3 lg:col-start-10">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/signup" />}
              className="h-12 rounded-xl text-[15.5px]"
            >
              Create a workspace
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/login" />}
              className="h-12 rounded-xl text-[15.5px]"
            >
              Log in
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
