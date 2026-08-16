import { Router } from "express";
import { getProduct, listCategories, listProducts, listProductsByIds } from "../services/woocommerce.js";

export const catalogRouter = Router();

catalogRouter.get("/products", async (req, res) => {
  try {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === "string") params.set(key, value);
    }
    const include = params.get("include");
    if (include) {
      res.json(await listProductsByIds(include.split(",")));
      return;
    }
    const data = await listProducts(params);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "catalog_unavailable" });
  }
});

catalogRouter.get("/products/:id", async (req, res) => {
  try {
    const product = await getProduct(req.params.id);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "product_not_found" });
  }
});

catalogRouter.get("/categories", async (_req, res) => {
  try {
    res.json(await listCategories());
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "categories_unavailable" });
  }
});
