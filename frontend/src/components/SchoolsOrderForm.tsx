import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { LoadingButton } from "./States";
import { track } from "../lib/analytics";
import { submitForm } from "../lib/forms";

export function SchoolsOrderForm() {
  const [gender, setGender] = useState("mixed");
  const [status, setStatus] = useState<"idle" | "loading" | "ok">("idle");
  const [saved, setSaved] = useState(true);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    track("school_contact_started", { source: "school_order_form" });
    const form = new FormData(e.currentTarget);
    setStatus("loading");
    const result = await submitForm("school_order", "/shop/product/schools", {
      ...Object.fromEntries(form.entries()),
      gender,
    });
    setSaved(result.saved);
    track("school_contact_completed", { saved: result.saved, source: "school_order_form" });
    setStatus("ok");
  }

  if (status === "ok") {
    return (
      <Alert severity={saved ? "success" : "warning"} sx={{ mt: 3 }}>
        {saved
          ? "הבקשה נקלטה. נחזור אליכם לאחר בדיקת הפרטים. אל תשכחו לשלוח את טופס ההצהרה ב-WhatsApp."
          : "השמירה לשרת נכשלה — פנו ב-WhatsApp 054-3644512."}
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Typography variant="h3" sx={{ fontSize: "1.15rem", mb: 1 }}>
        בקשת חלוקת צמידים לבית הספר
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.65, fontSize: "0.95rem" }}>
        נא לצרף טופס הצהרה על מספר התלמידים ואנשי הצוות במוסד על גבי מסמך רשמי של בית
        הספר — ניתן לשלוח ב-WhatsApp לאחר מילוי הבקשה.
      </Typography>

      <Typography sx={{ fontWeight: 700, mb: 1.5, fontSize: "0.95rem" }}>פרטי מגיש/ת הבקשה</Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <TextField required name="name" label="שם מלא" size="small" />
        <TextField required name="role" label="תפקיד" size="small" />
        <TextField required name="email" type="email" label="כתובת מייל" size="small" />
        <TextField required name="phone" label="טלפון" size="small" />
      </Box>

      <Typography sx={{ fontWeight: 700, mb: 1.5, fontSize: "0.95rem" }}>פרטי בית הספר</Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <TextField required name="school" label="שם בית הספר" size="small" sx={{ gridColumn: { sm: "1 / -1" } }} />
        <TextField required name="street" label="רחוב" size="small" />
        <TextField required name="city" label="עיר" size="small" />
        <TextField required name="classes" label="מספר כיתות" type="number" size="small" />
        <TextField required name="staff" label="מספר אנשי צוות" type="number" size="small" />
        <TextField required name="students" label="מספר תלמידים" type="number" size="small" />
        <FormControl required size="small">
          <InputLabel id="gender-label">בנים/בנות</InputLabel>
          <Select
            labelId="gender-label"
            value={gender}
            label="בנים/בנות"
            onChange={(e) => setGender(e.target.value)}
          >
            <MenuItem value="boys">בנים</MenuItem>
            <MenuItem value="girls">בנות</MenuItem>
            <MenuItem value="mixed">בנים/בנות</MenuItem>
          </Select>
        </FormControl>
        <TextField required name="ages" label="גילאים" placeholder="לדוגמה: י'-י&quot;ב" size="small" />
        <TextField
          required
          name="bracelets"
          label="מספר הצמידים המבוקש"
          type="number"
          size="small"
        />
        <TextField
          required
          name="distribution"
          label="איך חשבתם לחלק את הצמידים?"
          multiline
          minRows={2}
          size="small"
          sx={{ gridColumn: { sm: "1 / -1" } }}
        />
      </Box>

      <LoadingButton type="submit" variant="contained" loading={status === "loading"}>
        שליחת בקשה
      </LoadingButton>
    </Box>
  );
}
