import { Router } from "express";
import mongoose from "mongoose";
import { env } from "../config/env.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    ok: true,
    mongo: mongoose.connection.readyState === 1,
    payment: "on_hold",
    supportHours: env.supportHours,
  });
});
