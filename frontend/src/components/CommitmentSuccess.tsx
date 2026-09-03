import { Box, Chip, Stack, Typography } from "@mui/material";

type Props = {
  firstName: string;
  signerNumber?: number;
  alreadySigned?: boolean;
  notice?: string | null;
};

function AnimatedCheckMark({ alreadySigned }: { alreadySigned?: boolean }) {
  const accent = alreadySigned ? "#111111" : "#ED1B24";
  const ring = alreadySigned ? "rgba(17,17,17,0.22)" : "rgba(237,27,36,0.32)";

  return (
    <Box
      component="svg"
      viewBox="0 0 108 108"
      width={108}
      height={108}
      aria-hidden
      sx={{
        display: "block",
        mb: 2.5,
        overflow: "visible",
        filter: alreadySigned
          ? "drop-shadow(0 12px 24px rgba(17, 17, 17, 0.22))"
          : "drop-shadow(0 12px 28px rgba(237, 27, 36, 0.35))",
        "@keyframes commitmentRingIn": {
          "0%": { opacity: 0, transform: "scale(0.55)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        "@keyframes commitmentDiscIn": {
          "0%": { opacity: 0, transform: "scale(0.2)" },
          "60%": { opacity: 1, transform: "scale(1.08)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        "@keyframes commitmentCheckDraw": {
          "0%": { strokeDashoffset: 1 },
          "100%": { strokeDashoffset: 0 },
        },
        "@media (prefers-reduced-motion: reduce)": {
          "& .commitment-ring, & .commitment-disc, & .commitment-check": {
            animation: "none !important",
          },
          "& .commitment-ring, & .commitment-disc": {
            opacity: 1,
            transform: "none",
          },
          "& .commitment-check": {
            strokeDashoffset: 0,
          },
        },
      }}
    >
      <Box
        component="circle"
        className="commitment-ring"
        cx="54"
        cy="54"
        r="52"
        fill="none"
        stroke={ring}
        strokeWidth={2.5}
        sx={{
          transformOrigin: "54px 54px",
          animation: "commitmentRingIn 0.7s ease-out 0.08s both",
        }}
      />
      <Box
        component="circle"
        className="commitment-disc"
        cx="54"
        cy="54"
        r="42"
        fill={accent}
        sx={{
          transformOrigin: "54px 54px",
          animation: "commitmentDiscIn 0.55s cubic-bezier(0.22, 1.4, 0.36, 1) both",
        }}
      />
      <Box
        component="path"
        className="commitment-check"
        d="M34 55.5 L47.5 69 L76 39"
        fill="none"
        stroke="#ffffff"
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        sx={{
          strokeDasharray: 1,
          strokeDashoffset: 1,
          animation: "commitmentCheckDraw 0.42s ease-out 0.38s forwards",
        }}
      />
    </Box>
  );
}

export function CommitmentSuccess({ firstName, signerNumber, alreadySigned, notice }: Props) {
  const name = firstName.trim() || "אני";

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        height: "100%",
        p: { xs: 3, md: 3.5 },
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.default",
        backgroundImage: alreadySigned
          ? `
            radial-gradient(circle at 88% 12%, rgba(17, 17, 17, 0.05) 0%, transparent 42%),
            linear-gradient(165deg, #FFFCF7 0%, #F4F1EA 100%)
          `
          : `
            radial-gradient(circle at 88% 12%, rgba(237, 27, 36, 0.12) 0%, transparent 42%),
            linear-gradient(165deg, #FFFCF7 0%, #F4F1EA 100%)
          `,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AnimatedCheckMark alreadySigned={alreadySigned} />

      <Typography
        sx={{
          fontFamily: '"Secular One", Heebo, sans-serif',
          fontSize: { xs: "1.4rem", md: "1.6rem" },
          lineHeight: 1.2,
          mb: 1,
        }}
      >
        {alreadySigned ? "כבר חתמת — תודה" : "חתמת. עכשיו תפיצו."}
      </Typography>

      <Typography color="text.secondary" sx={{ maxWidth: 320, lineHeight: 1.75, fontSize: "0.95rem" }}>
        {alreadySigned
          ? notice ??
            `${name}, ההתחייבות שלך כבר רשומה. אפשר עדיין להוריד את הכרטיס ולשתף — המסר חשוב.`
          : `${name}, ההתחייבות שלך נרשמה. הורידו את הכרטיס לסטורי או שלחו לחבר/ה.`}
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ justifyContent: "center", mt: 2.5, flexWrap: "wrap" }}
      >
        <Chip
          label="התחייבות פעילה"
          size="small"
          sx={{
            bgcolor: alreadySigned ? "rgba(17,17,17,0.08)" : "rgba(237,27,36,0.1)",
            color: alreadySigned ? "text.primary" : "primary.main",
            fontWeight: 700,
          }}
        />
        {signerNumber != null ? (
          <Chip
            label={`חותם/ת #${signerNumber.toLocaleString("he-IL")}`}
            size="small"
            sx={{
              bgcolor: "primary.main",
              color: "#fff",
              fontWeight: 700,
            }}
          />
        ) : null}
      </Stack>
    </Box>
  );
}
