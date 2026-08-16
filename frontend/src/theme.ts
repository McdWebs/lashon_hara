import { createTheme, type Direction } from "@mui/material/styles";

const red = "#ED1B24";
const black = "#111111";

export function createAppTheme(direction: Direction) {
  return createTheme({
    direction,
    palette: {
      primary: { main: red, contrastText: "#fff" },
      secondary: { main: black },
      background: { default: "#f7f7f7", paper: "#ffffff" },
      text: { primary: black, secondary: "#444" },
    },
    typography: {
      fontFamily: "Heebo, Arial, sans-serif",
      h1: { fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1.15 },
      h2: { fontWeight: 700, fontSize: "clamp(1.5rem, 3vw, 2.1rem)" },
      h3: { fontWeight: 700, fontSize: "1.25rem" },
      button: { fontWeight: 700 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none", minHeight: 44, px: 2 },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: "#f7f7f7" },
        },
      },
    },
  });
}

export const theme = createAppTheme("rtl");
