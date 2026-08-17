import { Resend } from "resend";
import { env } from "../config/env.js";

export async function notifyInbox(subject: string, body: string): Promise<void> {
  if (!env.contactInbox) {
    console.warn("CONTACT_INBOX is empty; skipping email", subject);
    return;
  }

  if (!env.resend.apiKey) {
    console.info(`[inbox fallback] to=${env.contactInbox} subject=${subject}\n${body}`);
    return;
  }

  const resend = new Resend(env.resend.apiKey);

  await resend.emails.send({
    from: env.resend.from,
    to: env.contactInbox,
    subject,
    text: body,
  });
}
