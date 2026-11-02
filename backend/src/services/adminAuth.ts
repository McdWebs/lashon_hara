import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

const TOKEN_HOURS = 12;

function sign(payload: string) {
  return crypto.createHmac("sha256", env.admin.tokenSecret).update(payload).digest("base64url");
}

function sameText(a: string, b: string) {
  const left = crypto.createHash("sha256").update(a).digest();
  const right = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(left, right);
}

export function adminConfigured() {
  return Boolean(env.admin.password && env.admin.tokenSecret);
}

export function passwordMatches(password: string) {
  return adminConfigured() && sameText(password, env.admin.password);
}

export function issueToken() {
  const expires = String(Date.now() + TOKEN_HOURS * 3_600_000);
  return `${expires}.${sign(expires)}`;
}

function validToken(token: string) {
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !adminConfigured()) return false;
  if (!sameText(signature, sign(expires))) return false;
  return Number(expires) > Date.now();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!validToken(token)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}

const attempts = new Map<string, { count: number; resetAt: number }>();

/** Ten wrong passwords from one address locks it out for 15 minutes. */
export function loginAllowed(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) return true;
  return entry.count < 10;
}

export function recordFailedLogin(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) attempts.set(ip, { count: 1, resetAt: now + 15 * 60_000 });
  else entry.count += 1;
}
