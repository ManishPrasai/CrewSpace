import Link from "next/link";

export default function MarketingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Crewspace</h1>
      <p className="text-muted-foreground">
        Invite your team, post announcements, and manage members in one shared workspace.
      </p>
      <div className="flex gap-3">
        <Link href="/login" className="underline">
          Log in
        </Link>
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </div>
    </main>
  );
}
