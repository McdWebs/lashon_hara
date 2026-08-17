import { createTheme, type Direction } from "@mui/material/styles";

const red = "#ED1B24";
const black = "#111111";
const paper = "#F4F1EA";

export function createAppTheme(direction: Direction) {
  return createTheme({
    direction,
    palette: {
      primary: { main: red, contrastText: "#fff" },
      secondary: { main: black, contrastText: "#fff" },
      background: { default: paper, paper: "#FFFCF7" },
      text: { primary: black, secondary: "#3a3a3a" },
      divider: "rgba(17,17,17,0.12)",
    },
    typography: {
      fontFamily: "Heebo, Arial, sans-serif",
      h1: {
        fontFamily: '"Secular One", Heebo, sans-serif',
        fontWeight: 400,
        fontSize: "clamp(2.4rem, 7vw, 4.4rem)",
        lineHeight: 1.08,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontFamily: '"Secular One", Heebo, sans-serif',
        fontWeight: 400,
        fontSize: "clamp(1.6rem, 3.5vw, 2.35rem)",
        lineHeight: 1.2,
      },
      h3: { fontFamily: "Heebo, sans-serif", fontWeight: 700, fontSize: "1.15rem", lineHeight: 1.35 },
      button: { fontFamily: "Heebo, sans-serif", fontWeight: 700 },
      body1: { fontSize: "1.05rem", lineHeight: 1.7 },
    },
    shape: { borderRadius: 2 },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { textTransform: "none", minHeight: 44, borderRadius: 2 },
          contained: { boxShadow: "none" },
          outlined: { borderColor: black, color: black },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { borderRadius: 2, boxShadow: "none", border: "1px solid rgba(17,17,17,0.12)" },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: paper },
        },
      },
    },
  });
}

export const theme = createAppTheme("rtl");
