import { QuizExperience } from "../components/QuizExperience";
import { PageHeader, Section } from "../components/Section";
import { Typography } from "@mui/material";

export function QuizPage() {
  return (
    <>
      <PageHeader title="האם זה לשון הרע?" />
      <Section>
        <Typography sx={{ mb: 3 }} color="text.secondary">
          תרגול חינוכי לפי ההגדרה באתר הקיים. אינו פסק הלכה ואינו ייעוץ משפטי.
        </Typography>
        <QuizExperience />
      </Section>
    </>
  );
}
