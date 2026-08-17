import { Router } from "express";
import mongoose from "mongoose";
import { Submission } from "../models/Submission.js";
import { notifyInbox } from "../services/mail.js";
import { commitmentPayload, submissionSchema } from "../utils/schemas.js";
import { findCommitmentByEmail, normalizeCommitmentEmail } from "../utils/commitment.js";

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

  let payload = parsed.data.payload;

  if (parsed.data.kind === "commitment") {
    const payloadParsed = commitmentPayload.safeParse(parsed.data.payload);
    if (!payloadParsed.success) {
      res.status(400).json({ error: "invalid_payload", details: payloadParsed.error.flatten() });
      return;
    }

    const emailNormalized = normalizeCommitmentEmail(payloadParsed.data.email);
    const existing = await findCommitmentByEmail(emailNormalized);
    if (existing) {
      res.status(409).json({
        error: "already_signed",
        firstName: typeof existing.payload?.firstName === "string" ? existing.payload.firstName : undefined,
      });
      return;
    }

    payload = {
      ...payloadParsed.data,
      firstName: payloadParsed.data.firstName.trim(),
      phone: payloadParsed.data.phone.trim(),
      email: payloadParsed.data.email.trim(),
      emailNormalized,
    };
  }

  const doc = await Submission.create({ ...parsed.data, payload });
  const body = JSON.stringify(payload, null, 2);
  await notifyInbox(`[${parsed.data.kind}] lashonhara.co.il`, body);
  res.status(201).json({ id: doc.id, ok: true });
});
