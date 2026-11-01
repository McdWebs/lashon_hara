import { useState } from "react";
import { t, Link } from "./i18n";
import { getConsent, setConsent, type Consent } from "../lib/analytics";

/** Asks once before any analytics runs. The choice is remembered on this device. */
export function CookieBanner() {
  const [choice, setChoice] = useState<Consent | null>(() => getConsent());
  if (choice) return null;

  const answer = (value: Consent) => {
    setConsent(value);
    setChoice(value);
  };

  return (
    <section className="cookie" role="region" aria-label={t("עוגיות")}>
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
