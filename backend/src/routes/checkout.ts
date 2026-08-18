import { Router, type Request, type Response } from "express";
import * as wcCart from "../services/wcCart.js";
import { checkoutPayload } from "../utils/schemas.js";

export const checkoutRouter = Router();

function session(req: Request) {
  return {
    cartToken: req.header("Cart-Token") ?? undefined,
    nonce: req.header("Nonce") ?? undefined,
  };
}

function relay(res: Response, result: { cartToken?: string; nonce?: string; nonceTimestamp?: string }) {
  if (result.cartToken) res.set("Cart-Token", result.cartToken);
  if (result.nonce) res.set("Nonce", result.nonce);
  if (result.nonceTimestamp) res.set("Nonce-Timestamp", result.nonceTimestamp);
}

checkoutRouter.post("/", async (req, res) => {
  const parsed = checkoutPayload.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_payload", details: parsed.error.flatten() });
    return;
  }

  try {
    const result = await wcCart.checkout(session(req), {
      ...parsed.data,
      payment_method: "yaadpay",
    });
    relay(res, result);
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "checkout_unavailable" });
  }
});

checkoutRouter.get("/order/:id", async (req, res) => {
  try {
    const key = typeof req.query.key === "string" ? req.query.key : undefined;
    const result = await wcCart.getOrder(session(req), req.params.id, key);
    relay(res, result);
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "order_unavailable" });
  }
});
