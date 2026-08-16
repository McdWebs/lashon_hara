import { Router } from "express";
import mongoose from "mongoose";
import { Submission } from "../models/Submission.js";
import { notifyInbox } from "../services/mail.js";
import { submissionSchema } from "../utils/schemas.js";

export const formsRouter = Router();

formsRouter.post("/", async (req, res) => {
  const parsed = submissionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_payload", details: parsed.error.flatten() });
    return;
  }

  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ error: "database_unavailable" });
    return;
  }

  const doc = await Submission.create(parsed.data);
  const body = JSON.stringify(parsed.data.payload, null, 2);
  await notifyInbox(`[${parsed.data.kind}] lashonhara.co.il`, body);
  res.status(201).json({ id: doc.id, ok: true });
});
