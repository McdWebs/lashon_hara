import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { useLocale } from "../i18n/useLocale";
import { track } from "../lib/analytics";
import { useCart } from "../lib/cart";
import { getOrder } from "../lib/cartSession";

const PAID_STATUSES = new Set(["processing", "completed"]);
const FAILED_STATUSES = new Set(["failed", "cancelled"]);
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30_000;

type Status = "checking" | "paid" | "pending" | "failed";

function readStashedOrder(): { id: string; key?: string } | null {
  try {
    const raw = sessionStorage.getItem("lh-last-order");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id: number | string; key?: string };
    return { id: String(parsed.id), key: parsed.key };
  } catch {
    return null;
  }
}

export function OrderConfirmationPage() {
  const { lang, loc } = useLocale();
  const [params] = useSearchParams();
  const clearCart = useCart((state) => state.clear);
  const [status, setStatus] = useState<Status>("checking");
  const clearedRef = useRef(false);

  const stashed = readStashedOrder();
  const orderId = params.get("order_id") ?? stashed?.id ?? null;
  const orderKey = params.get("key") ?? stashed?.key ?? undefined;

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      return;
    }
    let cancelled = false;
    const startedAt = Date.now();

    async function poll() {
      try {
        const order = await getOrder(orderId!, orderKey);
        if (cancelled) return;
        if (PAID_STATUSES.has(order.status)) {
          setStatus("paid");
          if (!clearedRef.current) {
            clearedRef.current = true;
            sessionStorage.removeItem("lh-last-order");
            clearCart();
            track("checkout_completed", { orderId: order.id });
          }
          return;
        }
        if (FAILED_STATUSES.has(order.status)) {
          setStatus("failed");
          track("payment_failed", { orderId: order.id, status: order.status });
          return;
        }
        if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
          setStatus("pending");
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) setStatus("failed");
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId, orderKey, clearCart]);

  return (
    <Box sx={{ bgcolor: "#f8f6f1", minHeight: "70vh", py: { xs: 8, md: 12 } }}>
      <Box sx={{ maxWidth: 560, mx: "auto", px: 2.5, textAlign: "center" }}>
        {status === "checking" && (
          <Stack sx={{ alignItems: "center", gap: 2 }}>
            <CircularProgress size={32} />
            <Typography sx={{ fontFamily: '"Secular One", Heebo, sans-serif', fontSize: 28 }}>
              {lang === "en" ? "Confirming your payment…" : "מאשרים את התשלום…"}
            </Typography>
          </Stack>
        )}

        {status === "paid" && (
          <>
            <Typography sx={{ fontFamily: '"Secular One", Heebo, sans-serif', fontSize: { xs: 40, md: 56 } }}>
              {lang === "en" ? "Thank you!" : "תודה רבה!"}
            </Typography>
            <Typography sx={{ mt: 1.5, color: "text.secondary" }}>
              {lang === "en"
                ? "Your order was placed successfully. We'll be in touch about delivery."
                : "ההזמנה נקלטה בהצלחה. נעדכן אתכם לגבי המשלוח."}
            </Typography>
            <Button component={RouterLink} to={loc("/shop")} variant="contained" color="secondary" sx={{ mt: 3.5 }}>
              {lang === "en" ? "Continue shopping" : "להמשך קנייה"}
            </Button>
          </>
        )}

        {status === "pending" && (
          <>
            <Typography sx={{ fontFamily: '"Secular One", Heebo, sans-serif', fontSize: { xs: 34, md: 44 } }}>
              {lang === "en" ? "Still confirming…" : "עדיין מאשרים…"}
            </Typography>
            <Typography sx={{ mt: 1.5, color: "text.secondary" }}>
              {lang === "en"
                ? "Payment is taking a bit longer than usual. If it doesn't update soon, contact us and we'll check on it."
                : "אישור התשלום לוקח קצת יותר זמן מהרגיל. אם זה לא מתעדכן בקרוב, צרו קשר ונבדוק את זה."}
            </Typography>
            <Button component={RouterLink} to={loc("/contact")} variant="contained" color="secondary" sx={{ mt: 3.5 }}>
              {lang === "en" ? "Contact us" : "צרו קשר"}
            </Button>
          </>
        )}

        {status === "failed" && (
          <>
            <Typography sx={{ fontFamily: '"Secular One", Heebo, sans-serif', fontSize: { xs: 34, md: 44 } }}>
              {lang === "en" ? "We couldn't confirm this order" : "לא הצלחנו לאתר את ההזמנה"}
            </Typography>
            <Typography sx={{ mt: 1.5, color: "text.secondary" }}>
              {lang === "en"
                ? "If you completed a payment, don't worry — contact us with your details and we'll sort it out."
                : "אם השלמתם תשלום, אל דאגה — צרו קשר עם הפרטים שלכם ונסדר את זה."}
            </Typography>
            <Button component={RouterLink} to={loc("/contact")} variant="contained" color="secondary" sx={{ mt: 3.5 }}>
              {lang === "en" ? "Contact us" : "צרו קשר"}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}
