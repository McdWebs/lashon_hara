import { Alert, Button, LinearProgress, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { track } from "../lib/analytics";
import { scenarios, type Answer } from "../lib/quiz";
import { waLink } from "../lib/site";

const labels: Record<Answer, string> = {
  yes: "כן",
  no: "לא",
  unsure: "לא בטוח/ה",
};

export function QuizExperience() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Answer | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  const scenario = scenarios[index];
  const progress = ((done ? scenarios.length : index + (picked ? 1 : 0)) / scenarios.length) * 100;

  function choose(answer: Answer) {
    if (!scenario || picked) return;
    if (!started) {
      track("quiz_started");
      setStarted(true);
    }
    setPicked(answer);
    if (answer === scenario.answer) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 >= scenarios.length) {
      const finalScore = picked === scenario?.answer ? score : score;
      setDone(true);
      track("quiz_completed", { score: finalScore, total: scenarios.length });
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  }

  if (done) {
    return (
      <Stack spacing={2}>
        <Typography variant="h2">סיימתם</Typography>
        <Typography>
          {score} מתוך {scenarios.length} לפי המבחן החינוכי שבאתר. זה לא מבחן הלכה ולא ייעוץ משפטי.
        </Typography>
        <Button variant="contained" component={RouterLink} to="/join/commitment">
          השינוי מתחיל בי
        </Button>
        <Button
          variant="outlined"
          href={waLink(`תרגלתי באתר לשון הרע לא מדבר אליי (${score}/${scenarios.length}).`)}
          target="_blank"
          rel="noreferrer"
        >
          שיתוף ב-WhatsApp
        </Button>
      </Stack>
    );
  }

  if (!scenario) return null;

  return (
    <Stack spacing={2}>
      <LinearProgress variant="determinate" value={progress} />
      <Typography color="text.secondary">
        {index + 1} / {scenarios.length}
      </Typography>
      <Typography variant="h3">{scenario.prompt}</Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        {(Object.keys(labels) as Answer[]).map((key) => (
          <Button
            key={key}
            variant={picked === key ? "contained" : "outlined"}
            onClick={() => choose(key)}
            disabled={Boolean(picked)}
          >
            {labels[key]}
          </Button>
        ))}
      </Stack>
      {picked && (
        <>
          <Alert severity={picked === scenario.answer ? "success" : "info"}>
            לפי התרגול החינוכי: {labels[scenario.answer]}. {scenario.explain}
          </Alert>
          <Button variant="contained" onClick={next}>
            {index + 1 >= scenarios.length ? "סיום" : "הבא"}
          </Button>
        </>
      )}
    </Stack>
  );
}
