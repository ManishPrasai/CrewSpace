import Link from "next/link";
import { BrandMark } from "@/components/app/BrandMark";

// handoff/02-visual-design-spec.md + the Brand & Landing frame (L2): a
// 76px nav (logo, anchor links into the one page below, Log in/Sign
// up) and a matching footer. There's only one real marketing route, so
// this layout exists to keep nav/footer out of the page's own content,
// not because more marketing pages are coming.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="mx-auto grid h-[76px] w-full max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-6 sm:px-10 lg:px-16">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark variant="full" size={26} />
          <span className="text-[20px] font-semibold tracking-[-0.045em]">Crewspace</span>
        </Link>
        <nav className="hidden items-center gap-0.5 rounded-xl border border-border bg-background p-1 text-[14px] text-[#3B3A37] md:flex">
          <a href="#what-it-is" className="rounded-lg px-3.5 py-1.5 hover:bg-muted">
            Product
          </a>
          <a href="#how-it-works" className="rounded-lg px-3.5 py-1.5 hover:bg-muted">
            How it works
          </a>
          <a href="#roles" className="rounded-lg px-3.5 py-1.5 hover:bg-muted">
            Roles
          </a>
          <a href="#pricing" className="rounded-lg px-3.5 py-1.5 hover:bg-muted">
            Pricing
          </a>
        </nav>
        <div className="flex items-center justify-end gap-1.5">
          <Link href="/login" className="px-3.5 py-2 text-[14px]">
            Log in
          </Link>
          <Link
            href="/signup"
            className="flex h-[38px] items-center rounded-[10px] bg-primary px-4 text-[14px] font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Sign up
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-6 px-6 pt-16 pb-11 text-[14px] text-[#55544F] sm:flex-row sm:px-10 lg:px-16 lg:pt-24">
        <div className="flex items-center gap-2 font-semibold tracking-[-0.035em] text-foreground">
          <BrandMark variant="full" size={20} />
          Crewspace
        </div>
        <div className="flex gap-6">
          <Link href="/login">Log in</Link>
          <Link href="/signup">Sign up</Link>
          <a href="#pricing">Pricing</a>
        </div>
        <span className="font-mono text-[12px]">© 2026 Crewspace</span>
      </footer>
    </div>
  );
}
