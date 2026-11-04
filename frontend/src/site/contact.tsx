import { createContext, useContext } from "react";
import { t, siteLang } from "./i18n";
import { Field, FormShell, Panel, useSiteForm } from "./forms";
import { SITE, waLink } from "../lib/site";
import { Icon } from "./ui";

/** Opens the contact panel from any page. Provided by the site layout. */
export const ContactContext = createContext<{ openContact: () => void; openDonate: () => void }>({ openContact: () => undefined, openDonate: () => undefined });
export const useContact = () => useContext(ContactContext);

function ContactForm() {
  const form = useSiteForm({ name: { required: true }, email: { required: true, kind: "email" }, message: { required: true } }, { kind: "contact" });
  return (
    <>
      <div className="cinfo">
        <a className="crow" href={waLink()}><Icon.wa /><span>WhatsApp</span><b dir="ltr">052-7027348</b></a>
        <a className="crow" href={`mailto:${SITE.email}`}><Icon.mail /><span>{t("מייל")}</span><b dir="ltr">{SITE.email}</b></a>
        <span className="crow"><Icon.pin /><span>{t("כתובת")}</span><b>{t(SITE.address)}</b></span>
        <div style={{ display: "flex", gap: 8, paddingTop: 10 }}>
          <a className="iconbtn" href={SITE.instagram} aria-label="Instagram"><Icon.ig /></a>
          <a className="iconbtn" href={SITE.facebook} aria-label="Facebook"><Icon.fb /></a>
        </div>
      </div>
      <FormShell form={form} submitLabel={t("שליחת ההודעה")} thanksTitle={t("תודה! ההודעה נשלחה.")} thanksText={t("נחזור אליכם בהקדם.")}>
        <Field f={form.field("name")} label={t("שם")} auto="name" />
        <Field f={form.field("email")} label={t("כתובת מייל")} type="email" mode="email" auto="email" dir="ltr" />
        <Field f={form.field("message")} label={t("הודעה")} rows={4} />
      </FormShell>
    </>
  );
}

export function ContactPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Panel open={open} onClose={onClose} title={t("צרו קשר")}>
      {open ? <ContactForm /> : null}
    </Panel>
  );
}

/**
 * The association's own donation forms on doonline.co, the same one the old site embeds: it takes the amount and the card.
 * Their text lives on doonline's side and form 5362 is bilingual, so a Hebrew-only and an English-only form need
 * creating there; put their ids here and each language shows its own.
 */
const DONATE_FORM = { he: 5362, en: 5362 } as const;

/** Opened from any page by the donate buttons. The form is another site, so it only loads once the window is open. */
export function DonatePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Panel open={open} onClose={onClose} title={t("לתרום")} flush>
      {open ? <iframe className="don-frame" src={`https://doonline.co/lha/f/${DONATE_FORM[siteLang() === "en" ? "en" : "he"]}/`} title={t("טופס תרומה")} allow="payment" /> : null}
    </Panel>
  );
}
