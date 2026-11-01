import { Link } from "react-router-dom";
import { TERMS_TITLE, TermsHeContent } from "../../content/termsHe";
import { Icon, Title, usePageTitle } from "../ui";

export function NotFoundPage() {
  usePageTitle("הדף לא נמצא");
  return (
    <div className="page-notfound">
      <section className="nf">
        <div className="wrap nf-in">
          <span className="nf-n disp" aria-hidden="true">404</span>
          <div className="nf-t">
            <span className="bar" aria-hidden="true" />
            <h1>הדף לא נמצא.</h1>
            <p className="lead">אולי הקישור השתנה. אפשר להתחיל מעמוד הבית.</p>
            <Link className="btn btn-red" to="/"><span>לעמוד הבית</span><Icon.arrow /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export function TermsPage() {
  usePageTitle("תקנון ומדיניות פרטיות");
  return (
    <section className="legal">
      <div className="wrap">
        <Title>{TERMS_TITLE}</Title>
        <div className="legal-body"><TermsHeContent /></div>
      </div>
    </section>
  );
}

export function AccessibilityPage() {
  usePageTitle("הצהרת נגישות");
  return (
    <section className="legal">
      <div className="wrap">
        <Title lead="[הצהרת הנגישות ופרטי איש הקשר — טקסט מהצוות]">הצהרת נגישות</Title>
      </div>
    </section>
  );
}
