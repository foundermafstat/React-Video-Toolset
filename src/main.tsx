import ReactDOM from "react-dom/client";
import { AppRouter } from "./AppRouter";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <AppRouter />
  </ThemeProvider>
);