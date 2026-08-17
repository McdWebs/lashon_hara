import { Typography } from "@mui/material";
import { PageHeader, Section } from "../components/Section";
import { MEDIA } from "../lib/media";

export function AboutPage() {
  return (
    <>
      <PageHeader title="אודות" image={MEDIA.bracelets} imageAlt="צמידים עם המשפט" />
      <Section>
        <Typography variant="h2" gutterBottom>
          המשימה שלנו
        </Typography>
        <Typography sx={{ mb: 2 }}>
          &quot;לשון הרע לא מדבר אליי&quot; הינה עמותה הפועלת לחיזוק תרבות שיח חיובית בישראל וקידום ערכים של סובלנות וכבוד הדדי על ידי העלאת המודעות לנזקי לשון הרע ושיימינג.
        </Typography>
        <Typography sx={{ mb: 2 }}>
          המיזם הוקם בשנת 2007 על ידי איש העסקים דוד הלפרין, ובמסגרתו הופץ המסר באמצעות שלטי חוצות ענקיים בכל הארץ, חלוקת מיליוני סטיקרים וצמידים, ביקורים וחלוקת מוצרים בבתי חולים ובבסיסים צבאיים והפקת תערוכות אומנותיות. בתוך זמן קצר הפך המסר למטבע לשון שגור בפיות רבים.
        </Typography>
        <Typography sx={{ mb: 2 }}>
          מטרת הפרסום היא תזכורת יום־יומית לנזקים הנגרמים מלשון הרע, העלאת המודעות לכוחן של מילים והצהרה ערכית של העונדים את המסר.
        </Typography>
        <Typography sx={{ mb: 2 }}>
          הפעילות נעשתה במימון עצמי, תוך רתימת שותפים ומתנדבים רבים במטרה ליצור תנועה אקטיביסטית. בשנים האחרונות, לאור השיח ברשתות, הוחלט למסד את הפעילות במסגרת עמותה ולהרחיב את החינוך לדור העתיד.
        </Typography>
        <Typography color="text.secondary">מקור: דף האודות באתר הקיים. לא נוספו מספרים או עדויות שלא פורסמו שם.</Typography>
      </Section>
    </>
  );
}
