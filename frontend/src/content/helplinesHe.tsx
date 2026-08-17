import { Link, Typography } from "@mui/material";

const linkSx = { fontWeight: 600 };

type HelplinesListProps = {
  /** About page includes report-form wording for the Safe Internet Center. */
  variant?: "message" | "about";
};

export function HelplinesList({ variant = "message" }: HelplinesListProps) {
  return (
    <Typography component="ul" sx={{ m: 0, pl: 3, "& li": { mb: 1.25, lineHeight: 1.85 } }}>
      <li>
        ער&quot;ן / עזרה ראשונה נפשית — טלפון{" "}
        <Link href="tel:1201" underline="hover" sx={linkSx}>
          1201
        </Link>
      </li>
      <li>
        סה&quot;ר / סיוע והקשבה ברשת —{" "}
        <Link href="mailto:sahar.help@gmail.com" underline="hover" sx={linkSx}>
          sahar.help@gmail.com
        </Link>
      </li>
      <li>
        <Link href="tel:105" underline="hover" sx={linkSx}>
          מוקד 105
        </Link>{" "}
        — המטה הלאומי להגנה על ילדים ברשת
      </li>
      <li>
        {variant === "about" ? "המרכז לאינטרנט בטוח של איגוד האינטרנט — " : "המרכז לאינטרנט בטוח — "}
        וואטסאפ{" "}
        <Link
          href="https://wa.me/97254858911"
          target="_blank"
          rel="noreferrer"
          underline="hover"
          sx={linkSx}
        >
          054-8-858911
        </Link>
        ,{" "}
        <Link href="mailto:safe@isoc.org.il" underline="hover" sx={linkSx}>
          safe@isoc.org.il
        </Link>
        {variant === "about" ? (
          <>
            , או באמצעות{" "}
            <Link
              href="https://safe.org.il"
              target="_blank"
              rel="noreferrer"
              underline="hover"
              sx={linkSx}
            >
              טופס דיווח
            </Link>
          </>
        ) : null}
      </li>
    </Typography>
  );
}
