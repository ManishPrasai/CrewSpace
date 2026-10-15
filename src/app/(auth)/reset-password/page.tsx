import { AuthCard } from "@/components/app/AuthCard";
import { RequestPasswordResetForm } from "@/features/auth/components/RequestPasswordResetForm";

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Reset your password" description="We'll email you a link to choose a new one.">
      <RequestPasswordResetForm />
    </AuthCard>
  );
}
