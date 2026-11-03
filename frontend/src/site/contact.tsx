import { createContext, useContext } from "react";
import { t } from "./i18n";
import { Field, FormShell, Panel, useSiteForm } from "./forms";
import { SITE, waLink } from "../lib/site";
import { Icon } from "./ui";

/** Opens the contact panel from any page. Provided by the site layout. */
export const ContactContext = createContext<{ openContact: () => void }>({ openContact: () => undefined });
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
