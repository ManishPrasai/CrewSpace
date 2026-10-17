import type { Page } from "@playwright/test";

// Local Supabase does NOT auto-confirm emails (supabase/config.toml's
// auth.email.enable_confirmations = true), so every fresh signup needs a
// real confirmation round-trip. The local mail capture tool is Mailpit
// (confirmed live: curl http://localhost:58324/ returns <title>Mailpit</title>
// - the container is legacy-named supabase_inbucket_CrewSpace but the
// software is genuinely Mailpit), REST API confirmed live at
// GET /api/v1/messages -> {total, messages: [...]}.
const MAIL_API = "http://127.0.0.1:58324/api/v1";

type MailpitMessage = { ID: string };

async function pollForMessage(email: string): Promise<MailpitMessage> {
  for (let i = 0; i < 20; i++) {
    const res = await fetch(`${MAIL_API}/messages?query=${encodeURIComponent(`to:${email}`)}&limit=1`);
    if (!res.ok) {
      throw new Error(`Mailpit /messages returned ${res.status} - is Mailpit actually running on port 58324?`);
    }
    const body = await res.json();
    if (!Array.isArray(body.messages)) {
      throw new Error("Mailpit /messages response missing a 'messages' array - API shape may have changed");
    }
    if (body.messages.length > 0) {
      return body.messages[0];
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`No email arrived for ${email} within 10s - check Mailpit at http://localhost:58324`);
}

// Fetches the most recent email sent to `email`, extracts the Supabase
// verify link, and navigates `page` there - this exchanges the code and
// logs the user in via /auth/callback (src/app/auth/callback/route.ts),
// no separate login step needed afterward.
export async function confirmEmailFor(page: Page, email: string): Promise<void> {
  const message = await pollForMessage(email);

  const res = await fetch(`${MAIL_API}/message/${message.ID}`);
  if (!res.ok) {
    throw new Error(`Mailpit /message/${message.ID} returned ${res.status} - API shape may have changed`);
  }
  const full = await res.json();
  const html: string | undefined = full.HTML ?? full.Text;
  if (!html) {
    throw new Error(`Mailpit message ${message.ID} had no HTML/Text body - inspect manually at ${MAIL_API}`);
  }

  const match = html.match(/href="([^"]*\/auth\/v1\/verify\?[^"]+)"/);
  if (!match) {
    throw new Error("No Supabase verify link found in the confirmation email body - template or API shape changed");
  }

  await page.goto(match[1].replace(/&amp;/g, "&"));
}
