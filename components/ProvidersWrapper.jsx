"use client";
import { SessionProvider } from "next-auth/react";
import { AUTH_CONFIG } from "@/lib/authConfig";

export default function ProvidersWrapper({ children }) {
  return (
    <SessionProvider 
      refetchInterval={AUTH_CONFIG.SESSION_CONFIG.refetchInterval}
      refetchOnWindowFocus={AUTH_CONFIG.SESSION_CONFIG.refetchOnWindowFocus}
      basePath={AUTH_CONFIG.SESSION_CONFIG.basePath}
    >
      {children}
    </SessionProvider>
  );
}
