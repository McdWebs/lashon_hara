import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? "development",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  mongodbUri: process.env.MONGODB_URI ?? "",
  contactInbox: process.env.CONTACT_INBOX ?? "",
  whatsappNumber: process.env.WHATSAPP_NUMBER ?? "972543644512",
  supportHours: process.env.SUPPORT_HOURS ?? "09:00-18:00, six days a week",
  wcOrigin: (process.env.WC_ORIGIN ?? "https://lashonhara.co.il").replace(/\/$/, ""),
  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.SMTP_FROM ?? process.env.CONTACT_INBOX ?? "",
  },
  payment: {
    provider: process.env.PAYMENT_PROVIDER ?? "",
    publicKey: process.env.PAYMENT_PUBLIC_KEY ?? "",
    secretKey: process.env.PAYMENT_SECRET_KEY ?? "",
  },
};
