import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1),
  // ADR-026: comma-separated provider list, e.g. "google,azure,apple".
  // Optional (not .min(1)) - unset/empty is the default, correct state
  // until a provider has real credentials configured.
  NEXT_PUBLIC_AUTH_PROVIDERS: z.string().optional(),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_PRICE_PRO_MONTHLY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
  VAPID_PRIVATE_KEY: z.string().min(1),
  VAPID_SUBJECT: z.string().min(1),
});

function parse<Schema extends z.ZodTypeAny>(
  schema: Schema,
  values: Record<string, string | undefined>,
  label: string,
): z.infer<Schema> {
  const result = schema.safeParse(values);
  if (!result.success) {
    throw new Error(
      `Invalid ${label} environment variables:\n${JSON.stringify(result.error.flatten().fieldErrors, null, 2)}`,
    );
  }
  return result.data;
}

export const clientEnv = parse(
  clientSchema,
  {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    NEXT_PUBLIC_AUTH_PROVIDERS: process.env.NEXT_PUBLIC_AUTH_PROVIDERS,
  },
  "client",
);

// Server-only secrets. Accessing this from client code throws instead of
// leaking a value, since NEXT_PUBLIC_* is the only prefix Next.js inlines
// into the browser bundle and everything here is deliberately unprefixed.
export const serverEnv: z.infer<typeof serverSchema> =
  typeof window === "undefined"
    ? parse(
        serverSchema,
        {
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
          STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
          STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
          STRIPE_PRICE_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY,
          RESEND_API_KEY: process.env.RESEND_API_KEY,
          EMAIL_FROM: process.env.EMAIL_FROM,
          VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
          VAPID_SUBJECT: process.env.VAPID_SUBJECT,
        },
        "server",
      )
    : new Proxy({} as z.infer<typeof serverSchema>, {
        get(_target, prop) {
          throw new Error(
            `Attempted to access server-only env var "${String(prop)}" on the client`,
          );
        },
      });
