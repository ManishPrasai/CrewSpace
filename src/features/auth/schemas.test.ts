import { describe, expect, it } from "vitest";
import {
  oauthProviderSchema,
  requestPasswordResetSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "./schemas";

describe("signUpSchema", () => {
  it("accepts a valid signup", () => {
    expect(
      signUpSchema.safeParse({
        email: "owner@example.com",
        password: "password123",
        fullName: "Manish Prasai",
      }).success,
    ).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(
      signUpSchema.safeParse({
        email: "not-an-email",
        password: "password123",
        fullName: "Manish Prasai",
      }).success,
    ).toBe(false);
  });

  it("rejects a password under 8 characters", () => {
    expect(
      signUpSchema.safeParse({
        email: "owner@example.com",
        password: "short1",
        fullName: "Manish Prasai",
      }).success,
    ).toBe(false);
  });

  it("rejects an empty fullName", () => {
    expect(
      signUpSchema.safeParse({
        email: "owner@example.com",
        password: "password123",
        fullName: "",
      }).success,
    ).toBe(false);
  });

  it("rejects a fullName over 100 characters", () => {
    expect(
      signUpSchema.safeParse({
        email: "owner@example.com",
        password: "password123",
        fullName: "x".repeat(101),
      }).success,
    ).toBe(false);
  });
});

describe("signInSchema", () => {
  it("accepts a valid login", () => {
    expect(
      signInSchema.safeParse({ email: "owner@example.com", password: "anything" }).success,
    ).toBe(true);
  });

  it("rejects an empty password", () => {
    expect(signInSchema.safeParse({ email: "owner@example.com", password: "" }).success).toBe(
      false,
    );
  });

  it("rejects an invalid email", () => {
    expect(signInSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
  });
});

describe("requestPasswordResetSchema", () => {
  it("accepts a valid email", () => {
    expect(requestPasswordResetSchema.safeParse({ email: "owner@example.com" }).success).toBe(
      true,
    );
  });

  it("rejects an invalid email", () => {
    expect(requestPasswordResetSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });
});

describe("updatePasswordSchema", () => {
  it("accepts a password of 8+ characters", () => {
    expect(updatePasswordSchema.safeParse({ password: "password123" }).success).toBe(true);
  });

  it("rejects a password under 8 characters", () => {
    expect(updatePasswordSchema.safeParse({ password: "short1" }).success).toBe(false);
  });
});

describe("oauthProviderSchema", () => {
  it.each(["google", "azure", "apple"])("accepts %s", (provider) => {
    expect(oauthProviderSchema.safeParse(provider).success).toBe(true);
  });

  it("rejects \"microsoft\" - the provider key is \"azure\", not \"microsoft\"", () => {
    expect(oauthProviderSchema.safeParse("microsoft").success).toBe(false);
  });

  it("rejects an arbitrary string", () => {
    expect(oauthProviderSchema.safeParse("facebook").success).toBe(false);
  });

  it("rejects a non-string value", () => {
    expect(oauthProviderSchema.safeParse(null).success).toBe(false);
  });
});
