import { Router } from "express";
import { env } from "../config/env.js";

export const paymentsRouter = Router();

const cartUrl = `${env.frontendOrigin}/cart`;
const checkoutUrl = `${env.frontendOrigin}/checkout`;

/** Payment is on hold. This route exists so the frontend can integrate later without a rewrite. */
paymentsRouter.get("/status", (_req, res) => {
  res.json({
    status: "on_hold",
    providerConfigured: Boolean(env.payment.provider && env.payment.secretKey),
    checkoutUrl,
    cartUrl,
  });
});

paymentsRouter.post("/intent", (_req, res) => {
  res.status(501).json({
    error: "payment_on_hold",
    message: "Online payment is not active yet. Use checkout or WhatsApp to complete the order.",
    checkoutUrl,
  });
});
