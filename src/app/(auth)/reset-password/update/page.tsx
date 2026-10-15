import { AuthCard } from "@/components/app/AuthCard";
import { UpdatePasswordForm } from "@/features/auth/components/UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <AuthCard title="Choose a new password">
      <UpdatePasswordForm />
    </AuthCard>
  );
}
