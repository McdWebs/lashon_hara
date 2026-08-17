import { Typography } from "@mui/material";
import { QuizExperience } from "../components/QuizExperience";
import { PageHeader, Section } from "../components/Section";

export function QuizPage() {
  return (
    <>
      <PageHeader title="האם זה לשון הרע?">
        <Typography sx={{ fontSize: "1.05rem", lineHeight: 1.7 }}>
          תרגול חינוכי. אינו פסק הלכה ואינו ייעוץ משפטי.
        </Typography>
      </PageHeader>
      <Section muted>
        <QuizExperience />
      </Section>
    </>
  );
}
