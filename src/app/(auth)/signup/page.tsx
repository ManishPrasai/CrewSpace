import { AuthCard } from "@/components/app/AuthCard";
import { SignUpForm } from "@/features/auth/components/SignUpForm";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; email?: string }>;
}) {
  const { next, email } = await searchParams;

  return (
    <AuthCard>
      <SignUpForm next={next} defaultEmail={email} />
    </AuthCard>
  );
}
