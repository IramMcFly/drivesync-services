"use client";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "../contexts/ThemeContext";

export default function ProvidersWrapper({ children }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
}
