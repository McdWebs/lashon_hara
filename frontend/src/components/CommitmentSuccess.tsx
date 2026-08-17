import { Box, Stack, Typography } from "@mui/material";

type Props = {
  firstName: string;
  signerNumber?: number;
  alreadySigned?: boolean;
};

export function CommitmentSuccess({ firstName, signerNumber, alreadySigned }: Props) {
  const name = firstName.trim() || "אני";

  return (
    <Stack spacing={2} sx={{ textAlign: "center", alignItems: "center", py: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          bgcolor: alreadySigned ? "grey.700" : "primary.main",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "4px solid",
          borderColor: "background.paper",
          boxShadow: alreadySigned
            ? "0 8px 32px rgba(17, 17, 17, 0.18)"
            : "0 8px 32px rgba(237, 27, 36, 0.35)",
          animation: alreadySigned ? "none" : "commitmentStampIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both",
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
          },
          "@keyframes commitmentStampIn": {
            "0%": { transform: "scale(2.2) rotate(-12deg)", opacity: 0 },
            "100%": { transform: "scale(1) rotate(0deg)", opacity: 1 },
          },
        }}
        aria-hidden
      >
        <Typography sx={{ fontWeight: 800, fontSize: alreadySigned ? "1rem" : "1.35rem", lineHeight: 1.1 }}>
          {alreadySigned ? "חתמת" : "חתמת!"}
        </Typography>
      </Box>

      <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", md: "1.85rem" } }}>
        {alreadySigned ? "כבר חתמת על ההתחייבות" : "סיימת. עכשיו תראו לחבר'ה."}
      </Typography>

      <Typography color="text.secondary" sx={{ maxWidth: 420, lineHeight: 1.7 }}>
        {alreadySigned
          ? `${name}, ההתחייבות שלך כבר רשומה אצלנו. אפשר עדיין להוריד את הכרטיס ולשתף — המסר חשוב.`
          : `${name}, ההתחייבות שלך נרשמה. הוריד/י את הכרטיס לסטורי או שלח/י ב-WhatsApp — ותייג/י מישהו שגם צריך/ה את זה.`}
      </Typography>

      {signerNumber != null ? (
        <Typography
          sx={{
            fontWeight: 700,
            color: "primary.main",
            fontSize: "0.95rem",
            letterSpacing: 0.5,
          }}
        >
          את/ה החותם/ת #{signerNumber.toLocaleString("he-IL")}
        </Typography>
      ) : null}
    </Stack>
  );
}
