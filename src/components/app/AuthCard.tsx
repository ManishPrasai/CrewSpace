import Link from "next/link"
import { BrandMark } from "./BrandMark"

// handoff/02-visual-design-spec.md: canvas, lockup top-left, 400px card
// (18 radius, 32 padding) centred. Edge-to-edge below 480px.
export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-10">
      <Link href="/" className="mb-6 flex items-center gap-2 text-foreground">
        <BrandMark size={24} />
        <span className="text-[15px] font-semibold tracking-[-0.02em]">Crewspace</span>
      </Link>
      <div className="w-full max-w-[400px] rounded-2xl border border-border bg-background p-6 shadow-raised sm:p-8">
        <div className="mb-6 flex flex-col gap-1.5">
          <h1 className="text-xl font-semibold tracking-[-0.02em]">{title}</h1>
          {description && <p className="text-[14px] text-muted-foreground">{description}</p>}
        </div>
        {children}
      </div>
    </main>
  );
}
