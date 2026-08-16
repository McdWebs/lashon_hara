import { Router } from "express";
import { env } from "../config/env.js";

export const paymentsRouter = Router();

/** Payment is on hold. This route exists so the frontend can integrate later without a rewrite. */
paymentsRouter.get("/status", (_req, res) => {
  res.json({
    status: "on_hold",
    providerConfigured: Boolean(env.payment.provider && env.payment.secretKey),
    checkoutUrl: `${env.wcOrigin}/checkout/`,
    cartUrl: `${env.wcOrigin}/cart/`,
  });
});

paymentsRouter.post("/intent", (_req, res) => {
  res.status(501).json({
    error: "payment_on_hold",
    message: "Use the existing WooCommerce checkout until a payment provider is approved.",
    checkoutUrl: `${env.wcOrigin}/checkout/`,
  });
});
