import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "crypto";

// Test-only service-role client. Deliberately NOT importing
// src/lib/supabase/admin.ts - CLAUDE.md restricts that specific import to
// the Stripe webhook and push sender; this is a separate client built the
// same way, scoped to tests/e2e/ only, never reachable from a request.
//
// Why this exists: RESEND_API_KEY is a local placeholder ("invite emails
// will fail gracefully" per .env.local), and invitation tokens are only
// ever stored hashed (src/features/invitations/token.ts) - the raw token
// exists only in an email that, locally, never gets delivered. The real
// "Send invite" UI/action is still exercised for coverage; this helper
// seeds a second invitation row with a token the test controls, so the
// *accept* side (the real /invite/[token] page + the real
// accept_invitation RPC) can still be tested genuinely end-to-end.
function adminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set - did playwright.config.ts load .env.local?");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Mirrors src/features/invitations/token.ts exactly - the raw token's
// hash must match what Postgres's encode(digest(p_token,'sha256'),'hex')
// computes inside accept_invitation.
function generateToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}

export async function getWorkspaceId(slug: string): Promise<string> {
  const { data, error } = await adminClient().from("workspaces").select("id").eq("slug", slug).single();
  if (error || !data) {
    throw new Error(`Could not find workspace with slug "${slug}": ${error?.message ?? "no row"}`);
  }
  return data.id;
}

// Seeds a pending invitation row with a token this test controls, and
// returns the raw token to build a real /invite/[token] URL from.
export async function seedInvitation(opts: {
  workspaceSlug: string;
  email: string;
  role: "admin" | "member";
}): Promise<string> {
  const workspaceId = await getWorkspaceId(opts.workspaceSlug);
  const { token, tokenHash } = generateToken();

  const { error } = await adminClient().from("invitations").insert({
    workspace_id: workspaceId,
    email: opts.email.toLowerCase(),
    role: opts.role,
    token_hash: tokenHash,
  });
  if (error) {
    throw new Error(`Failed to seed invitation for ${opts.email}: ${error.message}`);
  }

  return token;
}
