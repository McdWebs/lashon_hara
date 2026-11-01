import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { track } from "../../lib/analytics";
import { useCart } from "../../lib/cart";
import { getOrder } from "../../lib/cartSession";
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
  usePageTitle("אישור הזמנה");
  const [params] = useSearchParams();
  const clearCart = useCart((s) => s.clear);
  const [status, setStatus] = useState<Status>("checking");
  const cleared = useRef(false);
  const stash = stashedOrder();
  const orderId = params.get("order_id") ?? stash?.id ?? null;
  const orderKey = params.get("key") ?? stash?.key ?? undefined;

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      return;
    }
    let cancelled = false;
    const started = Date.now();
    async function poll() {
      try {
        const order = await getOrder(orderId!, orderKey);
        if (cancelled) return;
        if (PAID.has(order.status)) {
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
  }, [orderId, orderKey, clearCart]);

  return (
    <div className="page-confirm">
      <section className="ok">
        <div className="wrap">
          <div className="ok-a" role="status">
            {status === "checking" ? (
              <>
                <h1 className="ok-h disp"><span className="o1">רגע</span><span className="o2">אחד…</span></h1>
                <p className="lead">מאשרים את התשלום.</p>
              </>
            ) : null}
            {status === "paid" ? (
              <>
                <OkMark big />
                <h1 className="ok-h disp"><span className="o1">תודה</span><span className="o2">רבה!</span></h1>
                <p className="lead">ההזמנה{orderId ? ` מספר ${orderId}` : ""} נקלטה בהצלחה. נעדכן אתכם לגבי המשלוח. אישור נשלח גם למייל.</p>
                <Link className="btn btn-red" to="/shop"><span>להמשך קנייה</span><Icon.arrow /></Link>
              </>
            ) : null}
            {status === "pending" ? (
              <>
                <h1 className="ok-h disp"><span className="o1">עדיין</span><span className="o2">מאשרים…</span></h1>
                <p className="lead">אישור התשלום לוקח קצת יותר זמן מהרגיל. אם זה לא מתעדכן בקרוב, צרו קשר ונבדוק.</p>
                <Link className="btn btn-ink" to="/join?panel=contact"><span>צרו קשר</span><Icon.arrow /></Link>
              </>
            ) : null}
            {status === "failed" ? (
              <>
                <h1 style={{ margin: 0, fontSize: 40, fontWeight: 800 }}>לא הצלחנו לאתר את ההזמנה</h1>
                <p className="lead">אם השלמתם תשלום, אל דאגה — צרו קשר עם הפרטים שלכם ונסדר את זה.</p>
                <Link className="btn btn-ink" to="/join?panel=contact"><span>צרו קשר</span><Icon.arrow /></Link>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
