import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

function H3({ children }: { children: ReactNode }) {
  return (
    <Typography
      component="h3"
      sx={{ mb: 1.5, fontWeight: 700, fontSize: "1.1rem", lineHeight: 1.35 }}
    >
      {children}
    </Typography>
  );
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
      <Box
        sx={{
          flexShrink: 0,
          width: 24,
          height: 24,
          borderRadius: "50%",
          bgcolor: "primary.main",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 13,
          mt: 0.15,
        }}
      >
        {n}
      </Box>
      <Typography sx={{ fontSize: "0.95rem", lineHeight: 1.65, color: "text.secondary" }}>
        {children}
      </Typography>
    </Box>
  );
}

export function SchoolOrderProcessContent() {
  return (
    <Box>
      <H3>תהליך הזמנות לבתי ספר</H3>

      <Step n={1}>
        <strong>מי יכול להגיש?</strong> — בקשה מטעם נציגות בית הספר: מנהל/ת, רכז/ת שכבה או
        מורה.
      </Step>
      <Step n={2}>
        <strong>מלאו את כל הפרטים</strong> — שם בית הספר, כמות תלמידים, מספר כיתות, גילאים,
        מספר אנשי צוות, וכמה צמידים מבוקשים. ציינו גם באיזו מסגרת אתם מתכננים לחלק את הצמידים
        לתלמידים.
      </Step>
      <Step n={3}>
        <strong>צרפו הצהרה</strong> — טופס הצהרה על מספר התלמידים ואנשי הצוות במוסד, על גבי
        מסמך רשמי של בית הספר (חתום ומוסמך). ניתן לשלוח את המסמך ב-WhatsApp לאחר מילוי הבקשה.
      </Step>
      <Step n={4}>
        <strong>שליחה ובדיקה</strong> — לאחר קבלת הבקשה נבדוק את הפרטים ונחזור אליכם. בקשה
        שתישלח ללא פרטים מלאים לא תיענה.
      </Step>
      <Step n={5}>
        <strong>אישור ומשלוח</strong> — לאחר אישור הבקשה נארגן את המשלוח. משך זמן ההגעה
        המצוין בעת בחירת המשלוח הוא לאחר אישור הבקשה, במידה ואושרה. במידה והבקשה לא תאושר —
        יוחזר תשלום דמי המשלוח.
      </Step>

      <Box
        sx={{
          mt: 2,
          py: 1.5,
          px: 2,
          borderInlineStart: "3px solid",
          borderColor: "primary.main",
          bgcolor: "background.default",
          borderRadius: 1,
        }}
      >
        <Typography sx={{ fontSize: "0.9rem", lineHeight: 1.65, color: "text.secondary" }}>
          כדי לקבל צמידים חינם לבית הספר יש למלא בקשה מלאה עם כל הפרטים. בקשה חלקית לא תטופל.
        </Typography>
      </Box>
    </Box>
  );
}
