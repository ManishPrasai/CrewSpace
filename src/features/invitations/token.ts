import { createHash, randomBytes } from "crypto";

// 32-byte random token, stored as its SHA-256 hex hash (docs/api.md,
// docs/database.md) - the raw token only ever exists in the email link.
// Must match accept_invitation's hash exactly:
// encode(digest(p_token, 'sha256'), 'hex') in Postgres.
export function generateInvitationToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}
