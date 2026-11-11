import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { t, Link, useNavigate } from "../i18n";
import { Dialog } from "@mui/material";
import { Check, Choice, Field, FormShell, Panel, Reveal, Toggle, useSiteForm } from "../forms";
import { useContact } from "../contact";
import { clearSchoolDraft, loadSchoolDraft, saveSchoolDraft } from "../schoolDraft";
import { Icon, Title, usePageTitle } from "../ui";

function DonateForm() {
  const { openDonate } = useContact();
  return (
    <div className="don-card">
      <p>{t("בוחרים סכום, ממלאים פרטים ומשלמים באתר מאובטח.")}</p>
      <button type="button" className="btn btn-red" onClick={openDonate}><span>{t("לתרומה")}</span><Icon.arrow /></button>
    </div>
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

/** Videos that show what a lecture is like, offered to schools that only want bracelets. Add more here. */
const LECTURE_VIDEOS: Array<{ title: string; url: string }> = [
  { title: "ההרצאה של לשון הרע לא מדבר אליי", url: "https://vimeo.com/662680986/186cfef65f" },
];

/**
 * A school's bracelet request. When it is complete, a window asks whether they would like a lecture too:
 * yes takes them to the lecture calendar (nothing is sent yet), bracelets only sends the request.
 */
function SchoolForm({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [asking, setAsking] = useState(false);
  const form = useSiteForm(
    {
      name: { required: true },
      role: { required: true },
      phone: { required: true, kind: "tel" },
      email: { required: true, kind: "email" },
      school: { required: true },
      street: { required: true },
      city: { required: true },
      classes: { required: true, kind: "num" },
      staff: { required: true, kind: "num" },
      students: { required: true, kind: "num" },
      gender: { required: true, kind: "choice" },
      ages: { required: true },
      bracelets: { required: true, kind: "num" },
      distribution: { required: true },
    },
    {
      kind: "school_order",
      initial: { gender: "mixed", ...loadSchoolDraft()?.values },
      gate: () => { setAsking(true); return true; },
      onSent: () => clearSchoolDraft(),
    },
  );

  // What they type is kept as they go, so leaving and coming back finds it as it was.
  useEffect(() => {
    if (!form.done && Object.values(form.values).some((v) => v && v !== "mixed")) saveSchoolDraft(form.values);
  }, [form.values, form.done]);

  function lecture() {
    saveSchoolDraft(form.values, true);
    setAsking(false);
    onClose();
    navigate("/activity");
  }
  function braceletsOnly() {
    setAsking(false);
    void form.submitNow();
  }

  return (
    <>
      <FormShell form={form} submitLabel={t("המשך")} thanksTitle={t("הבקשה נקלטה.")} thanksText={t("נחזור אליכם לאחר בדיקת הפרטים.")}>
        <div className="two">
          <Field f={form.field("name")} label={t("שם מלא")} auto="name" />
          <Field f={form.field("role")} label={t("תפקיד")} />
        </div>
        <div className="two">
          <Field f={form.field("phone")} label={t("טלפון")} type="tel" mode="tel" auto="tel" dir="ltr" />
          <Field f={form.field("email")} label={t("כתובת מייל")} type="email" mode="email" auto="email" dir="ltr" />
        </div>
        <Field f={form.field("school")} label={t("שם בית הספר")} />
        <div className="two">
          <Field f={form.field("street")} label={t("רחוב")} auto="street-address" />
          <Field f={form.field("city")} label={t("עיר")} auto="address-level2" />
        </div>
        <div className="two">
          <Field f={form.field("classes")} label={t("מספר כיתות")} mode="numeric" />
          <Field f={form.field("students")} label={t("מספר תלמידים")} mode="numeric" />
        </div>
        <div className="two">
          <Field f={form.field("staff")} label={t("מספר אנשי צוות")} mode="numeric" />
          <Field f={form.field("bracelets")} label={t("מספר הצמידים המבוקש")} mode="numeric" />
        </div>
        <Choice
          f={form.field("gender")}
          label={t("בנים/בנות")}
          options={[{ value: "boys", label: t("בנים") }, { value: "girls", label: t("בנות") }, { value: "mixed", label: t("מעורב") }]}
        />
        <Field f={form.field("ages")} label={t("גילאים")} note={t("למשל: י׳–י״ב")} />
        <Field f={form.field("distribution")} label={t("איך חשבתם לחלק את הצמידים?")} rows={3} />
      </FormShell>

      <Dialog open={asking} onClose={() => setAsking(false)} disablePortal slotProps={{ paper: { className: "ask-paper", role: "dialog", "aria-label": t("הזמנת הרצאה") } }}>
        <button className="iconbtn ask-x" onClick={() => setAsking(false)} aria-label={t("סגירה")}><Icon.close /></button>
        <h3 className="ask-h disp">{t("רגע לפני שליחה")}</h3>
        <p className="ask-p">{t("רוצים להזמין אלינו גם הרצאה לבית הספר?")}</p>
        <button type="button" className="btn btn-red" onClick={lecture}><span>{t("להזמין הרצאה")}</span><Icon.arrow /></button>
        <p className="ask-s">{t("נעבור ללוח ההרצאות לבחירת תאריך. הפרטים שמילאתם נשמרים ויופיעו מוכנים בבקשה להרצאה.")}</p>
        <div className="ask-or">{t("או")}</div>
        <div className="ask-b">
          <b>{t("רק צמידים")}</b>
          <span>{t("אפשר לשלוח את הבקשה בלי הרצאה. לפני שמחליטים, כך נראית הרצאה:")}</span>
          <ul>
            {LECTURE_VIDEOS.map((v) => <li key={v.url}><a href={v.url} target="_blank" rel="noreferrer"><Icon.play />{t(v.title)}</a></li>)}
          </ul>
          <button type="button" className="btn btn-line" onClick={braceletsOnly}><span>{t("שליחת בקשת הצמידים")}</span></button>
        </div>
      </Dialog>
    </>
  );
}

type PanelKey = "ambassadors" | "story" | "school";

const WAYS: Array<{ title: string; line: string; button: string; panel?: PanelKey; contact?: boolean; to?: string; image?: string; focus?: string }> = [
  { title: "להצטרף לצוות השגרירים", line: "להפיץ את המסר בקהילה, בכיתה או ברשת.", button: "להצטרפות", panel: "ambassadors", image: "/images/site/static.jpg" },
  { title: "לחלק צמידים בעצמכם", line: "צמידי שגרירים מהחנות, לחלוקה בעצמכם.", button: "לצמידים", to: "/shop?collection=bracelets", image: "/images/fabric_bracelet/black_bracelet.jpeg" },
  { title: "להביא את זה לבית הספר", line: "הרצאות וחלוקת צמידים לתלמידים.", button: "לבתי ספר", panel: "school", image: "/images/store_images/hands_heart_sign.jpg" },
  { title: "לשתף את הסיפור שלכם", line: "ספרו לנו איך המסר נגע בכם.", button: "לשיתוף", panel: "story", image: "/images/fabric_bracelet/all_bracelet.jpeg" },
  { title: "צרו קשר", line: "WhatsApp, מייל או טופס קצר.", button: "ליצירת קשר", contact: true, image: "/images/site/contact.jpg", focus: "50% 55%" },
];

const PANEL_TITLES: Record<PanelKey, string> = { ambassadors: "להצטרף לשגרירים", story: "לשתף סיפור", school: "להביא את זה לבית הספר" };

export function JoinPage() {
  usePageTitle(t("הצטרפו"));
  const [params, setParams] = useSearchParams();
  const [panel, setPanel] = useState<PanelKey | null>(null);
  const { openContact } = useContact();

  // The footer's contact icon opens the contact panel directly.
  useEffect(() => {
    const wanted = params.get("panel");
    if (wanted === "story" || wanted === "ambassadors" || wanted === "school") {
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
            <div className="don-h"><span className="don-n disp">01</span><h2 className="disp">{t("לתרום")}</h2></div>
            <p>{t("תרומה מחזקת חינוך וחלוקה חינם של צמידים לבתי ספר ולמוסדות חינוך.")}</p>
          </div>
          <div className="don-f rv"><DonateForm /></div>
        </div>
      </section>

      <section className="wrap ways" aria-label={t("עוד דרכים לקחת חלק")}>
        {WAYS.map((way, i) => (
          <article className="way rv" key={way.title} style={{ "--d": `${(i % 3) * 0.07}s` } as React.CSSProperties}>
            <div className="way-m">
              {way.image ? <img src={way.image} alt="" loading="lazy" style={way.focus ? { objectPosition: way.focus } : undefined} /> : null}
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
        {panel === "school" ? <SchoolForm onClose={() => setPanel(null)} /> : null}
      </Panel>
    </div>
  );
}
