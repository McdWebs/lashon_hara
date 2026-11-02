import { t } from "./i18n";
import type { PayOrder } from "../lib/pay";
import { moneyLabel } from "./ui";

/** The order comes with amounts as decimal strings ("30.00"), while moneyLabel takes agorot. */
const shekels = (amount: string | number) => moneyLabel(Math.round(Number(amount) * 100));

export function OrderSummary({ order }: { order: PayOrder }) {
  const discount = Number(order.discount);
  return (
    <aside className="sum">
      <h2>{t("סיכום הזמנה")}</h2>
      <p className="fnote">{t("הזמנה מספר {id}", { id: order.id })}</p>
      {order.items.map((item, i) => (
        <div className="si" key={i}>
          <span className="si-m">
            {item.image ? <img src={item.image} alt="" /> : null}
            <span className="si-q">{item.quantity}</span>
          </span>
          <span className="si-n" dir="auto">{item.name}{item.options.length ? <small>{item.options.join(" · ")}</small> : null}</span>
          <b>{shekels(item.total)}</b>
        </div>
      ))}
      <div className="pay-r"><span>{t("סכום ביניים")}</span><b>{shekels(order.subtotal)}</b></div>
      {discount > 0 ? <div className="pay-r"><span>{t("הנחה")}</span><b>-{shekels(order.discount)}</b></div> : null}
      <div className="pay-r">
        <span>{t("משלוח")}</span>
        <span>{Number(order.shipping) === 0 ? t("חינם") : shekels(order.shipping)}</span>
      </div>
      {order.shippingTitle ? <p className="fnote" dir="auto">{order.shippingTitle}</p> : null}
      <div className="pay-r tot"><span>{t("סה״כ לתשלום")}</span><b>{shekels(order.total)}</b></div>
      {order.shipTo.address || order.shipTo.city ? (
        <div className="pay-to">
          <span className="fnote">{t("משלוח אל")}</span>
          <span dir="auto">{[order.shipTo.name, order.shipTo.address, order.shipTo.city].filter(Boolean).join(", ")}</span>
        </div>
      ) : null}
    </aside>
  );
}
