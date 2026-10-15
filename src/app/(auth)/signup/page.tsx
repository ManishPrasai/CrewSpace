import Link from "next/link";
import { AuthCard } from "@/components/app/AuthCard";
import { SignUpForm } from "@/features/auth/components/SignUpForm";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; email?: string }>;
}) {
  const { next, email } = await searchParams;

  return (
    <AuthCard title="Create your account" description="Free for workspaces of up to five people.">
      <SignUpForm next={next} defaultEmail={email} />
      <p className="mt-5 text-center text-[13.5px] text-muted-foreground">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="text-brand-ink hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
