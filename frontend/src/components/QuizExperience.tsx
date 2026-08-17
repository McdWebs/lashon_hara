import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  Stack,
  Typography,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { track } from "../lib/analytics";
import { pickRandomQuiz, type Answer } from "../lib/quiz";

const QUESTIONS_PER_QUIZ = 6;

const answerOptions: { key: Answer; label: string; hint: string; Icon: SvgIconComponent }[] = [
  { key: "yes", label: "כן", hint: "זה נראה כמו לשון הרע", Icon: CheckCircleOutlineOutlinedIcon },
  { key: "no", label: "לא", hint: "זה לא נראה כמו לשון הרע", Icon: HighlightOffOutlinedIcon },
  { key: "unsure", label: "לא בטוח/ה", hint: "מקרה שדורש חשיבה נוספת", Icon: HelpOutlineOutlinedIcon },
];

function QuizCard({ children }: { children: ReactNode }) {
  return (
    <Card
      variant="outlined"
      sx={{
        maxWidth: 720,
        mx: "auto",
        bgcolor: "background.paper",
        borderColor: "divider",
        overflow: "hidden",
        backgroundImage: `
          radial-gradient(circle at 100% 0%, rgba(237, 27, 36, 0.06) 0%, transparent 45%),
          linear-gradient(180deg, #FFFCF7 0%, #F4F1EA 100%)
        `,
      }}
    >
      <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>{children}</Box>
    </Card>
  );
}

export function QuizExperience() {
  const [session, setSession] = useState(() => pickRandomQuiz());
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Answer | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  const { quiz, deck } = session;
  const scenario = deck[index];

  function choose(answer: Answer) {
    if (!scenario || picked) return;
    if (!started) {
      track("quiz_started", { quiz_id: quiz.id });
      setStarted(true);
    }
    setPicked(answer);
    if (answer === scenario.answer) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 >= QUESTIONS_PER_QUIZ) {
      setDone(true);
      track("quiz_completed", { score, total: QUESTIONS_PER_QUIZ, quiz_id: quiz.id });
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  }

  function restart() {
    setSession(pickRandomQuiz());
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
    setStarted(false);
  }

  if (done) {
    return (
      <QuizCard>
        <Stack spacing={3} sx={{ alignItems: "center", textAlign: "center" }}>
          <Typography variant="h2">סיימתם</Typography>
          <Box
            sx={{
              width: "100%",
              py: 3,
              borderTop: "1px solid",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Secular One", Heebo, sans-serif',
                fontSize: { xs: "3rem", md: "3.75rem" },
                lineHeight: 1,
                color: "primary.main",
              }}
            >
              {score} / {QUESTIONS_PER_QUIZ}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: "1.05rem" }}>
              לפי המבחן החינוכי שבאתר
            </Typography>
          </Box>
          <Typography color="text.secondary" sx={{ maxWidth: 480, lineHeight: 1.7 }}>
            זה לא מבחן הלכה ולא ייעוץ משפטי. כל תרגול נוסף מציג נושא ושאלות אחרות.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ width: "100%", pt: 1 }}>
            <Button variant="contained" size="large" onClick={restart} sx={{ flex: 1 }}>
              תרגול נוסף
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to="/join/commitment"
              sx={{ flex: 1 }}
            >
              השינוי מתחיל בי
            </Button>
          </Stack>
        </Stack>
      </QuizCard>
    );
  }

  if (!scenario) return null;

  return (
    <QuizCard>
      <Stack spacing={{ xs: 3, md: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}
        >
          <Box>
            <Box sx={{ width: 40, height: 3, bgcolor: "primary.main", mb: 1.5 }} />
            <Typography
              variant="overline"
              sx={{ color: "primary.main", letterSpacing: 1.5, fontWeight: 700, fontSize: "0.8rem" }}
            >
              {quiz.title}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              fontSize: "1rem",
              px: 1.5,
              py: 0.75,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
            }}
          >
            שאלה {index + 1} מתוך {QUESTIONS_PER_QUIZ}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.75} aria-label="התקדמות בתרגול">
          {Array.from({ length: QUESTIONS_PER_QUIZ }, (_, i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                height: 6,
                borderRadius: 1,
                bgcolor: i < index || (i === index && picked) ? "primary.main" : "rgba(17,17,17,0.1)",
                opacity: i === index && !picked ? 0.45 : 1,
              }}
            />
          ))}
        </Stack>

        <Box>
          <Typography color="text.secondary" sx={{ mb: 1.5, fontSize: "0.95rem", fontWeight: 600 }}>
            האם זה לשון הרע?
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "1.45rem", sm: "1.75rem", md: "2rem" },
              lineHeight: 1.35,
              maxWidth: 620,
            }}
          >
            {scenario.prompt}
          </Typography>
        </Box>

        <Stack spacing={1.5}>
          {answerOptions.map(({ key, label, hint, Icon }) => {
            const selected = picked === key;
            const revealed = Boolean(picked);
            const isCorrect = scenario.answer === key;

            return (
              <Card
                key={key}
                variant="outlined"
                sx={{
                  borderColor: selected
                    ? "primary.main"
                    : revealed && isCorrect
                      ? "primary.main"
                      : "divider",
                  borderWidth: selected || (revealed && isCorrect) ? 2 : 1,
                  bgcolor:
                    selected || (revealed && isCorrect)
                      ? "rgba(237, 27, 36, 0.04)"
                      : "background.paper",
                  opacity: revealed && !selected && !isCorrect ? 0.72 : 1,
                  transition: "border-color 0.15s ease, background-color 0.15s ease, opacity 0.15s ease",
                }}
              >
                <CardActionArea
                  onClick={() => choose(key)}
                  disabled={Boolean(picked)}
                  sx={{
                    py: { xs: 2, sm: 2.25 },
                    px: { xs: 2, sm: 2.5 },
                    display: "flex",
                    justifyContent: "flex-start",
                  }}
                >
                  <Stack direction="row" spacing={2} sx={{ width: "100%", alignItems: "center" }}>
                    <Icon
                      sx={{
                        fontSize: 28,
                        color: selected || (revealed && isCorrect) ? "primary.main" : "text.secondary",
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: { xs: "1.05rem", sm: "1.15rem" } }}>
                        {label}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 0.25, fontSize: "0.9rem" }}>
                        {hint}
                      </Typography>
                    </Box>
                  </Stack>
                </CardActionArea>
              </Card>
            );
          })}
        </Stack>

        {picked && (
          <Stack spacing={2}>
            <Alert
              severity={picked === scenario.answer ? "success" : "info"}
              sx={{
                alignItems: "flex-start",
                py: 2,
                "& .MuiAlert-message": { fontSize: "1rem", lineHeight: 1.65 },
              }}
            >
              <Typography component="span" sx={{ fontWeight: 700 }}>
                לפי התרגול החינוכי: {answerOptions.find((o) => o.key === scenario.answer)?.label}.{" "}
              </Typography>
              {scenario.explain}
            </Alert>
            <Button variant="contained" size="large" onClick={next} sx={{ alignSelf: { sm: "flex-start" } }}>
              {index + 1 >= QUESTIONS_PER_QUIZ ? "סיום התרגול" : "לשאלה הבאה"}
            </Button>
          </Stack>
        )}
      </Stack>
    </QuizCard>
  );
}
