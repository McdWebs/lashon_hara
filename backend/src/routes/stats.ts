import mongoose from "mongoose";
import { Router } from "express";
import { Submission } from "../models/Submission.js";
import { findCommitmentByEmail, normalizeCommitmentEmail } from "../utils/commitment.js";

export const statsRouter = Router();

statsRouter.get("/commitment-status", async (req, res) => {
  const email = normalizeCommitmentEmail(String(req.query.email ?? ""));
  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "invalid_email" });
    return;
  }

  if (mongoose.connection.readyState !== 1) {
    res.json({ signed: false });
    return;
  }

  const existing = await findCommitmentByEmail(email);
  res.json({
    signed: Boolean(existing),
    firstName: typeof existing?.payload?.firstName === "string" ? existing.payload.firstName : undefined,
  });
});

statsRouter.get("/", async (_req, res) => {
  const published = {
    foundedYear: 2007,
    founder: "דוד הלפרין",
    source: "https://lashonhara.co.il/about-us/",
  };

  if (mongoose.connection.readyState !== 1) {
    res.json({ ...published, live: null });
    return;
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [commitments, commitmentsThisWeek, ambassadors, schoolInquiries] = await Promise.all([
    Submission.countDocuments({ kind: "commitment" }),
    Submission.countDocuments({ kind: "commitment", createdAt: { $gte: weekAgo } }),
    Submission.countDocuments({ kind: "ambassador" }),
    Submission.countDocuments({ kind: "school" }),
  ]);

  res.json({
    ...published,
    live: { commitments, commitmentsThisWeek, ambassadors, schoolInquiries },
  });
});
