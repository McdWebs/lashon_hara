import { TermsHeContent, TERMS_TITLE } from "../content/termsHe";
import { PageHeader, Section } from "../components/Section";

export function TermsPage() {
  return (
    <>
      <PageHeader title={TERMS_TITLE} />
      <Section>
        <TermsHeContent />
      </Section>
    </>
  );
}
