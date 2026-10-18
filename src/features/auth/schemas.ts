import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).max(100),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(8),
});

// Matches profiles.full_name's own check constraint (char_length <= 100).
export const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(100),
});

// ADR-026: closed enum, not a free-text field - the hidden `provider`
// input in each OAuthButtons form is still client-controlled data, so
// this is the boundary that stops anything outside these three values
// from ever reaching supabase.auth.signInWithOAuth. "azure" is
// Supabase/Microsoft's own provider key, not "microsoft".
export const oauthProviderSchema = z.enum(["google", "azure", "apple"]);

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type OAuthProvider = z.infer<typeof oauthProviderSchema>;
