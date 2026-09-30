import { describe, expect, it } from "vitest";
import { err, ok } from "./result";

describe("result", () => {
  it("ok() with no data produces the void success shape", () => {
    expect(ok()).toEqual({ ok: true, data: undefined });
  });

  it("ok(data) produces the typed success shape", () => {
    expect(ok({ slug: "bhadrapur-fc" })).toEqual({
      ok: true,
      data: { slug: "bhadrapur-fc" },
    });
  });

  it("err() produces the failure shape with an error code and message", () => {
    expect(err("VALIDATION", "Invalid input")).toEqual({
      ok: false,
      error: { code: "VALIDATION", message: "Invalid input", fieldErrors: undefined },
    });
  });

  it("err() carries fieldErrors when provided", () => {
    const result = err("VALIDATION", "Invalid input", { email: ["Required"] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.fieldErrors).toEqual({ email: ["Required"] });
    }
  });
});
