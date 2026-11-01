import * as Sentry from "@sentry/node";
import { env } from "./config/env.js";

/** Must be imported before anything else so Sentry can see every request. Does nothing without SENTRY_DSN. */
if (env.sentryDsn) {
  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.nodeEnv,
    tracesSampleRate: 0.1,
  });
}
