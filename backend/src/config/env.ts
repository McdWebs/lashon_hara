import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(configDir, "../..");
const rootDir = path.resolve(configDir, "../../..");

dotenv.config({ path: path.join(rootDir, ".env") });
dotenv.config({ path: path.join(backendDir, ".env"), override: true });

export const env = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? "development",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  mongodbUri: process.env.MONGODB_URI ?? "",
  catalogPurgeSecret: process.env.CATALOG_PURGE_SECRET ?? "",
  turnstileSecret: process.env.TURNSTILE_SECRET_KEY ?? "",
  sentryDsn: process.env.SENTRY_DSN ?? "",
  admin: {
    password: process.env.ADMIN_PASSWORD ?? "",
    tokenSecret: process.env.ADMIN_TOKEN_SECRET ?? "",
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID ?? "",
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    bucket: process.env.R2_BUCKET ?? "",
    publicUrl: (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, ""),
  },
  siteUrl: (process.env.SITE_URL ?? "https://lashonhara.co.il").replace(/\/$/, ""),
  contactInbox: process.env.CONTACT_INBOX ?? "",
  whatsappNumber: process.env.WHATSAPP_NUMBER ?? "972543644512",
  supportHours: process.env.SUPPORT_HOURS ?? "09:00-18:00, six days a week",
  wcOrigin: (process.env.WC_ORIGIN ?? "https://lashonhara.co.il").replace(/\/$/, ""),
  resend: {
    apiKey: process.env.RESEND_API_KEY ?? "",
    from: process.env.RESEND_FROM ?? process.env.CONTACT_INBOX ?? "",
  },
  payment: {
    provider: process.env.PAYMENT_PROVIDER ?? "",
    publicKey: process.env.PAYMENT_PUBLIC_KEY ?? "",
    secretKey: process.env.PAYMENT_SECRET_KEY ?? "",
  },
};
