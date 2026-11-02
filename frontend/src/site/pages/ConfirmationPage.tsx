import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { t, Link } from "../i18n";
import { useContact } from "../contact";
import { track } from "../../lib/analytics";
import { useCart } from "../../lib/cart";
import { fetchPayOrder } from "../../lib/pay";
import { Icon, OkMark, usePageTitle } from "../ui";

const PAID = new Set(["processing", "completed"]);
const FAILED = new Set(["failed", "cancelled"]);
const POLL_MS = 2000;
const TIMEOUT_MS = 30_000;

type Status = "checking" | "paid" | "pending" | "failed";

function stashedOrder(): { id: string; key?: string } | null {
  try {
    const raw = sessionStorage.getItem("lh-last-order");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id: number | string; key?: string };
    return { id: String(parsed.id), key: parsed.key };
  } catch {
    return null;
  }
}

export function ConfirmationPage() {
  usePageTitle(t("אישור הזמנה"));
  const [params] = useSearchParams();
  const { openContact } = useContact();
  const clearCart = useCart((s) => s.clear);
  const [status, setStatus] = useState<Status>("checking");
  const cleared = useRef(false);
  // The payment company can send the card form back to this page inside the payment screen's frame: leave the frame.
  const framed = window.self !== window.top;
  useEffect(() => {
    if (!framed) return;
    try {
      window.top?.location.replace(window.location.href);
    } catch {
      /* the page around the frame is not ours: stay */
    }
  }, [framed]);
  const stash = stashedOrder();
  const orderId = params.get("order_id") ?? stash?.id ?? null;
  const orderKey = params.get("key") ?? stash?.key ?? undefined;

  useEffect(() => {
    if (framed) return;
    if (!orderId) {
      setStatus("failed");
      return;
    }
    let cancelled = false;
    const started = Date.now();
    async function poll() {
      try {
        const order = await fetchPayOrder(orderId!, orderKey ?? "");
        if (cancelled) return;
        if (order.paid || PAID.has(order.status)) {
          setStatus("paid");
          if (!cleared.current) {
            cleared.current = true;
            sessionStorage.removeItem("lh-last-order");
            clearCart();
            track("checkout_completed", { orderId: order.id });
          }
          return;
        }
        if (FAILED.has(order.status)) {
          setStatus("failed");
          track("payment_failed", { orderId: order.id, status: order.status });
          return;
        }
        if (Date.now() - started > TIMEOUT_MS) {
          setStatus("pending");
          return;
        }
        setTimeout(poll, POLL_MS);
      } catch {
        if (!cancelled) setStatus("failed");
      }
    }
    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId, orderKey, clearCart, framed]);

  if (framed) return null;

  return (
    <div className="page-confirm">
      <section className="ok">
        <div className="wrap">
          <div className="ok-a" role="status">
            {status === "checking" ? (
              <>
                <h1 className="ok-h disp"><span className="o1">{t("רגע")}</span><span className="o2">{t("אחד…")}</span></h1>
                <p className="lead">{t("מאשרים את התשלום.")}</p>
              </>
            ) : null}
            {status === "paid" ? (
              <>
                <OkMark big />
                <h1 className="ok-h disp"><span className="o1">{t("תודה")}</span><span className="o2">{t("רבה!")}</span></h1>
                <p className="lead">{orderId ? t("הזמנה מספר {id} נקלטה בהצלחה. נעדכן אתכם לגבי המשלוח. אישור נשלח גם למייל.", { id: orderId }) : t("ההזמנה נקלטה בהצלחה. נעדכן אתכם לגבי המשלוח. אישור נשלח גם למייל.")}</p>
                <Link className="btn btn-red" to="/shop"><span>{t("להמשך קנייה")}</span><Icon.arrow /></Link>
              </>
            ) : null}
            {status === "pending" ? (
              <>
                <h1 className="ok-h disp"><span className="o1">{t("עדיין")}</span><span className="o2">{t("מאשרים…")}</span></h1>
                <p className="lead">{t("אישור התשלום לוקח קצת יותר זמן מהרגיל. אם זה לא מתעדכן בקרוב, צרו קשר ונבדוק.")}</p>
                <button type="button" className="btn btn-ink" onClick={openContact}><span>{t("צרו קשר")}</span><Icon.arrow /></button>
              </>
            ) : null}
            {status === "failed" ? (
              <>
                <h1 style={{ margin: 0, fontSize: 40, fontWeight: 800 }}>{t("לא הצלחנו לאתר את ההזמנה")}</h1>
                <p className="lead">{t("אם השלמתם תשלום, אל דאגה — צרו קשר עם הפרטים שלכם ונסדר את זה.")}</p>
                <button type="button" className="btn btn-ink" onClick={openContact}><span>{t("צרו קשר")}</span><Icon.arrow /></button>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
