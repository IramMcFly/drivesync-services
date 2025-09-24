"use client";
import { SessionProvider } from "next-auth/react";

export default function ProvidersWrapper({ children }) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Verificar cada 5 minutos
      refetchOnWindowFocus={true}
      basePath="/api/auth"
    >
      {children}
    </SessionProvider>
  );
}
