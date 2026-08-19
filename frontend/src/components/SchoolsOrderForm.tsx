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

const REQUIRED_FIELDS = [
  "name",
  "role",
  "email",
  "phone",
  "school",
  "street",
  "city",
  "classes",
  "staff",
  "students",
  "ages",
  "bracelets",
  "distribution",
] as const;

type FieldName = (typeof REQUIRED_FIELDS)[number];

export function SchoolsOrderForm() {
  const [values, setValues] = useState<Record<FieldName, string>>({
    name: "",
    role: "",
    email: "",
    phone: "",
    school: "",
    street: "",
    city: "",
    classes: "",
    staff: "",
    students: "",
    ages: "",
    bracelets: "",
    distribution: "",
  });
  const [gender, setGender] = useState("mixed");
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ok">("idle");
  const [saved, setSaved] = useState(true);

  function updateField(name: FieldName, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function markTouched(name: string) {
    setTouched((prev) => (prev.has(name) ? prev : new Set(prev).add(name)));
  }

  function requiredError(name: FieldName): string | undefined {
    if (!touched.has(name) && !attemptedSubmit) return undefined;
    return values[name] ? undefined : "שדה חובה";
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const hasEmptyRequired = REQUIRED_FIELDS.some((name) => !values[name]);
    if (hasEmptyRequired) {
      setAttemptedSubmit(true);
      return;
    }
    track("school_contact_started", { source: "school_order_form" });
    setStatus("loading");
    const result = await submitForm("school_order", "/shop/product/schools", {
      ...values,
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
    <Box component="form" onSubmit={onSubmit} noValidate>
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
        <TextField
          required
          name="name"
          label="שם מלא"
          size="small"
          value={values.name}
          onChange={(e) => updateField("name", e.target.value)}
          onBlur={() => markTouched("name")}
          error={Boolean(requiredError("name"))}
          helperText={requiredError("name")}
        />
        <TextField
          required
          name="role"
          label="תפקיד"
          size="small"
          value={values.role}
          onChange={(e) => updateField("role", e.target.value)}
          onBlur={() => markTouched("role")}
          error={Boolean(requiredError("role"))}
          helperText={requiredError("role")}
        />
        <TextField
          required
          name="email"
          type="email"
          label="כתובת מייל"
          size="small"
          value={values.email}
          onChange={(e) => updateField("email", e.target.value)}
          onBlur={() => markTouched("email")}
          error={Boolean(requiredError("email"))}
          helperText={requiredError("email")}
        />
        <TextField
          required
          name="phone"
          label="טלפון"
          size="small"
          value={values.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          onBlur={() => markTouched("phone")}
          error={Boolean(requiredError("phone"))}
          helperText={requiredError("phone")}
        />
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
        <TextField
          required
          name="school"
          label="שם בית הספר"
          size="small"
          sx={{ gridColumn: { sm: "1 / -1" } }}
          value={values.school}
          onChange={(e) => updateField("school", e.target.value)}
          onBlur={() => markTouched("school")}
          error={Boolean(requiredError("school"))}
          helperText={requiredError("school")}
        />
        <TextField
          required
          name="street"
          label="רחוב"
          size="small"
          value={values.street}
          onChange={(e) => updateField("street", e.target.value)}
          onBlur={() => markTouched("street")}
          error={Boolean(requiredError("street"))}
          helperText={requiredError("street")}
        />
        <TextField
          required
          name="city"
          label="עיר"
          size="small"
          value={values.city}
          onChange={(e) => updateField("city", e.target.value)}
          onBlur={() => markTouched("city")}
          error={Boolean(requiredError("city"))}
          helperText={requiredError("city")}
        />
        <TextField
          required
          name="classes"
          label="מספר כיתות"
          type="number"
          size="small"
          value={values.classes}
          onChange={(e) => updateField("classes", e.target.value)}
          onBlur={() => markTouched("classes")}
          error={Boolean(requiredError("classes"))}
          helperText={requiredError("classes")}
        />
        <TextField
          required
          name="staff"
          label="מספר אנשי צוות"
          type="number"
          size="small"
          value={values.staff}
          onChange={(e) => updateField("staff", e.target.value)}
          onBlur={() => markTouched("staff")}
          error={Boolean(requiredError("staff"))}
          helperText={requiredError("staff")}
        />
        <TextField
          required
          name="students"
          label="מספר תלמידים"
          type="number"
          size="small"
          value={values.students}
          onChange={(e) => updateField("students", e.target.value)}
          onBlur={() => markTouched("students")}
          error={Boolean(requiredError("students"))}
          helperText={requiredError("students")}
        />
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
        <TextField
          required
          name="ages"
          label="גילאים"
          placeholder="לדוגמה: י'-י&quot;ב"
          size="small"
          value={values.ages}
          onChange={(e) => updateField("ages", e.target.value)}
          onBlur={() => markTouched("ages")}
          error={Boolean(requiredError("ages"))}
          helperText={requiredError("ages")}
        />
        <TextField
          required
          name="bracelets"
          label="מספר הצמידים המבוקש"
          type="number"
          size="small"
          value={values.bracelets}
          onChange={(e) => updateField("bracelets", e.target.value)}
          onBlur={() => markTouched("bracelets")}
          error={Boolean(requiredError("bracelets"))}
          helperText={requiredError("bracelets")}
        />
        <TextField
          required
          name="distribution"
          label="איך חשבתם לחלק את הצמידים?"
          multiline
          minRows={2}
          size="small"
          sx={{ gridColumn: { sm: "1 / -1" } }}
          value={values.distribution}
          onChange={(e) => updateField("distribution", e.target.value)}
          onBlur={() => markTouched("distribution")}
          error={Boolean(requiredError("distribution"))}
          helperText={requiredError("distribution")}
        />
      </Box>

      <LoadingButton type="submit" variant="contained" loading={status === "loading"}>
        שליחת בקשה
      </LoadingButton>
    </Box>
  );
}
