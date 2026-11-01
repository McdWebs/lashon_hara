import { t, Link, siteLang } from "../i18n";
import { TERMS_TITLE, TermsHeContent } from "../../content/termsHe";
import { Icon, Title, usePageTitle } from "../ui";

export function NotFoundPage() {
  usePageTitle(t("הדף לא נמצא"));
  return (
    <div className="page-notfound">
      <section className="nf">
        <div className="wrap nf-in">
          <span className="nf-n disp" aria-hidden="true">404</span>
          <div className="nf-t">
            <span className="bar" aria-hidden="true" />
            <h1>{t("הדף לא נמצא.")}</h1>
            <p className="lead">{t("אולי הקישור השתנה. אפשר להתחיל מעמוד הבית.")}</p>
            <Link className="btn btn-red" to="/"><span>{t("לעמוד הבית")}</span><Icon.arrow /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export function TermsPage() {
  usePageTitle(t("תקנון ומדיניות פרטיות"));
  return (
    <section className="legal">
      <div className="wrap">
        <Title>{siteLang() === "en" ? t("תקנון ומדיניות פרטיות") : TERMS_TITLE}</Title>
        {siteLang() === "en" ? <p className="lead">{t("התקנון המלא זמין כרגע בעברית בלבד.")}</p> : null}
        <div className="legal-body" dir="rtl" lang="he"><TermsHeContent /></div>
      </div>
    </section>
  );
}

export function AccessibilityPage() {
  usePageTitle(t("הצהרת נגישות"));
  return (
    <section className="legal">
      <div className="wrap">
        <Title lead={t("[הצהרת הנגישות ופרטי איש הקשר — טקסט מהצוות]")}>{t("הצהרת נגישות")}</Title>
      </div>
    </section>
  );
}
