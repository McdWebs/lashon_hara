import { useCallback, useEffect, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { t, Link, useNavigate } from "../i18n";
import { useContact } from "../contact";
import { fetchPayFrame, fetchPayOrder, type PayOrder } from "../../lib/pay";
import { OrderSummary } from "../OrderSummary";
import { Icon, Title, usePageTitle } from "../ui";

const POLL_MS = 3000;

type Load = { state: "loading" } | { state: "invalid" } | { state: "error" } | { state: "ready"; order: PayOrder };

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/** The secure card page, inside the site. The card number is typed on the payment company's page, never here. */
function CardFrame({ id, orderKey }: { id: string; orderKey: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { openContact } = useContact();

  useEffect(() => {
    let cancelled = false;
    setSrc(null);
    setFailed(false);
    setLoaded(false);
    fetchPayFrame(id, orderKey)
      .then((url) => !cancelled && setSrc(url))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [id, orderKey, attempt]);

  if (failed) {
    return (
      <div className="payframe state" role="alert">
        <h3>{t("לא הצלחנו לפתוח את עמוד התשלום.")}</h3>
        <p>{t("ההזמנה שלכם שמורה. נסו שוב, ואם זה לא עובד צרו קשר.")}</p>
        <div className="pay-b">
          <button type="button" className="btn btn-ink" onClick={() => setAttempt((n) => n + 1)}><span>{t("נסו שוב")}</span></button>
          <button type="button" className="btn btn-line" onClick={openContact}><span>{t("צרו קשר")}</span></button>
        </div>
      </div>
    );
  }

  return (
    <div className="payframe">
      {!src || !loaded ? <div className="skel payframe-s" aria-hidden="true"><span>{t("טוענים את עמוד התשלום…")}</span></div> : null}
      {src ? (
        <iframe
          className={loaded ? "on" : ""}
          src={src}
          title={t("תשלום מאובטח")}
          allow="payment"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoaded(true)}
        />
      ) : null}
    </div>
  );
}

export function PayPage() {
  usePageTitle(t("תשלום"));
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const key = params.get("key") ?? "";
  const navigate = useNavigate();
  const { openContact } = useContact();
  const [load, setLoad] = useState<Load>({ state: "loading" });

  // Not for search engines: a payment link is private.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const toConfirmation = useCallback(() => {
    sessionStorage.setItem("lh-last-order", JSON.stringify({ id, key }));
    navigate(`/order-confirmation?order_id=${encodeURIComponent(id)}&key=${encodeURIComponent(key)}`);
  }, [id, key, navigate]);

  useEffect(() => {
    if (!key) {
      setLoad({ state: "invalid" });
      return;
    }
    let cancelled = false;
    fetchPayOrder(id, key)
      .then((order) => !cancelled && setLoad({ state: "ready", order }))
      .catch((err) => !cancelled && setLoad({ state: err instanceof Error && err.message === "order_not_found" ? "invalid" : "error" }));
    return () => {
      cancelled = true;
    };
  }, [id, key]);

  const order = load.state === "ready" ? load.order : null;

  // Already paid, or paid while this page is open: go to the thank-you page.
  useEffect(() => {
    if (order?.paid) toConfirmation();
  }, [order?.paid, toConfirmation]);

  // The payment company tells the store when the card was charged; watch for that.
  useEffect(() => {
    if (!order?.payable) return;
    let cancelled = false;
    const check = () => {
      fetchPayOrder(id, key)
        .then((next) => {
          if (!cancelled && (next.paid || !next.payable)) setLoad({ state: "ready", order: next });
        })
        .catch(() => undefined);
    };
    const timer = window.setInterval(check, POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [order?.payable, id, key]);

  if (!/^\d{1,10}$/.test(id)) return <Navigate to="/shop" replace />;

  return (
    <div className="page-pay">
      <section className="phead">
        <div className="wrap"><Title big>{t("תשלום")}</Title></div>
      </section>

      {load.state === "loading" ? (
        <div className="wrap co" aria-hidden="true">
          <div className="skel" style={{ height: 520 }} />
          <div className="skel" style={{ height: 360 }} />
        </div>
      ) : null}

      {load.state === "invalid" || load.state === "error" ? (
        <div className="wrap state" role="alert">
          <h2>{load.state === "invalid" ? t("הקישור לתשלום לא תקין.") : t("לא הצלחנו לטעון את ההזמנה.")}</h2>
          <p>{load.state === "invalid" ? t("בדקו שהקישור נפתח במלואו, או צרו קשר ונעזור.") : t("נסו לרענן את הדף, ואם זה לא עובד צרו קשר.")}</p>
          <div className="pay-b">
            <button type="button" className="btn btn-ink" onClick={openContact}><span>{t("צרו קשר")}</span><Icon.arrow /></button>
            <Link className="btn btn-line" to="/shop"><span>{t("לחנות")}</span></Link>
          </div>
        </div>
      ) : null}

      {order && !order.paid && !order.payable ? (
        <div className="wrap co">
          <div className="co-f">
            <div className="payframe state" role="status">
              <h3>{t("ההזמנה הזאת כבר לא פתוחה לתשלום.")}</h3>
              <p>{t("אם זו טעות, צרו קשר ונבדוק.")}</p>
              <div className="pay-b">
                <button type="button" className="btn btn-ink" onClick={openContact}><span>{t("צרו קשר")}</span><Icon.arrow /></button>
                <Link className="btn btn-line" to="/shop"><span>{t("לחנות")}</span></Link>
              </div>
            </div>
          </div>
          <OrderSummary order={order} />
        </div>
      ) : null}

      {order && order.payable ? (
        <div className="wrap co">
          <div className="co-f">
            <div className="pay-h">
              <span className="pay-lock"><LockIcon /></span>
              <div>
                <h2>{t("תשלום בכרטיס אשראי")}</h2>
                <p>{t("התשלום מתבצע בעמוד מאובטח של חברת הסליקה. פרטי הכרטיס לא נשמרים באתר שלנו.")}</p>
              </div>
            </div>
            <CardFrame id={id} orderKey={key} />
            <div className="pay-f">
              <span>{t("שילמתם והעמוד לא התעדכן? אל דאגה, נעדכן אתכם במייל.")}</span>
              <button type="button" className="pay-link" onClick={openContact}>{t("צריכים עזרה?")}</button>
            </div>
          </div>
          <OrderSummary order={order} />
        </div>
      ) : null}
    </div>
  );
}
