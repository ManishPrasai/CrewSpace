import Link from "next/link";
import { AuthCard } from "@/components/app/AuthCard";
import { AuthNotice } from "@/components/app/AuthNotice";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { clientEnv } from "@/lib/env";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; email?: string }>;
}) {
  const { next, error, email } = await searchParams;

  return (
    <AuthCard title="Welcome back" description="Log in to Crewspace.">
      <div className="mb-4 flex flex-col gap-2 empty:mb-0">
        <AuthNotice code={error} />
      </div>
      <LoginForm next={next} defaultEmail={email} authProviders={clientEnv.NEXT_PUBLIC_AUTH_PROVIDERS} />
      <p className="mt-5 text-center text-[13.5px] text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="text-brand-ink underline">
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
