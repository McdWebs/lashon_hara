import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { t, Link } from "../i18n";
import { Check, Choice, Field, FormShell, Panel, Reveal, Toggle, useSiteForm } from "../forms";
import { useContact } from "../contact";
import { Icon, Title, usePageTitle } from "../ui";

const PRESET_AMOUNTS = ["72", "180", "360", "720"];

function DonateForm() {
  const form = useSiteForm(
    {
      frequency: { kind: "choice", required: true },
      amount: { kind: "choice", required: true },
      otherAmount: { required: true, kind: "num", active: (v) => v.amount === "other" },
      fullName: { required: true },
      email: { required: true, kind: "email" },
    },
    { kind: "donate", initial: { frequency: "once" } },
  );
  return (
    <FormShell form={form} submitLabel={t("לתרומה")} thanksTitle={t("תודה על התרומה!")} thanksText={t("קיבלנו את הפרטים. ניצור איתכם קשר להשלמת התשלום.")}>
      <span className="flabel">{t("סוג התרומה")}</span>
      <Choice f={form.field("frequency")} label={t("סוג התרומה")} options={[{ value: "once", label: t("חד־פעמית") }, { value: "monthly", label: t("חודשית") }]} />
      <span className="flabel">{t("סכום")}{" "}<span className="req" aria-hidden="true">*</span></span>
      <Choice f={form.field("amount")} label={t("סכום")} options={[...PRESET_AMOUNTS.map((a) => ({ value: a, label: `₪${a}` })), { value: "other", label: t("סכום אחר") }]} />
      <Reveal open={form.values.amount === "other"}>
        <Field f={form.field("otherAmount")} label={t("סכום בשקלים")} mode="numeric" />
      </Reveal>
      <div className="two">
        <Field f={form.field("fullName")} label={t("שם מלא")} auto="name" />
        <Field f={form.field("email")} label={t("כתובת מייל")} type="email" mode="email" auto="email" dir="ltr" note={t("לשם יישלח אישור התרומה")} />
      </div>
    </FormShell>
  );
}

function AmbassadorForm() {
  const form = useSiteForm(
    {
      name: { required: true },
      age: { required: true, kind: "num" },
      city: { required: true },
      phone: { required: true, kind: "tel" },
      email: { required: true, kind: "email" },
      why: {},
      parentConsent: { required: true, kind: "check", active: (v) => Number(v.age) > 0 && Number(v.age) < 18 },
    },
    { kind: "ambassador" },
  );
  const minor = Number(form.values.age) > 0 && Number(form.values.age) < 18;
  return (
    <FormShell form={form} submitLabel={t("להצטרפות")} thanksTitle={t("ברוכים הבאים לצוות!")} thanksText={t("קיבלנו את הפרטים. שלחנו לכם מייל פתיחה.")}>
      <div className="two">
        <Field f={form.field("name")} label={t("שם")} auto="name" />
        <Field f={form.field("age")} label={t("גיל")} mode="numeric" />
      </div>
      <Field f={form.field("city")} label={t("עיר")} auto="address-level2" />
      <div className="two">
        <Field f={form.field("phone")} label={t("טלפון")} type="tel" mode="tel" auto="tel" dir="ltr" />
        <Field f={form.field("email")} label={t("כתובת מייל")} type="email" mode="email" auto="email" dir="ltr" />
      </div>
      <Field f={form.field("why")} label={t("למה תרצו להצטרף")} rows={3} />
      <Reveal open={minor}>
        <Check f={form.field("parentConsent")}>{t("אישור הורה: אני ההורה/האפוטרופוס ומאשר/ת את ההצטרפות")}</Check>
      </Reveal>
    </FormShell>
  );
}

function StoryForm() {
  const [fileName, setFileName] = useState("");
  const form = useSiteForm(
    { name: {}, hideName: {}, story: { required: true }, publish: { required: true, kind: "check" } },
    { kind: "story", toPayload: (v) => ({ ...v, attachmentName: fileName || undefined }) },
  );
  return (
    <FormShell form={form} submitLabel={t("לשליחת הסיפור")} thanksTitle={t("תודה ששיתפתם.")} thanksText={t("קיבלנו את הסיפור. הצוות יעבור עליו.")}>
      <Field f={form.field("name")} label={t("שם")} auto="name" />
      <Toggle f={form.field("hideName")}>{t("לא להציג את השם שלי")}</Toggle>
      <Field f={form.field("story")} label={t("הסיפור")} rows={6} />
      <label className="file">
        <input type="file" accept="image/*,video/*" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
        <span className="file-b"><Icon.upload /><span>{fileName || t("הוספת תמונה או סרטון (לא חובה)")}</span></span>
      </label>
      <Check f={form.field("publish")}>{t("אני מאשר/ת לפרסם את הסיפור")}</Check>
    </FormShell>
  );
}

type PanelKey = "ambassadors" | "story";

const WAYS: Array<{ title: string; line: string; button: string; panel?: PanelKey; contact?: boolean; to?: string; image?: string }> = [
  { title: "להצטרף לצוות השגרירים", line: "להפיץ את המסר בקהילה, בכיתה או ברשת.", button: "להצטרפות", panel: "ambassadors", image: "/images/site/static.jpg" },
  { title: "לחלק צמידים בעצמכם", line: "צמידי שגרירים מהחנות, לחלוקה בעצמכם.", button: "לצמידים", to: "/shop?collection=bracelets", image: "/images/fabric_bracelet/black_bracelet.jpeg" },
  { title: "להביא את זה לבית הספר", line: "הרצאות וחלוקת צמידים לתלמידים.", button: "לבתי ספר", to: "/activity", image: "/images/store_images/hands_heart_sign.jpg" },
  { title: "לשתף את הסיפור שלכם", line: "ספרו לנו איך המסר נגע בכם.", button: "לשיתוף", panel: "story", image: "/images/fabric_bracelet/all_bracelet.jpeg" },
  { title: "צרו קשר", line: "WhatsApp, מייל או טופס קצר.", button: "ליצירת קשר", contact: true },
];

const PANEL_TITLES: Record<PanelKey, string> = { ambassadors: "להצטרף לשגרירים", story: "לשתף סיפור" };

export function JoinPage() {
  usePageTitle(t("הצטרפו"));
  const [params, setParams] = useSearchParams();
  const [panel, setPanel] = useState<PanelKey | null>(null);
  const { openContact } = useContact();

  // The footer's contact icon opens the contact panel directly.
  useEffect(() => {
    const wanted = params.get("panel");
    if (wanted === "story" || wanted === "ambassadors") {
      setPanel(wanted);
      setParams({}, { replace: true, preventScrollReset: true });
    }
  }, [params, setParams]);

  return (
    <div className="page-join">
      <section className="phead">
        <div className="wrap"><Title big lead={t("כל אחד יכול לקחת חלק. בחרו איך.")}>{t("הצטרפו")}</Title></div>
      </section>

      <section id="donate" className="don">
        <div className="wrap don-in">
          <div className="don-tx rv">
            <span className="don-n disp">01</span>
            <h2 className="disp">{t("לתרום")}</h2>
            <p>{t("תרומה מחזקת חינוך וחלוקה חינם של צמידים לבתי ספר ולמוסדות חינוך.")}</p>
          </div>
          <div className="don-f rv"><DonateForm /></div>
        </div>
      </section>

      <section className="wrap ways" aria-label={t("עוד דרכים לקחת חלק")}>
        {WAYS.map((way, i) => (
          <article className="way rv" key={way.title} style={{ "--d": `${(i % 3) * 0.07}s` } as React.CSSProperties}>
            <div className="way-m">
              {way.image ? <img src={way.image} alt="" loading="lazy" /> : null}
              <span className="way-n disp">0{i + 2}</span>
            </div>
            <div className="way-b">
              <h3>{t(way.title)}</h3>
              <p>{t(way.line)}</p>
              {way.panel || way.contact ? (
                <button className="btn btn-ink" onClick={() => (way.contact ? openContact() : setPanel(way.panel!))}><span>{t(way.button)}</span><Icon.arrow /></button>
              ) : (
                <Link className="btn btn-ink" to={way.to!}><span>{t(way.button)}</span><Icon.arrow /></Link>
              )}
            </div>
          </article>
        ))}
      </section>

      <Panel open={panel !== null} onClose={() => setPanel(null)} title={panel ? t(PANEL_TITLES[panel]) : ""}>
        {panel === "ambassadors" ? <AmbassadorForm /> : null}
        {panel === "story" ? <StoryForm /> : null}
      </Panel>
    </div>
  );
}
