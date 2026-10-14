import { describe, expect, it } from "vitest";
import { getSafeRedirect } from "./safe-redirect";

describe("getSafeRedirect", () => {
  it("allows a plain relative path", () => {
    expect(getSafeRedirect("/dashboard")).toBe("/dashboard");
  });

  it("allows a relative path with a query string", () => {
    expect(getSafeRedirect("/w/bhadrapur-fc?status=success")).toBe(
      "/w/bhadrapur-fc?status=success",
    );
  });

  it("falls back for null, undefined, and empty string", () => {
    expect(getSafeRedirect(null)).toBe("/workspaces");
    expect(getSafeRedirect(undefined)).toBe("/workspaces");
    expect(getSafeRedirect("")).toBe("/workspaces");
  });

  it("uses a custom fallback when given one", () => {
    expect(getSafeRedirect(null, "/login")).toBe("/login");
    expect(getSafeRedirect("//evil.com", "/login")).toBe("/login");
  });

  it("rejects a protocol-relative URL", () => {
    expect(getSafeRedirect("//evil.com")).toBe("/workspaces");
  });

  it("rejects the backslash variant of a protocol-relative URL", () => {
    expect(getSafeRedirect("/\\evil.com")).toBe("/workspaces");
  });

  it("rejects an absolute URL with a scheme", () => {
    expect(getSafeRedirect("https://evil.com")).toBe("/workspaces");
  });

  it("rejects a javascript: URL", () => {
    expect(getSafeRedirect("javascript:alert(1)")).toBe("/workspaces");
  });

  it("rejects a path that doesn't start with a slash", () => {
    expect(getSafeRedirect("dashboard")).toBe("/workspaces");
  });
});
