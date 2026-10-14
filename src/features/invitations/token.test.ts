import { createHash } from "crypto";
import { describe, expect, it } from "vitest";
import { generateInvitationToken } from "./token";

describe("generateInvitationToken", () => {
  it("produces a 64-char lowercase hex token and a matching 64-char hex hash", () => {
    const { token, tokenHash } = generateInvitationToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(tokenHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("the hash is sha256(token), matching what accept_invitation computes in Postgres", () => {
    const { token, tokenHash } = generateInvitationToken();
    expect(tokenHash).toBe(createHash("sha256").update(token).digest("hex"));
  });

  it("generates a different token on every call", () => {
    const first = generateInvitationToken();
    const second = generateInvitationToken();
    expect(first.token).not.toBe(second.token);
  });
});
