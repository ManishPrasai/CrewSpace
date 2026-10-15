import Link from "next/link";
import { AuthCard } from "@/components/app/AuthCard";
import { RoleBadge } from "@/components/app/RoleBadge";
import { WorkspaceMonogram } from "@/components/app/WorkspaceMonogram";
import { AcceptInvitationForm } from "@/features/invitations/components/AcceptInvitationForm";
import { getInvitationPreview } from "@/features/invitations/queries";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
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
      <AuthCard title="Invitation invalid">
        <p className="text-[14.5px] text-muted-foreground">This invitation is invalid or has expired.</p>
      </AuthCard>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const next = `/invite/${token}`;
  const isWrongAccount = user && user.email?.toLowerCase() !== preview.email.toLowerCase();

  return (
    <AuthCard title="You're invited">
      <div className="mb-5 flex items-center gap-3 rounded-lg border border-border-subtle bg-inset p-3">
        <WorkspaceMonogram name={preview.workspaceName} slug={preview.workspaceName} size={40} />
        <div className="flex flex-col gap-0.5">
          <p className="text-[14.5px] font-medium">{preview.workspaceName}</p>
          <RoleBadge role={preview.role} />
        </div>
      </div>

      {isWrongAccount ? (
        // handoff/08-authentication.md F9: the invite is for a different
        // email than the one currently signed in. accept_invitation
        // enforces this server-side regardless - this just explains why
        // up front instead of letting a doomed Accept attempt fail blind.
        <div className="flex flex-col gap-3">
          <p className="text-[14.5px] text-muted-foreground">
            You&apos;re signed in as <strong className="text-foreground">{user.email}</strong>, but this
            invitation was sent to <strong className="text-foreground">{preview.email}</strong>.
          </p>
          <LogoutButton next={next}>Log out and switch account</LogoutButton>
        </div>
      ) : user ? (
        <AcceptInvitationForm token={token} />
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-[14.5px] text-muted-foreground">
            Log in or create an account with {preview.email} to accept.
          </p>
          <div className="flex gap-2">
            <Link
              href={`/login?next=${encodeURIComponent(next)}&email=${encodeURIComponent(preview.email)}`}
              className="flex-1 rounded-md border border-input px-3 py-2 text-center text-[14px] font-medium hover:bg-muted"
            >
              Log in
            </Link>
            <Link
              href={`/signup?next=${encodeURIComponent(next)}&email=${encodeURIComponent(preview.email)}`}
              className="flex-1 rounded-md bg-primary px-3 py-2 text-center text-[14px] font-medium text-primary-foreground hover:bg-primary-hover"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </AuthCard>
  );
}
