import mongoose from "mongoose";
import { Router } from "express";
import { Submission } from "../models/Submission.js";

export const statsRouter = Router();

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
