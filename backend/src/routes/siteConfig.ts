import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { Setting } from "../models/Setting.js";
import { requireAdmin } from "../services/adminAuth.js";
import { takenDaysFromFeed } from "../services/calendarFeed.js";

const SORT_KEYS = ["", "new", "best", "price-asc", "price-desc", "title"] as const;
const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const counter = z.object({ value: z.number().int().min(0).max(1_000_000_000).nullable() });

const calendar = z.object({
  icsUrl: z.string().max(500),
  closedWeekdays: z.array(z.number().int().min(0).max(6)).max(7),
  monthsAhead: z.number().int().min(1).max(12),
  blockedDates: z.array(isoDay).max(400),
});

const shop = z.object({
  collections: z
    .array(
      z.object({
        key: z.string().regex(/^[a-z0-9-]{1,30}$/),
        he: z.string().min(1).max(40),
        en: z.string().min(1).max(40),
        categories: z.array(z.number().int().positive()).max(40),
        hidden: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(20)
    .refine((list) => new Set(list.map((c) => c.key)).size === list.length, "duplicate_key")
    .refine((list) => list.some((c) => c.key === "all"), "missing_all"),
  sorts: z.array(z.enum(SORT_KEYS)).min(1).max(SORT_KEYS.length),
  prices: z
    .array(z.object({ min: z.number().int().min(0).max(100_000).optional(), max: z.number().int().min(1).max(100_000).optional() }))
    .max(8)
    .refine((list) => list.every((p) => p.min !== undefined || p.max !== undefined), "empty_range")
    .refine((list) => list.every((p) => p.min === undefined || p.max === undefined || p.min < p.max), "bad_range"),
});

const program = z.object({
  title: z.string().min(1).max(200),
  lead: z.string().max(400),
  body: z.array(z.string().min(1).max(3000)).max(12),
  notes: z.array(z.string().min(1).max(400)).max(10),
});

const lectures = z.object({
  items: z
    .array(z.object({ id: z.string().min(1).max(40), he: program, en: program.optional() }))
    .max(30)
    .refine((list) => new Set(list.map((l) => l.id)).size === list.length, "duplicate_id"),
});

/** Switches the team can turn on and off. A flag that was never saved keeps the default the site ships with. */
const flags = z.object({ english: z.boolean(), shopMission: z.boolean().optional() });

const SECTIONS = { counter, calendar, shop, lectures, flags } as const;
type Section = keyof typeof SECTIONS;
const isSection = (name: string): name is Section => name in SECTIONS;

async function readAll(): Promise<Partial<Record<Section, unknown>>> {
  if (mongoose.connection.readyState !== 1) return {};
  const docs = await Setting.find({ key: { $in: Object.keys(SECTIONS) } }).lean();
  return Object.fromEntries(docs.map((d) => [d.key, d.value]));
}

/** What the site reads. A section that was never saved is left out, and the site uses its built-in default. */
export const siteConfigRouter = Router();

siteConfigRouter.get("/", async (_req, res) => {
  const all = await readAll();
  const out: Record<string, unknown> = {};

  if (all.counter) out.counter = (all.counter as z.infer<typeof counter>).value;
  if (all.shop) out.shop = all.shop;
  if (all.lectures) out.lectures = (all.lectures as z.infer<typeof lectures>).items;
  if (all.flags) out.flags = all.flags;

  // Calendar rules are always sent, because the taken days can come from the connected calendar.
  const cal = all.calendar as z.infer<typeof calendar> | undefined;
  if (cal) {
    let fromFeed: string[] = [];
    if (cal.icsUrl) {
      try {
        fromFeed = (await takenDaysFromFeed(cal.icsUrl)).days;
      } catch {
        /* the calendar is unreachable: only the dates blocked by hand apply */
      }
    }
    out.calendar = {
      closedWeekdays: cal.closedWeekdays,
      monthsAhead: cal.monthsAhead,
      takenDates: [...new Set([...cal.blockedDates, ...fromFeed])].sort(),
    };
  }

  // Short, so a change in the admin reaches visitors within about a minute.
  res.set("Cache-Control", "public, max-age=20, s-maxage=30, stale-while-revalidate=30");
  res.json(out);
});

/** The team's side. Mounted under the admin router, after it checks the login. */
export const adminConfigRouter = Router();
adminConfigRouter.use(requireAdmin);

adminConfigRouter.get("/config", async (_req, res) => {
  res.json(await readAll());
});

adminConfigRouter.put("/config/:section", async (req, res) => {
  const name = req.params.section;
  if (!isSection(name)) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const parsed = SECTIONS[name].safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_payload", details: parsed.error.flatten() });
    return;
  }
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ error: "database_unavailable" });
    return;
  }
  await Setting.updateOne({ key: name }, { value: parsed.data }, { upsert: true });
  res.json({ ok: true });
});

/** Back to the built-in default for that section. */
adminConfigRouter.delete("/config/:section", async (req, res) => {
  if (!isSection(req.params.section)) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  await Setting.deleteOne({ key: req.params.section });
  res.json({ ok: true });
});

adminConfigRouter.post("/calendar/test", async (req, res) => {
  const url = typeof req.body?.icsUrl === "string" ? req.body.icsUrl : "";
  if (!url) {
    res.status(400).json({ error: "calendar_url_invalid" });
    return;
  }
  try {
    const feed = await takenDaysFromFeed(url, true);
    res.json({ ok: true, events: feed.events, days: feed.days, totalDays: feed.days.length });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error && err.message.startsWith("calendar_") ? err.message : "calendar_unreachable" });
  }
});
