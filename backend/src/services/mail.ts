import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export async function notifyInbox(subject: string, body: string): Promise<void> {
  if (!env.contactInbox) {
    console.warn("CONTACT_INBOX is empty; skipping email", subject);
    return;
  }

  if (!env.smtp.host) {
    console.info(`[inbox fallback] to=${env.contactInbox} subject=${subject}\n${body}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });

  await transporter.sendMail({
    from: env.smtp.from || env.contactInbox,
    to: env.contactInbox,
    subject,
    text: body,
  });
}
