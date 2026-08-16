import cors from "cors";
import express from "express";
import helmet from "helmet";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { catalogRouter } from "./routes/catalog.js";
import { formsRouter } from "./routes/forms.js";
import { healthRouter } from "./routes/health.js";
import { paymentsRouter } from "./routes/payments.js";

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.frontendOrigin }));
app.use(express.json({ limit: "200kb" }));

app.use("/health", healthRouter);
app.use("/api/catalog", catalogRouter);
app.use("/api/forms", formsRouter);
app.use("/api/payments", paymentsRouter);

await connectDb();

app.listen(env.port, () => {
  console.log(`API listening on ${env.port}`);
});
