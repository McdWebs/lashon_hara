import { useLayoutEffect, useRef, useState } from "react";
import { t, Link } from "./i18n";
import { getConsent, setConsent, type Consent } from "../lib/analytics";

/** Asks once before any analytics runs. The choice is remembered on this device. */
export function CookieBanner() {
  const [choice, setChoice] = useState<Consent | null>(() => getConsent());
  const box = useRef<HTMLElement>(null);

  // Tells the floating accessibility button how tall the banner is, so it sits above the banner instead of on it.
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const root = document.documentElement;
    const tell = () => root.style.setProperty("--cookie-h", `${el.offsetHeight + 4}px`);
    tell();
    const ro = new ResizeObserver(tell);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--cookie-h");
    };
  }, [choice]);

  if (choice) return null;

  const answer = (value: Consent) => {
    setConsent(value);
    setChoice(value);
  };

  return (
    <section className="cookie" ref={box} role="region" aria-label={t("עוגיות")}>
      <p>
        {t("אנחנו משתמשים בעוגיות לסטטיסטיקה אנונימית, כדי להבין איך משתמשים באתר ולשפר אותו.")}{" "}
        <Link to="/terms">{t("מדיניות הפרטיות")}</Link>
      </p>
      <div className="cookie-b">
        <button type="button" className="btn btn-red" onClick={() => answer("accepted")}><span>{t("מאשרים")}</span></button>
        <button type="button" className="btn btn-line" onClick={() => answer("declined")}><span>{t("לא, תודה")}</span></button>
      </div>
    </section>
  );
}
