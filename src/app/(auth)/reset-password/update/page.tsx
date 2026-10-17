import { AuthCard } from "@/components/app/AuthCard";
import { UpdatePasswordForm } from "@/features/auth/components/UpdatePasswordForm";

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthCard title="Choose a new password">
      <UpdatePasswordForm next={next} />
    </AuthCard>
  );
}
