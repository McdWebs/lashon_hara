import {
  Box,
  Button,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { ReactNode } from "react";
import { Band } from "../components/Band";
import { HelplinesList } from "./helplinesHe";

function P({ children }: { children: ReactNode }) {
  return (
    <Typography sx={{ mb: 2, fontSize: "1rem", lineHeight: 1.85 }}>
      {children}
    </Typography>
  );
}

function H2({ children }: { children: ReactNode }) {
  return (
    <Typography
      component="h2"
      sx={{ mt: { xs: 0, md: 0 }, mb: 2, fontWeight: 700, fontSize: { xs: "1.35rem", md: "1.55rem" }, lineHeight: 1.35 }}
    >
      {children}
    </Typography>
  );
}

function Tip({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        my: 3,
        py: 2.5,
        px: 3,
        borderInlineStart: "3px solid",
        borderColor: "primary.main",
        bgcolor: "background.default",
        borderRadius: 1,
      }}
    >
      <Typography sx={{ fontSize: "1.05rem", lineHeight: 1.85, fontWeight: 600 }}>
        {children}
      </Typography>
    </Box>
  );
}

function ActionItem({
  title,
  body,
  dark,
}: {
  title: string;
  body: ReactNode;
  dark?: boolean;
}) {
  return (
    <Box
      sx={{
        borderTop: "1px solid",
        borderColor: dark ? "rgba(255,255,255,0.15)" : "divider",
        py: 2.5,
      }}
    >
      <Typography sx={{ fontWeight: 600, mb: 0.75, color: dark ? "#fff" : undefined }}>
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: "1rem",
          lineHeight: 1.85,
          color: dark ? "rgba(255,255,255,0.82)" : "text.secondary",
        }}
      >
        {body}
      </Typography>
    </Box>
  );
}

const OATH_PREVIEW = [
  "אני מתחייב/ת בזאת להימנע מהפצת לשון הרע ודברי רכילות.",
  "אני מתחייב/ת לשמור על שיח סובלני ומכבד, לדון בדרכי נועם.",
  "אני מתחייב/ת להפיץ את המסר בסביבתי ולעצור שיחות שעלולות להגיע ללשון הרע.",
  "אני מתחייב/ת לעשות כל שביכולתי כדי לנקות את החברה שלנו מביוש, בריונות והחרמות.",
] as const;

export function MessageHeContent({ loc }: { loc: (path: string) => string }) {
  return (
    <>
      <P>
        העמותה מעודדת תרבות שיח חיובית במטרה למגר רכילות, שיימינג ובריונות במרחב הפיזי והמקוון, על מנת
        ליצור חברה סובלנית ומכבדת יותר.
      </P>
      <P>
        המסר &quot;לשון הרע לא מדבר אליי&quot; הוא לא רק סלוגן — הוא התחייבות אישית: אני בוחר/ת שלא
        להשתתף בהפצת פגיעה, ולא להיות צינור שמעביר אותה הלאה.
      </P>

      <Band tone="paper">
        <H2>מה זה לשון הרע?</H2>
        <Typography variant="h3" sx={{ fontSize: { xs: "1.2rem", md: "1.35rem" }, mb: 2, lineHeight: 1.4 }}>
          דיבור שלילי שנאמר לאחר או על אחר.
        </Typography>
        <Tip>
          המבחן הפשוט: אם לא הייתם אומרים את זה בפני האדם — אל תגידו מאחורי גבו.
        </Tip>
        <P>
          בהגדרה הזאת כלולים השמצות, לעג, רכילות (גם סיפור שקרה באמת), הכללה, ביוש (שיימינג), הסתה
          והלבנת פנים.
        </P>
        <P>
          בעצם, לשון הרע זה כל דיבור על האחר שאין בו ערך מוסף משמעותי או משהו שתורם ללמידה לחיים.
        </P>
        <Button component={RouterLink} to={loc("/message/quiz")} variant="contained" sx={{ mt: 1 }}>
          תרגול: האם זה לשון הרע?
        </Button>
      </Band>

      <Box sx={{ py: { xs: 5, md: 7 } }}>
        <H2>למה זה חשוב?</H2>
        <P>
          את הנזק של הפצת לשון הרע קשה לאמוד. מהרגע שאדם אמר משהו על אחר, אין לו שליטה על הדברים
          שיופצו, על היקף החשיפה שלהם, ועל ההשלכות — איבוד מקומות עבודה, הפסד מוניטין, נזקים כלכליים,
          ואף נטילת חיים.
        </P>
        <P>
          תרבות הדיבור משקפת את החברה בה אנחנו חיים. ככל שנשכיל &quot;לנקות&quot; אותה ולהשתמש בשיח
          מכבד וענייני, נרוויח חברה סובלנית ובטוחה יותר — באמצעות מודעות, חינוך, והפצת מסרים של
          אהבת חינם.
        </P>
        <Typography color="text.secondary" sx={{ fontSize: "0.95rem", lineHeight: 1.75 }}>
          זהו תוכן חינוכי מהאתר הקיים ואינו מחליף ייעוץ הלכתי או משפטי.{" "}
          <Link component={RouterLink} to={loc("/about")}>
            קראו עוד באודות
          </Link>
          .
        </Typography>
      </Box>

      <Band tone="dark">
        <H2>מה עושים כשנתקלים בלשון הרע?</H2>
        <Typography sx={{ mb: 2, fontSize: "1rem", lineHeight: 1.85, color: "rgba(255,255,255,0.85)" }}>
          שינוי חברתי מתחיל מאיתנו. כל אחד שולט קודם כל על הדברים שהוא אומר — ולכן אחריות אישית
          לשינוי השיח היא המקור להפסקת הפצת לשון הרע.
        </Typography>
        <ActionItem
          dark
          title='יודעים מידע רכילותי "עסיסי" על האחר?'
          body="הפסקת הפצתו בידיים שלכם. בואו נתאפק מלספר אותו הלאה — לא היינו רוצים שיספרו דברים כאלו עלינו."
        />
        <ActionItem
          dark
          title="רוצים לערוך דיון, להעביר ביקורת, להביע דעתכם?"
          body="התייחסו לגופו של עניין, בצורה מכבדת, שמרו על תרבות דיון ותנו מקום גם לזה שמולכם להתבטא."
        />
        <ActionItem
          dark
          title="נוכחים בשיחה שמתחילה בה לשון הרע?"
          body='אפשר לבחור שלא ידברו לידכם לשון הרע — כמו שנהוג לבקש שלא יעשנו לידכם.'
        />
        <ActionItem
          dark
          title="קראתם תגובה פוגענית ברשת?"
          body='הגיבו: "יש דרך יפה יותר לכתוב את הדברים. לשון הרע לא מדבר אליי". אפשר גם לחסום ולמחוק מגיבים פוגעניים.'
        />
        <ActionItem
          dark
          title="פנייה לעזרה"
          body="אם הפיצו עליכם לשון הרע, בכתב או בעל פה — פנו למקור או לפלטפורמה בה התפרסמו הדברים ולבקשו תיקון או הסרה."
        />
        <ActionItem
          dark
          title="במקרה של קטינים"
          body="חשוב ליידע מבוגר תומך או משפחה שיסייעו בטיפול."
        />
      </Band>

      <Box sx={{ py: { xs: 5, md: 7 } }}>
        <H2>מוקדי עזרה</H2>
        <Box
          sx={{
            p: 3,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.default",
          }}
        >
          <HelplinesList />
        </Box>
        <Typography sx={{ mt: 3, fontSize: "0.95rem", lineHeight: 1.75, color: "text.secondary" }}>
          ללשון הרע יכולות להיות השלכות משפטיות — חוק לשון הרע קובע פיצוי של עד 50,000 ש&quot;ח
          לנפגעים.
        </Typography>
      </Box>

      <Band tone="paper">
        <H2>השינוי מתחיל בי</H2>
        <Stack spacing={1.5} sx={{ mb: 3, maxWidth: 640 }}>
          {OATH_PREVIEW.map((line) => (
            <Typography
              key={line}
              sx={{
                pl: 2,
                borderInlineStart: "2px solid",
                borderColor: "primary.main",
                lineHeight: 1.75,
                fontSize: "0.98rem",
              }}
            >
              {line}
            </Typography>
          ))}
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button component={RouterLink} to={loc("/join/commitment")} variant="contained">
            חתימה על ההתחייבות
          </Button>
          <Button component={RouterLink} to={loc("/join/ambassadors")} variant="outlined">
            שגרירות והתנדבות
          </Button>
          <Button component={RouterLink} to={loc("/stories")} variant="text">
            סיפורים מהשטח
          </Button>
        </Stack>
      </Band>
    </>
  );
}
