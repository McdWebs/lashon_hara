import crypto from "node:crypto";
import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { Media } from "../models/Media.js";
import { issueToken, loginAllowed, passwordMatches, recordFailedLogin, requireAdmin } from "../services/adminAuth.js";
import { deleteObject, publicUrlFor, r2Configured, signUpload } from "../services/r2.js";

const WORLDS = ["idf", "ambassadors"] as const;
const worldSchema = z.enum(WORLDS);

const PHOTO_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const VIDEO_TYPES: Record<string, string> = { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" };
const MAX_PHOTO = 10 * 1024 * 1024;
const MAX_VIDEO = 150 * 1024 * 1024;

const kindOf = (contentType: string) => (contentType in PHOTO_TYPES ? "photo" : contentType in VIDEO_TYPES ? "video" : null);

/** What visitors see: the items for one section, in the order the team set. */
export const mediaRouter = Router();

mediaRouter.get("/:world", async (req, res) => {
  const world = worldSchema.safeParse(req.params.world);
  if (!world.success) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  if (mongoose.connection.readyState !== 1) {
    res.json({ items: [] });
    return;
  }
  const docs = await Media.find({ world: world.data }).sort({ order: 1, createdAt: 1 }).lean();
  res.set("Cache-Control", "public, max-age=30, s-maxage=60, stale-while-revalidate=300");
  res.json({
    items: docs.map((d) => ({ id: String(d._id), kind: d.kind, src: d.url, caption: d.caption || undefined })),
  });
});

/** The team's side: log in, then upload, caption, reorder and delete. */
export const adminRouter = Router();

adminRouter.post("/login", (req, res) => {
  const ip = req.ip ?? "unknown";
  if (!loginAllowed(ip)) {
    res.status(429).json({ error: "too_many_attempts" });
    return;
  }
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!passwordMatches(password)) {
    recordFailedLogin(ip);
    res.status(401).json({ error: "wrong_password" });
    return;
  }
  res.json({ token: issueToken() });
});

adminRouter.use(requireAdmin);

adminRouter.get("/media/:world", async (req, res) => {
  const world = worldSchema.safeParse(req.params.world);
  if (!world.success) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const docs = await Media.find({ world: world.data }).sort({ order: 1, createdAt: 1 }).lean();
  res.json({
    storage: r2Configured(),
    items: docs.map((d) => ({ id: String(d._id), kind: d.kind, src: d.url, caption: d.caption })),
  });
});

const signBody = z.object({
  world: worldSchema,
  contentType: z.string(),
  size: z.number().int().positive(),
});

adminRouter.post("/uploads/sign", async (req, res) => {
  if (!r2Configured()) {
    res.status(503).json({ error: "storage_not_configured" });
    return;
  }
  const parsed = signBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_payload" });
    return;
  }
  const { world, contentType, size } = parsed.data;
  const kind = kindOf(contentType);
  if (!kind) {
    res.status(400).json({ error: "unsupported_type" });
    return;
  }
  if (size > (kind === "photo" ? MAX_PHOTO : MAX_VIDEO)) {
    res.status(400).json({ error: "too_large" });
    return;
  }
  const ext = PHOTO_TYPES[contentType] ?? VIDEO_TYPES[contentType];
  const key = `activity/${world}/${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  res.json({ uploadUrl: await signUpload(key, contentType, size), key, kind });
});

const createBody = z.object({
  world: worldSchema,
  key: z.string().max(200),
  contentType: z.string(),
  caption: z.string().max(300).optional(),
});

adminRouter.post("/media", async (req, res) => {
  const parsed = createBody.safeParse(req.body);
  const kind = parsed.success ? kindOf(parsed.data.contentType) : null;
  if (!parsed.success || !kind || !parsed.data.key.startsWith(`activity/${parsed.data.world}/`)) {
    res.status(400).json({ error: "invalid_payload" });
    return;
  }
  const { world, key, caption } = parsed.data;
  const last = await Media.findOne({ world }).sort({ order: -1 }).lean();
  const doc = await Media.create({ world, kind, key, url: publicUrlFor(key), caption: caption ?? "", order: (last?.order ?? -1) + 1 });
  res.status(201).json({ id: doc.id });
});

adminRouter.patch("/media/:id", async (req, res) => {
  const caption = typeof req.body?.caption === "string" ? req.body.caption.slice(0, 300) : null;
  if (caption === null || !mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "invalid_payload" });
    return;
  }
  await Media.updateOne({ _id: req.params.id }, { caption });
  res.json({ ok: true });
});

adminRouter.put("/media-order", async (req, res) => {
  const parsed = z.object({ world: worldSchema, ids: z.array(z.string()).max(500) }).safeParse(req.body);
  if (!parsed.success || !parsed.data.ids.every((id) => mongoose.isValidObjectId(id))) {
    res.status(400).json({ error: "invalid_payload" });
    return;
  }
  await Media.bulkWrite(
    parsed.data.ids.map((id, order) => ({ updateOne: { filter: { _id: id, world: parsed.data.world }, update: { order } } })),
  );
  res.json({ ok: true });
});

adminRouter.delete("/media/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "invalid_payload" });
    return;
  }
  const doc = await Media.findByIdAndDelete(req.params.id);
  if (doc && r2Configured()) {
    try {
      await deleteObject(doc.key);
    } catch (err) {
      console.error("could not delete the stored file", doc.key, err);
    }
  }
  res.json({ ok: true });
});
