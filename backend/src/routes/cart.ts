import { Router, type Request, type Response } from "express";
import * as wcCart from "../services/wcCart.js";

export const cartRouter = Router();

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

cartRouter.get("/", async (req, res) => {
  try {
    const result = await wcCart.getCart(session(req));
    relay(res, result);
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "cart_unavailable" });
  }
});

cartRouter.post("/add-item", async (req, res) => {
  try {
    const { id, quantity, variation } = req.body ?? {};
    const result = await wcCart.addItem(session(req), { id, quantity, variation });
    relay(res, result);
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "cart_unavailable" });
  }
});

cartRouter.post("/update-item", async (req, res) => {
  try {
    const { key, quantity } = req.body ?? {};
    const result = await wcCart.updateItem(session(req), key, quantity);
    relay(res, result);
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "cart_unavailable" });
  }
});

cartRouter.delete("/items/:key", async (req, res) => {
  try {
    const result = await wcCart.removeItem(session(req), req.params.key);
    relay(res, result);
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "cart_unavailable" });
  }
});

cartRouter.delete("/items", async (req, res) => {
  try {
    const result = await wcCart.clearCart(session(req));
    relay(res, result);
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "cart_unavailable" });
  }
});

cartRouter.post("/update-customer", async (req, res) => {
  try {
    const { billing_address, shipping_address } = req.body ?? {};
    const result = await wcCart.updateCustomer(session(req), { billing_address, shipping_address });
    relay(res, result);
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "cart_unavailable" });
  }
});

cartRouter.post("/select-shipping-rate", async (req, res) => {
  try {
    const { package_id, rate_id } = req.body ?? {};
    const result = await wcCart.selectShippingRate(session(req), { package_id, rate_id });
    relay(res, result);
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "cart_unavailable" });
  }
});
