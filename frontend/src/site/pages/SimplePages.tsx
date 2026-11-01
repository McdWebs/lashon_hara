import { t, Link, siteLang } from "../i18n";
import { TERMS_TITLE, TermsHeContent } from "../../content/termsHe";
import { SITE, waLink } from "../../lib/site";
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
        <Title>{t("הצהרת נגישות")}</Title>
        {siteLang() === "en" ? <p className="lead">{t("הצהרת הנגישות המלאה זמינה כרגע בעברית בלבד.")}</p> : null}
        <div className="legal-body" dir="rtl" lang="he">
          <p>
            באתר "לשון הרע לא מדבר אליי" אנחנו מאמינים שכל אדם זכאי לגלוש, ללמוד ולקנות באתר בצורה עצמאית ושוויונית, ופועלים כדי שהאתר יהיה נגיש לאנשים עם מוגבלות.
          </p>

          <h2>התאמות הנגישות באתר</h2>
          <p>האתר נבנה במטרה לעמוד בדרישות תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג–2013, ובהנחיות WCAG 2.0 ברמה AA ובתקן הישראלי ת"י 5568. במסגרת זו:</p>
          <ul>
            <li>תפריט נגישות זמין בכל עמוד (הכפתור בפינת המסך), ומאפשר להגדיל ולהקטין טקסט, להפעיל ניגודיות גבוהה, להדגיש קישורים ולעצור אנימציות.</li>
            <li>אפשר לנווט באתר במקלדת בלבד, כולל תפריטים, חלונות ומילוי טפסים. מקום המיקוד במקלדת מסומן בבירור.</li>
            <li>מבנה העמודים מבוסס כותרות היררכיות ורכיבים סמנטיים, כדי לתמוך בקוראי מסך.</li>
            <li>לתמונות ולכפתורים יש תיאור טקסטואלי, ולשדות הטפסים יש תוויות והודעות שגיאה ברורות.</li>
            <li>האתר מותאם למסכים בגדלים שונים, ותומך בהגדלת טקסט של עד 200% ללא אובדן תוכן.</li>
            <li>האנימציות מכבדות את הגדרת "הפחתת תנועה" של מערכת ההפעלה.</li>
          </ul>

          <h2>מגבלות ידועות</h2>
          <p>
            למרות מאמצינו, ייתכן שחלק מהתכנים באתר עדיין אינם נגישים במלואם, למשל תמונות מוצרים שהועלו ללא תיאור מלא, קבצים ותכנים מצולמים ישנים, או שירותים של צד שלישי כמו מערכת התשלום. אנחנו ממשיכים לבדוק ולשפר.
          </p>

          <h2>פנייה בנושא נגישות</h2>
          <p>
            נתקלתם בקושי, או שיש לכם הצעה לשיפור? נשמח לשמוע ולטפל בהקדם, ובכל מקרה נשיב בתוך זמן סביר. אפשר לפנות אלינו בוואטסאפ או דרך <Link to="/join?panel=contact">טופס יצירת הקשר</Link>. כדי שנוכל לסייע, כדאי לציין את כתובת העמוד, תיאור הקושי, ואת הדפדפן או הטכנולוגיה המסייעת שבה השתמשתם.
          </p>
          <p>
            <a className="btn btn-ink" href={waLink("שלום, אני פונה בנושא נגישות באתר")}><span>פנייה בוואטסאפ</span></a>
          </p>
          <p>שעות מענה: {SITE.supportHours}.</p>

          <p className="legal-date">הצהרה זו עודכנה לאחרונה ב־1 בנובמבר 2026.</p>
        </div>
      </div>
    </section>
  );
}
