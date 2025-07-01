import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FFFFFF",
    },
    secondary: {
      main: "#94d2bd",
    },
    background: {
      default: "#FFFFFF",
    },
    text: {
      primary: "#0a0908",
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          zIndex: 1201, // above drawer
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: 250,
        },
      },
    },
  },
});

export default theme;
