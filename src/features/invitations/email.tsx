import { Resend } from "resend";
import { clientEnv, serverEnv } from "@/lib/env";

const resend = new Resend(serverEnv.RESEND_API_KEY);

// Plain HTML string, not a React template: Resend's `react` option needs
// @react-email/render as a peer dependency to render JSX server-side
// (confirmed via the actual runtime error - "Failed to render React
// component" - not assumed), which isn't part of the approved stack.
// `html` needs nothing extra and does the job for a one-paragraph email.
function invitationEmailHtml({
  workspaceName,
  role,
  inviteUrl,
}: {
  workspaceName: string;
  role: string;
  inviteUrl: string;
}): string {
  return `
    <p>You've been invited to join <strong>${workspaceName}</strong> as ${role}.</p>
    <p><a href="${inviteUrl}">Accept invitation</a></p>
    <p>This link expires in 7 days. If you didn't expect this, you can ignore this email.</p>
  `;
}

export async function sendInvitationEmail({
  to,
  workspaceName,
  role,
  token,
}: {
  to: string;
  workspaceName: string;
  role: string;
  token: string;
}) {
  const inviteUrl = `${clientEnv.NEXT_PUBLIC_APP_URL}/invite/${token}`;

  return resend.emails.send({
    from: serverEnv.EMAIL_FROM,
    to,
    subject: `You're invited to join ${workspaceName}`,
    html: invitationEmailHtml({ workspaceName, role, inviteUrl }),
  });
}
