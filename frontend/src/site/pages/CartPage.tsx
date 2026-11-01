import { useState } from "react";
import { t, Link } from "../i18n";
import { useCart, type CartItem } from "../../lib/cart";
import { Icon, Title, moneyLabel, usePageTitle } from "../ui";

export const FREE_SHIPPING_MINOR = 10_000;

function Line({ item }: { item: CartItem }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const [error, setError] = useState(false);
  const run = (action: Promise<void>) => {
    setError(false);
    action.catch(() => setError(true));
  };
  return (
    <li className="cl">
      <div className="cl-in">
        <Link className="cl-m" to={`/shop/product/${item.id}`} tabIndex={-1} aria-hidden="true">
          {item.image ? <img src={item.image} alt="" /> : null}
        </Link>
        <div className="cl-b">
          <Link className="cl-n" to={`/shop/product/${item.id}`} dir="auto">{item.name}</Link>
          <span className="cl-o" dir="auto">{[...item.options, t("{price} ליחידה", { price: moneyLabel(item.price, item.currencyMinorUnit) })].join(" · ")}</span>
          <div className="cl-r">
            <div className="qty">
              <button aria-label={t("הפחתת כמות: {name}", { name: item.name })} onClick={() => run(setQuantity(item.key, item.quantity - 1))}><Icon.minus /></button>
              <span aria-live="polite">{item.quantity}</span>
              <button aria-label={t("הוספת כמות: {name}", { name: item.name })} onClick={() => run(setQuantity(item.key, item.quantity + 1))}><Icon.plus /></button>
            </div>
            <button className="rm" onClick={() => run(removeItem(item.key))}>{t("הסרה")}</button>
          </div>
          {error ? <span className="err on" role="alert">{t("לא הצלחנו לעדכן. נסו שוב.")}</span> : null}
        </div>
        <span className="cl-t">{moneyLabel(item.lineTotal, item.currencyMinorUnit)}</span>
      </div>
    </li>
  );
}

export function CartPage() {
  usePageTitle(t("סל קניות"));
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const unit = useCart((s) => s.currencyMinorUnit);
  const subtotal = items.reduce((sum, item) => sum + Number(item.lineTotal), 0);
  const threshold = FREE_SHIPPING_MINOR * 10 ** (unit - 2);
  const left = threshold - subtotal;

  return (
    <div className="page-cart">
      <section className="phead"><div className="wrap"><Title big>{t("סל קניות")}</Title></div></section>

      {!hydrated ? (
        <div className="wrap cart" aria-hidden="true">
          <div className="skel" style={{ height: 240 }} />
          <div className="skel" style={{ height: 240 }} />
        </div>
      ) : items.length === 0 ? (
        <div className="wrap empty">
          <h2>{t("הסל ריק")}</h2>
          <p>{t("עברו בחנות והוסיפו מוצרים שמפיצים את המסר.")}</p>
          <Link className="btn btn-ink" to="/shop"><span>{t("לחנות")}</span><Icon.arrow /></Link>
        </div>
      ) : (
        <div className="wrap cart">
          <div>
            <div className="ship">
              <span>{left > 0 ? t("עוד {left} למשלוח חינם לנקודות האיסוף", { left: moneyLabel(left, unit) }) : t("משלוח חינם לנקודות האיסוף")}</span>
              <span className="shipbar"><span style={{ transform: `scaleX(${Math.min(1, subtotal / threshold)})` }} /></span>
            </div>
            <ul className="cls">{items.map((item) => <Line key={item.key} item={item} />)}</ul>
          </div>
          <aside className="sum">
            <h2>{t("סיכום הזמנה")}</h2>
            <div className="sr"><span>{t("סכום ביניים")}</span><b>{moneyLabel(subtotal, unit)}</b></div>
            <div className="sr"><span>{t("משלוח")}</span><span>{t("יחושב בקופה")}</span></div>
            <Link className="btn btn-red" to="/checkout" style={{ width: "100%" }}><span>{t("להמשך לקופה")}</span><Icon.arrow /></Link>
            <Link className="link" to="/shop" style={{ alignSelf: "center" }}><span>{t("המשך קנייה")}</span></Link>
          </aside>
        </div>
      )}
    </div>
  );
}
