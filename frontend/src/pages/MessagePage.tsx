import { Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageHeader, Section } from "../components/Section";

export function MessagePage() {
  return (
    <>
      <PageHeader title="המסר" />
      <Section>
        <Typography variant="h2" gutterBottom>
          לשון הרע לא מדבר אליי
        </Typography>
        <Typography sx={{ mb: 2 }}>
          העמותה מעודדת תרבות שיח חיובית במטרה למגר רכילות, שיימינג ובריונות במרחב הפיזי והמקוון, על מנת ליצור חברה סובלנית ומכבדת יותר.
        </Typography>
        <Typography sx={{ mb: 2 }}>דיבור שלילי שנאמר לאחר או על אחר.</Typography>
        <Typography sx={{ mb: 2 }}>
          המבחן: אם לא הייתם אומרים את זה בפני האדם — אל תגידו מאחורי גבו. נכללים בהגדרה השמצות, לעג, רכילות (גם אם הסיפור קרה באמת), הכללה, ביוש, הסתה והלבנת פנים.
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          זהו תוכן חינוכי מהאתר הקיים ואינו מחליף ייעוץ הלכתי או משפטי.
        </Typography>
        <Button component={RouterLink} to="/message/quiz" variant="contained">
          תרגול: האם זה לשון הרע?
        </Button>
      </Section>
    </>
  );
}
