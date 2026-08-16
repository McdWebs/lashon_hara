import { Box, Button, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";

type StatsResponse = {
  foundedYear: number;
  founder: string;
  live: {
    commitments: number;
    commitmentsThisWeek: number;
    ambassadors: number;
    schoolInquiries: number;
  } | null;
};

export function MovementStats() {
  const query = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("stats");
      return res.json() as Promise<StatsResponse>;
    },
  });

  const live = query.data?.live;

  return (
    <Stack spacing={2}>
      <Typography variant="h2">כמה אנשים כבר הצטרפו?</Typography>
      <Typography>
        העמותה פעילה מאז {query.data?.foundedYear ?? 2007}, מייסודו של {query.data?.founder ?? "דוד הלפרין"} — כפי שפורסם בדף האודות.
      </Typography>
      {live ? (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
          <Box>
            <Typography variant="h3">{live.commitments}</Typography>
            <Typography color="text.secondary">התחייבויות שנשמרו אצלנו</Typography>
          </Box>
          <Box>
            <Typography variant="h3">{live.commitmentsThisWeek}</Typography>
            <Typography color="text.secondary">השבוע</Typography>
          </Box>
          <Box>
            <Typography variant="h3">{live.ambassadors}</Typography>
            <Typography color="text.secondary">פניות לשגרירות</Typography>
          </Box>
          <Box>
            <Typography variant="h3">{live.schoolInquiries}</Typography>
            <Typography color="text.secondary">פניות מבתי ספר</Typography>
          </Box>
        </Stack>
      ) : (
        <Typography color="text.secondary">
          אין כאן מונים מומצאים. כשמסד הנתונים מחובר, יוצגו רק ספירות אמיתיות של טפסים שנשלחו באתר החדש.
        </Typography>
      )}
      <Button component={RouterLink} to="/join/commitment" variant="contained" sx={{ alignSelf: "flex-start" }}>
        גם אני מצטרף/ת
      </Button>
    </Stack>
  );
}
