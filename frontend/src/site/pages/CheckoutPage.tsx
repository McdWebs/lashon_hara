import { useEffect, useRef, useState } from "react";
import { t, Link, useNavigate } from "../i18n";
import { CityAutocomplete } from "../../components/CityAutocomplete";
import { track } from "../../lib/analytics";
import { useCart } from "../../lib/cart";
import { cartApi, checkoutRequest, type WcShippingPackage } from "../../lib/cartSession";
import { decodeHtmlEntities } from "../../lib/html";
import { Field, FormShell, Reveal, Toggle, useSiteForm, type Values } from "../forms";
import { Icon, Title, moneyLabel, usePageTitle } from "../ui";

const ERROR_MESSAGES: Record<string, string> = {
  woocommerce_rest_product_out_of_stock: "אחד הפריטים בסל אזל מהמלאי. נא לעדכן את הסל ולנסות שוב.",
  woocommerce_rest_missing_email_address: "יש להזין כתובת מייל תקינה.",
  woocommerce_rest_invalid_address: "חסרים פרטים בכתובת — נא לוודא שמולא מספר בניין/דירה.",
};

function billingAddress(v: Values) {
  return {
    first_name: v.firstName ?? "",
    last_name: v.lastName ?? "",
    address_1: v.address1 ?? "",
    address_2: v.address2 ?? "",
    city: v.city ?? "",
    postcode: v.postcode ?? "",
    country: "IL",
    phone: v.phone ?? "",
    email: v.email ?? "",
  };
}

function shippingAddress(v: Values) {
  if (!v.shipElsewhere) {
    const { email: _email, ...rest } = billingAddress(v);
    return rest;
  }
  return {
    first_name: v.shipFirstName ?? "",
    last_name: v.shipLastName ?? "",
    address_1: v.shipAddress1 ?? "",
    address_2: v.shipAddress2 ?? "",
    city: v.shipCity ?? "",
    postcode: v.shipPostcode ?? "",
    country: "IL",
    phone: v.phone ?? "",
  };
}

function addressReady(a: Record<string, string>) {
  return Boolean(a.first_name && a.last_name && a.address_1 && a.address_2 && a.city && a.postcode);
}

function CityField({ form, name }: { form: ReturnType<typeof useSiteForm>; name: string }) {
  const f = form.field(name);
  return (
    <div className={`fld city${f.error ? " bad" : ""}`} id={f.id} tabIndex={-1}>
      <span className="flabel" aria-hidden="true">{t("עיר")}{" "}<span className="req">*</span></span>
      <CityAutocomplete label={t("עיר")} value={f.value || null} onChange={(v) => f.onChange(v ?? "")} onBlur={f.onBlur} />
      <span className="err" role="alert">{f.error}</span>
    </div>
  );
}

export function CheckoutPage() {
  usePageTitle(t("השלמת הזמנה"));
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const unit = useCart((s) => s.currencyMinorUnit);
  const needsShipping = useCart((s) => s.needsShipping);

  const [packages, setPackages] = useState<WcShippingPackage[]>([]);
  const [rateId, setRateId] = useState<string | null>(null);
  const [checkingRates, setCheckingRates] = useState(false);
  const rateRef = useRef<string | null>(null);
  rateRef.current = rateId;
  const packagesRef = useRef<WcShippingPackage[]>([]);
  packagesRef.current = packages;
  // What the store already has for this cart, so pressing pay does not repeat steps that are done.
  const syncedAddress = useRef("");
  const syncedRate = useRef<string | null>(null);

  const shipElsewhere = (v: Values) => Boolean(v.shipElsewhere);
  const form = useSiteForm(
    {
      firstName: { required: true },
      lastName: { required: true },
      phone: { required: true, kind: "tel" },
      email: { required: true, kind: "email" },
      address1: { required: true },
      address2: { required: true },
      city: { required: true },
      postcode: { required: true },
      shipFirstName: { required: true, active: shipElsewhere },
      shipLastName: { required: true, active: shipElsewhere },
      shipAddress1: { required: true, active: shipElsewhere },
      shipAddress2: { required: true, active: shipElsewhere },
      shipCity: { required: true, active: shipElsewhere },
      shipPostcode: { required: true, active: shipElsewhere },
      note: {},
    },
    {
      send: async (v) => {
        try {
          const billing = billingAddress(v);
          const shipping = shippingAddress(v);
          if (needsShipping) {
            let first = packagesRef.current[0];
            if (syncedAddress.current !== JSON.stringify(shipping)) {
              const cart = await cartApi.updateCustomer({ billing_address: billing, shipping_address: shipping });
              first = cart.shipping_rates[0] ?? first;
              syncedRate.current = first?.shipping_rates.find((r) => r.selected)?.rate_id ?? null;
            }
            const rate = rateRef.current ?? first?.shipping_rates.find((r) => r.selected)?.rate_id;
            if (first && rate && syncedRate.current !== rate) await cartApi.selectShippingRate({ package_id: first.package_id, rate_id: rate });
          }
          track("checkout_started");
          const result = await checkoutRequest({
            billing_address: billing,
            shipping_address: needsShipping ? shipping : undefined,
            customer_note: v.note || undefined,
          });
          sessionStorage.setItem("lh-last-order", JSON.stringify({ id: result.order_id, key: result.order_key }));
          // The order exists now; the card is paid for on the payment screen.
          navigate(`/order-pay/${result.order_id}?key=${encodeURIComponent(result.order_key)}`);
        } catch (err) {
          const code = err instanceof Error ? err.message : "checkout_failed";
          track("payment_failed", { code });
          throw new Error(ERROR_MESSAGES[code] ? t(ERROR_MESSAGES[code]) : t("משהו השתבש. מה שמילאתם נשמר — נסו שוב."), { cause: err });
        }
      },
    },
  );

  const v = form.values;
  const shippingTarget = shippingAddress(v);
  const ready = addressReady(shippingTarget) && Boolean(v.firstName && v.lastName);
  const addressKey = JSON.stringify(shippingTarget);

  // The delivery options are the same for every address in Israel, so ask for them as soon as the page opens
  // instead of making the customer fill in the address and wait.
  useEffect(() => {
    if (!hydrated || !needsShipping) return;
    let cancelled = false;
    setCheckingRates(true);
    cartApi
      .updateCustomer({ billing_address: { country: "IL" }, shipping_address: { country: "IL" } })
      .then((cart) => {
        if (cancelled || packagesRef.current.length) return;
        const rates = cart.shipping_rates[0]?.shipping_rates ?? [];
        setPackages(cart.shipping_rates);
        setRateId(rates.find((r) => r.selected)?.rate_id ?? rates[0]?.rate_id ?? null);
        syncedRate.current = rates.find((r) => r.selected)?.rate_id ?? null;
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setCheckingRates(false));
    return () => {
      cancelled = true;
    };
  }, [hydrated, needsShipping]);

  // Once the address is complete, give it to the store quietly, so the order step has less left to do.
  useEffect(() => {
    if (!needsShipping || !ready) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const cart = await cartApi.updateCustomer({ billing_address: billingAddress(v), shipping_address: shippingTarget });
        if (cancelled) return;
        syncedAddress.current = addressKey;
        const rates = cart.shipping_rates[0]?.shipping_rates ?? [];
        syncedRate.current = rates.find((r) => r.selected)?.rate_id ?? null;
        setPackages(cart.shipping_rates);
        setRateId(rates.find((r) => r.rate_id === rateRef.current)?.rate_id ?? rates.find((r) => r.selected)?.rate_id ?? rates[0]?.rate_id ?? null);
      } catch {
        /* the purchase step reports the real problem if it still can't proceed */
      }
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsShipping, ready, addressKey]);

  // The customer's choice is saved at once, in the background.
  function pickRate(id: string) {
    setRateId(id);
    const pkg = packagesRef.current[0];
    if (!pkg) return;
    cartApi
      .selectShippingRate({ package_id: pkg.package_id, rate_id: id })
      .then(() => {
        syncedRate.current = id;
      })
      .catch(() => undefined);
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="page-checkout">
        <section className="phead"><div className="wrap"><Title big>{t("השלמת הזמנה")}</Title></div></section>
        <div className="wrap state">
          <h2>{t("אין פריטים בקופה")}</h2>
          <p>{t("הוסיפו מוצרים מהחנות תחילה.")}</p>
          <Link className="btn btn-ink" to="/shop"><span>{t("לחנות")}</span><Icon.arrow /></Link>
        </div>
      </div>
    );
  }

  const rates = packages[0]?.shipping_rates ?? [];
  const selectedRate = rates.find((r) => r.rate_id === rateId);
  const subtotal = items.reduce((sum, item) => sum + Number(item.lineTotal), 0);
  const total = subtotal + (needsShipping && selectedRate ? Number(selectedRate.price) : 0);

  return (
    <div className="page-checkout">
      <section className="phead"><div className="wrap"><Title big>{t("השלמת הזמנה")}</Title></div></section>
      <div className="wrap co">
        <div className="co-f">
          <FormShell form={form} submitLabel={t("לתשלום")} noConsent>
            <fieldset>
              <legend>{t("פרטי קשר וכתובת למשלוח")}</legend>
              <div className="two">
                <Field f={form.field("firstName")} label={t("שם פרטי")} auto="given-name" />
                <Field f={form.field("lastName")} label={t("שם משפחה")} auto="family-name" />
              </div>
              <div className="two">
                <Field f={form.field("phone")} label={t("טלפון")} type="tel" mode="tel" auto="tel" dir="ltr" />
                <Field f={form.field("email")} label={t("כתובת מייל")} type="email" mode="email" auto="email" dir="ltr" />
              </div>
              <Field f={form.field("address1")} label={t("כתובת")} auto="address-line1" />
              <div className="two">
                <Field f={form.field("address2")} label={t("מספר בניין / דירה")} />
                <CityField form={form} name="city" />
              </div>
              <Field f={form.field("postcode")} label={t("מיקוד")} mode="numeric" auto="postal-code" />
              <Toggle f={form.field("shipElsewhere")}>{t("משלוח לכתובת אחרת")}</Toggle>
              <Reveal open={Boolean(v.shipElsewhere)}>
                <div className="two">
                  <Field f={form.field("shipFirstName")} label={t("שם פרטי")} />
                  <Field f={form.field("shipLastName")} label={t("שם משפחה")} />
                </div>
                <Field f={form.field("shipAddress1")} label={t("כתובת")} />
                <div className="two">
                  <Field f={form.field("shipAddress2")} label={t("מספר בניין / דירה")} />
                  <CityField form={form} name="shipCity" />
                </div>
                <Field f={form.field("shipPostcode")} label={t("מיקוד")} mode="numeric" />
              </Reveal>
            </fieldset>

            {needsShipping ? (
              <fieldset>
                <legend>{t("אופן משלוח")}{" "}<span className="fnote">{t("· משלוח לישראל בלבד")}</span></legend>
                {checkingRates && !rates.length ? <p className="fnote" role="status">{t("בודקים אפשרויות משלוח…")}</p> : null}
                <div className="rates">
                  {rates.map((rate) => (
                    <label className="rate" key={rate.rate_id}>
                      <input type="radio" name="rate" checked={rate.rate_id === rateId} onChange={() => pickRate(rate.rate_id)} />
                      <span className="rd" aria-hidden="true" />
                      <span dir="auto">{decodeHtmlEntities(rate.name)}</span>
                      <b>{Number(rate.price) === 0 ? t("חינם") : moneyLabel(rate.price, rate.currency_minor_unit)}</b>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            <Field f={form.field("note")} label={t("הערה להזמנה")} rows={3} />
            <p className="fnote">{t("התשלום מתבצע בעמוד המאובטח של ספק הסליקה, בשלב הבא.")}</p>
          </FormShell>
        </div>

        <aside className="sum" aria-busy={!hydrated}>
          <h2>{t("סיכום הזמנה")}</h2>
          {!hydrated ? (
            <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="si">
                <span className="si-m skel" />
                <span className="si-n"><span className="skel" style={{ height: 14, width: "80%" }} /><span className="skel" style={{ height: 12, width: "45%" }} /></span>
                <span className="skel" style={{ height: 16, width: 44 }} />
              </div>
              <div className="sr"><span className="skel" style={{ height: 14, width: 56 }} /><span className="skel" style={{ height: 14, width: 90 }} /></div>
              <div className="sr tot"><span className="skel" style={{ height: 14, width: 44 }} /><span className="skel" style={{ height: 40, width: 72 }} /></div>
            </div>
          ) : null}
          {items.map((item) => (
            <div className="si" key={item.key}>
              <span className="si-m">
                {item.image ? <img src={item.image} alt="" /> : null}
                <span className="si-q">{item.quantity}</span>
              </span>
              <span className="si-n" dir="auto">{item.name}{item.options.length ? <small>{item.options.join(" · ")}</small> : null}</span>
              <b>{moneyLabel(item.lineTotal, item.currencyMinorUnit)}</b>
            </div>
          ))}
          {hydrated ? (
            <>
            <div className="sr"><span>{t("משלוח")}</span><span>{selectedRate ? (Number(selectedRate.price) === 0 ? t("חינם") : moneyLabel(selectedRate.price, selectedRate.currency_minor_unit)) : t("לפי אופן המשלוח")}</span></div>
            <div className="sr tot"><span>{t("סה״כ")}</span><b>{moneyLabel(total, unit)}</b></div>
            </>
          ) : null}
          <Link className="link" to="/cart" style={{ alignSelf: "flex-start" }}><span>{t("חזרה לסל")}</span></Link>
        </aside>
      </div>
    </div>
  );
}
