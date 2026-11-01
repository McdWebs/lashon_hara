import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Choice, Field, FormShell, Panel, Reveal, Toggle, useSiteForm } from "../forms";
import { SITE, waLink } from "../../lib/site";
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
    <FormShell form={form} submitLabel="לתרומה" thanksTitle="תודה על התרומה!" thanksText="קיבלנו את הפרטים. ניצור איתכם קשר להשלמת התשלום.">
      <span className="flabel">סוג התרומה</span>
      <Choice f={form.field("frequency")} label="סוג התרומה" options={[{ value: "once", label: "חד־פעמית" }, { value: "monthly", label: "חודשית" }]} />
      <span className="flabel">סכום <span className="req" aria-hidden="true">*</span></span>
      <Choice f={form.field("amount")} label="סכום" options={[...PRESET_AMOUNTS.map((a) => ({ value: a, label: `₪${a}` })), { value: "other", label: "סכום אחר" }]} />
      <Reveal open={form.values.amount === "other"}>
        <Field f={form.field("otherAmount")} label="סכום בשקלים" mode="numeric" />
      </Reveal>
      <div className="two">
        <Field f={form.field("fullName")} label="שם מלא" auto="name" />
        <Field f={form.field("email")} label="כתובת מייל" type="email" mode="email" auto="email" dir="ltr" note="לשם יישלח אישור התרומה" />
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
    <FormShell form={form} submitLabel="להצטרפות" thanksTitle="ברוכים הבאים לצוות!" thanksText="קיבלנו את הפרטים. שלחנו לכם מייל פתיחה.">
      <div className="two">
        <Field f={form.field("name")} label="שם" auto="name" />
        <Field f={form.field("age")} label="גיל" mode="numeric" />
      </div>
      <Field f={form.field("city")} label="עיר" auto="address-level2" />
      <div className="two">
        <Field f={form.field("phone")} label="טלפון" type="tel" mode="tel" auto="tel" dir="ltr" />
        <Field f={form.field("email")} label="כתובת מייל" type="email" mode="email" auto="email" dir="ltr" />
      </div>
      <Field f={form.field("why")} label="למה תרצו להצטרף" rows={3} />
      <Reveal open={minor}>
        <Check f={form.field("parentConsent")}>אישור הורה: אני ההורה/האפוטרופוס ומאשר/ת את ההצטרפות</Check>
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
    <FormShell form={form} submitLabel="לשליחת הסיפור" thanksTitle="תודה ששיתפתם." thanksText="קיבלנו את הסיפור. הצוות יעבור עליו.">
      <Field f={form.field("name")} label="שם" auto="name" />
      <Toggle f={form.field("hideName")}>לא להציג את השם שלי</Toggle>
      <Field f={form.field("story")} label="הסיפור" rows={6} />
      <label className="file">
        <input type="file" accept="image/*,video/*" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
        <span className="file-b"><Icon.upload /><span>{fileName || "הוספת תמונה או סרטון (לא חובה)"}</span></span>
      </label>
      <Check f={form.field("publish")}>אני מאשר/ת לפרסם את הסיפור</Check>
    </FormShell>
  );
}

function ContactForm() {
  const form = useSiteForm({ name: { required: true }, email: { required: true, kind: "email" }, message: { required: true } }, { kind: "contact" });
  return (
    <>
      <div className="cinfo">
        <a className="crow" href={waLink()}><Icon.wa /><span>WhatsApp</span><b dir="ltr">054-3644512</b></a>
        <span className="crow"><Icon.mail /><span>מייל</span><b>[כתובת המייל]</b></span>
        <span className="crow"><Icon.pin /><span>כתובת</span><b>[הכתובת]</b></span>
        <div style={{ display: "flex", gap: 8, paddingTop: 10 }}>
          <a className="iconbtn" href={SITE.instagram} aria-label="Instagram"><Icon.ig /></a>
          <a className="iconbtn" href={SITE.facebook} aria-label="Facebook"><Icon.fb /></a>
        </div>
      </div>
      <FormShell form={form} submitLabel="שליחת ההודעה" thanksTitle="תודה! ההודעה נשלחה." thanksText="נחזור אליכם בהקדם.">
        <Field f={form.field("name")} label="שם" auto="name" />
        <Field f={form.field("email")} label="כתובת מייל" type="email" mode="email" auto="email" dir="ltr" />
        <Field f={form.field("message")} label="הודעה" rows={4} />
      </FormShell>
    </>
  );
}

type PanelKey = "ambassadors" | "story" | "contact";

const WAYS: Array<{ title: string; line: string; button: string; panel?: PanelKey; to?: string; image?: string }> = [
  { title: "להצטרף לצוות השגרירים", line: "להפיץ את המסר בקהילה, בכיתה או ברשת.", button: "להצטרפות", panel: "ambassadors", image: "/images/site/static.jpg" },
  { title: "לחלק צמידים בעצמכם", line: "צמידי שגרירים מהחנות, לחלוקה בעצמכם.", button: "לצמידים", to: "/shop?collection=bracelets", image: "/images/fabric_bracelet/black_bracelet.jpeg" },
  { title: "להביא את זה לבית הספר", line: "הרצאות וחלוקת צמידים לתלמידים.", button: "לבתי ספר", to: "/activity", image: "/images/store_images/hands_heart_sign.jpg" },
  { title: "לשתף את הסיפור שלכם", line: "ספרו לנו איך המסר נגע בכם.", button: "לשיתוף", panel: "story", image: "/images/fabric_bracelet/all_bracelet.jpeg" },
  { title: "צרו קשר", line: "WhatsApp, מייל או טופס קצר.", button: "ליצירת קשר", panel: "contact" },
];

const PANEL_TITLES: Record<PanelKey, string> = { ambassadors: "להצטרף לשגרירים", story: "לשתף סיפור", contact: "צרו קשר" };

export function JoinPage() {
  usePageTitle("הצטרפו");
  const [params, setParams] = useSearchParams();
  const [panel, setPanel] = useState<PanelKey | null>(null);

  // The footer's contact icon opens the contact panel directly.
  useEffect(() => {
    const wanted = params.get("panel");
    if (wanted === "contact" || wanted === "story" || wanted === "ambassadors") {
      setPanel(wanted);
      setParams({}, { replace: true, preventScrollReset: true });
    }
  }, [params, setParams]);

  return (
    <div className="page-join">
      <section className="phead">
        <div className="wrap"><Title big lead="כל אחד יכול לקחת חלק. בחרו איך.">הצטרפו</Title></div>
      </section>

      <section id="donate" className="don">
        <div className="wrap don-in">
          <div className="don-tx rv">
            <span className="don-n disp">01</span>
            <h2 className="disp">לתרום</h2>
            <p>תרומה מחזקת חינוך וחלוקה חינם של צמידים לבתי ספר ולמוסדות חינוך.</p>
          </div>
          <div className="don-f rv"><DonateForm /></div>
        </div>
      </section>

      <section className="wrap ways" aria-label="עוד דרכים לקחת חלק">
        {WAYS.map((way, i) => (
          <article className="way rv" key={way.title} style={{ "--d": `${(i % 3) * 0.07}s` } as React.CSSProperties}>
            <div className="way-m">
              {way.image ? <img src={way.image} alt="" loading="lazy" /> : null}
              <span className="way-n disp">0{i + 2}</span>
            </div>
            <div className="way-b">
              <h3>{way.title}</h3>
              <p>{way.line}</p>
              {way.panel ? (
                <button className="btn btn-ink" onClick={() => setPanel(way.panel!)}><span>{way.button}</span><Icon.arrow /></button>
              ) : (
                <Link className="btn btn-ink" to={way.to!}><span>{way.button}</span><Icon.arrow /></Link>
              )}
            </div>
          </article>
        ))}
      </section>

      <Panel open={panel !== null} onClose={() => setPanel(null)} title={panel ? PANEL_TITLES[panel] : ""}>
        {panel === "ambassadors" ? <AmbassadorForm /> : null}
        {panel === "story" ? <StoryForm /> : null}
        {panel === "contact" ? <ContactForm /> : null}
      </Panel>
    </div>
  );
}
