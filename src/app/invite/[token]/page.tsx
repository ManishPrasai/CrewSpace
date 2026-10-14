import Link from "next/link";
import { AcceptInvitationForm } from "@/features/invitations/components/AcceptInvitationForm";
import { getInvitationPreview } from "@/features/invitations/queries";
import { createClient } from "@/lib/supabase/server";

// Sibling of (app), not inside it - not covered by the middleware's
// session gate, so the login-or-signup redirect here is bespoke (same
// as flagged when middleware was first built on Day 1).
export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const preview = await getInvitationPreview(token);

  if (!preview) {
    return (
      <main className="mx-auto flex max-w-sm flex-col gap-4 p-6">
        <h1 className="text-xl font-semibold">Invitation invalid</h1>
        <p>This invitation is invalid or has expired.</p>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const next = `/invite/${token}`;

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">You&apos;re invited</h1>
      <p>
        You&apos;ve been invited to join <strong>{preview.workspaceName}</strong> as{" "}
        {preview.role}.
      </p>

      {user ? (
        <AcceptInvitationForm token={token} />
      ) : (
        <div className="flex flex-col gap-2">
          <p>Log in or create an account with {preview.email} to accept.</p>
          <Link href={`/login?next=${encodeURIComponent(next)}`}>Log in</Link>
          <Link href={`/signup?next=${encodeURIComponent(next)}`}>Sign up</Link>
        </div>
      )}
    </main>
  );
}
