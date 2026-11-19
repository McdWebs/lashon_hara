import { StrictMode } from "react";
import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initAnalytics } from "./lib/analytics";
import "./index.css";

initAnalytics();

const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}

// After a new version goes live, a tab that was already open still points at the old file names, and the next page
// it opens fails to load. Reload once to pick up the new version; the guard stops a loop if the problem is something else.
window.addEventListener("vite:preloadError", (event) => {
  try {
    const last = Number(sessionStorage.getItem("lh-chunk-reload") ?? 0);
    if (Date.now() - last < 60_000) return;
    sessionStorage.setItem("lh-chunk-reload", String(Date.now()));
  } catch {
    return;
  }
  event.preventDefault();
  window.location.reload();
});

function CrashFallback() {
  return (
    <div role="alert" dir="rtl" style={{ padding: "80px 24px", textAlign: "center", fontFamily: "Heebo, system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 28, margin: "0 0 12px" }}>משהו השתבש</h1>
      <p style={{ margin: "0 0 24px" }}>הדף לא נטען כמו שצריך. אפשר לרענן ולנסות שוב.</p>
      <a href="/" style={{ color: "#E21F26", fontWeight: 700 }}>לעמוד הבית</a>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<CrashFallback />}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
