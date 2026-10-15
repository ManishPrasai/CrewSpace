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
      <header className="flex h-[76px] items-center justify-between px-6 sm:px-10 lg:px-16">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark variant="full" size={24} />
          <span className="text-[18px] font-semibold tracking-[-0.045em]">Crewspace</span>
        </Link>
        <nav className="hidden items-center gap-0.5 rounded-xl border border-border-subtle bg-background p-1 text-[14px] text-foreground/80 md:flex">
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
        <div className="flex items-center gap-1.5">
          <Link href="/login" className="px-3 py-2 text-[14px]">
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

      <footer className="flex flex-col items-center justify-between gap-6 px-6 py-11 text-[14px] text-muted-foreground sm:flex-row sm:px-16">
        <div className="flex items-center gap-2 font-semibold text-foreground">
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
