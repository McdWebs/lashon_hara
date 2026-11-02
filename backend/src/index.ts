import "./instrument.js";
import * as Sentry from "@sentry/node";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { cartRouter } from "./routes/cart.js";
import { catalogRouter, startCatalogWarmup } from "./routes/catalog.js";
import { checkoutRouter } from "./routes/checkout.js";
import { formsRouter } from "./routes/forms.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { healthRouter } from "./routes/health.js";
import { adminRouter, mediaRouter } from "./routes/media.js";
import { payRouter } from "./routes/pay.js";
import { siteConfigRouter } from "./routes/siteConfig.js";
import { sitemapRouter } from "./routes/sitemap.js";
import { statsRouter } from "./routes/stats.js";

const app = express();
// Behind Render's proxy: without this every visitor shares the proxy's IP.
app.set("trust proxy", 1);
app.use(compression());
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.frontendOrigin, exposedHeaders: ["Cart-Token", "Nonce", "Nonce-Timestamp"] }));
app.use(express.json({ limit: "200kb" }));

app.use("/health", healthRouter);

// Per visitor address. Set well above real use (a classroom sharing one network, a fast shopper)
// so these only ever stop scripts; the admin login keeps its own stricter lockout.
app.use("/api", rateLimit({ name: "api", windowMs: 60_000, max: 600 }));
app.post("/api/forms", rateLimit({ name: "forms", windowMs: 10 * 60_000, max: 40 }));
app.post("/api/checkout", rateLimit({ name: "checkout", windowMs: 10 * 60_000, max: 30 }));
app.use("/api/cart", rateLimit({ name: "cart", windowMs: 60_000, max: 180 }));

app.use("/api/catalog", catalogRouter);
app.use("/api/cart", cartRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/forms", formsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/media", mediaRouter);
app.use("/api/site-config", siteConfigRouter);
app.use("/api/sitemap.xml", sitemapRouter);
app.use("/api/pay", payRouter);
app.use("/api/admin", adminRouter);

Sentry.setupExpressErrorHandler(app);

await connectDb();

app.listen(env.port, () => {
  startCatalogWarmup();
  console.log(`API listening on ${env.port}`);
});
