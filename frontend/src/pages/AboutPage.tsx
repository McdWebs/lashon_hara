import { AboutHeContent } from "../content/aboutHe";
import { PageHeader, Section } from "../components/Section";

export function AboutPage() {
  return (
    <>
      <PageHeader title="אודות" />
      <Section>
        <AboutHeContent />
      </Section>
    </>
  );
}
