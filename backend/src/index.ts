import cors from "cors";
import express from "express";
import helmet from "helmet";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { cartRouter } from "./routes/cart.js";
import { catalogRouter } from "./routes/catalog.js";
import { checkoutRouter } from "./routes/checkout.js";
import { formsRouter } from "./routes/forms.js";
import { healthRouter } from "./routes/health.js";
import { statsRouter } from "./routes/stats.js";

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.frontendOrigin, exposedHeaders: ["Cart-Token", "Nonce", "Nonce-Timestamp"] }));
app.use(express.json({ limit: "200kb" }));

app.use("/health", healthRouter);
app.use("/api/catalog", catalogRouter);
app.use("/api/cart", cartRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/forms", formsRouter);
app.use("/api/stats", statsRouter);

await connectDb();

app.listen(env.port, () => {
  console.log(`API listening on ${env.port}`);
});
