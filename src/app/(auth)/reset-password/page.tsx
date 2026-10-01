import { RequestPasswordResetForm } from "@/features/auth/components/RequestPasswordResetForm";

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex max-w-sm flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">Reset your password</h1>
      <RequestPasswordResetForm />
    </main>
  );
}
