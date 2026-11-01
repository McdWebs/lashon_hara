import { env } from "../config/env.js";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Checks a Turnstile token. With no secret configured (local development) every request passes. */
export async function verifyCaptcha(token: string | undefined, ip: string | undefined): Promise<boolean> {
  if (!env.turnstileSecret) return true;
  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret: env.turnstileSecret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch(VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(8000) });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("captcha verification failed", err);
    return false;
  }
}
