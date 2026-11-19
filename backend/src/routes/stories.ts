import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { Setting } from "../models/Setting.js";
import { Submission } from "../models/Submission.js";
import { requireAdmin } from "../services/adminAuth.js";

const truthy = (v: unknown) => v === true || v === "true" || v === "on" || v === 1;
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const dbUp = () => mongoose.connection.readyState === 1;

async function storiesOn() {
  if (!dbUp()) return false;
  const doc = await Setting.findOne({ key: "flags" }).lean();
  return Boolean((doc?.value as { stories?: boolean } | undefined)?.stories);
}

/** What visitors read: only the stories the team chose to show, and only while the Stories flag is on. */
export const storiesRouter = Router();

storiesRouter.get("/", async (_req, res) => {
  res.set("Cache-Control", "public, max-age=20, s-maxage=30, stale-while-revalidate=30");
  if (!(await storiesOn())) {
    res.json({ enabled: false, stories: [] });
    return;
  }
  const docs = await Submission.find({ kind: "story", shown: true }).sort({ createdAt: -1 }).limit(200).lean();
  res.json({
    enabled: true,
    stories: docs.map((d) => {
      const p = (d.payload ?? {}) as Record<string, unknown>;
      return { id: String(d._id), name: truthy(p.hideName) ? "" : text(p.name, 80), story: text(p.story, 5000), date: d.createdAt };
    }),
  });
});

/** The team's side. Mounted under the admin router, after it checks the login. */
export const adminStoriesRouter = Router();
adminStoriesRouter.use(requireAdmin);

adminStoriesRouter.get("/stories", async (_req, res) => {
  if (!dbUp()) {
    res.status(503).json({ error: "database_unavailable" });
    return;
  }
  const docs = await Submission.find({ kind: "story" }).sort({ createdAt: -1 }).limit(500).lean();
  res.json({
    items: docs.map((d) => {
      const p = (d.payload ?? {}) as Record<string, unknown>;
      return {
        id: String(d._id),
        name: text(p.name, 80),
        hideName: truthy(p.hideName),
        story: text(p.story, 5000),
        consent: truthy(p.publish),
        attachmentName: text(p.attachmentName, 200),
        shown: Boolean(d.shown),
        date: d.createdAt,
      };
    }),
  });
});

adminStoriesRouter.patch("/stories/:id", async (req, res) => {
  const parsed = z.object({ shown: z.boolean() }).safeParse(req.body);
  if (!parsed.success || !mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "invalid_payload" });
    return;
  }
  const out = await Submission.updateOne({ _id: req.params.id, kind: "story" }, { shown: parsed.data.shown });
  if (!out.matchedCount) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json({ ok: true });
});

adminStoriesRouter.delete("/stories/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "invalid_payload" });
    return;
  }
  await Submission.deleteOne({ _id: req.params.id, kind: "story" });
  res.json({ ok: true });
});
