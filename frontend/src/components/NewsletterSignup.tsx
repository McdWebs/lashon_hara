import { Alert, Box, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { LoadingButton } from "../components/States";
import { submitForm } from "../lib/forms";

export function NewsletterSignup() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok">("idle");
  const [saved, setSaved] = useState(true);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("loading");
    const result = await submitForm("newsletter", "/contact", Object.fromEntries(form.entries()));
    setSaved(result.saved);
    setStatus("ok");
  }

  if (status === "ok") {
    return (
      <Box sx={{ maxWidth: 420, mx: "auto" }}>
        <Alert severity={saved ? "success" : "warning"}>
          {saved ? "נרשמתם לעדכונים." : "השמירה נכשלה — וואטסאפ 054-3644512."}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 420, mx: "auto", textAlign: "center" }}>
      <Stack
        component="form"
        spacing={2}
        sx={{ width: "100%", textAlign: "start" }}
        onSubmit={onSubmit}
      >
        <Typography variant="h2" sx={{ textAlign: "center" }}>
          רוצים להתעדכן?
        </Typography>
        <Typography color="text.secondary" sx={{ textAlign: "center" }}>
          הירשמו לניוזלטר
        </Typography>
        <TextField required name="name" label="שם" />
        <TextField required name="email" type="email" label="אימייל" />
        <TextField name="phone" label="טלפון" />
        <LoadingButton type="submit" variant="contained" loading={status === "loading"} fullWidth>
          הרשמה
        </LoadingButton>
      </Stack>
    </Box>
  );
}
