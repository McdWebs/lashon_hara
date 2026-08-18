import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Alert } from "@mui/material";
import {
  formatOrderRulesNotice,
  hasOrderConstraints,
  type ProductOrderRules,
} from "../lib/productOrderRules";

export function ProductOrderNotice({
  rules,
  lang,
}: {
  rules: ProductOrderRules;
  lang: "he" | "en";
}) {
  if (!hasOrderConstraints(rules)) return null;

  return (
    <Alert
      severity="info"
      icon={<InfoOutlinedIcon fontSize="inherit" />}
      sx={{
        mt: 2.5,
        alignItems: "flex-start",
        fontSize: 14,
        lineHeight: 1.55,
        "& .MuiAlert-message": { pt: 0.15 },
      }}
    >
      {formatOrderRulesNotice(rules, lang)}
    </Alert>
  );
}
