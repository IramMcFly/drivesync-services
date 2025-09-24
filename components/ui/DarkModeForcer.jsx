"use client";

import { useEffect, useState } from 'react';

export default function DarkModeForcer() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Solo ejecutar en el cliente después de la hidratación
    const forceDarkMode = () => {
      // Agregar clase dark al HTML
      if (!document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.add('dark');
      }
      document.documentElement.style.colorScheme = 'dark';
      
      // Forzar background en body si no está ya aplicado
      if (document.body.style.backgroundColor !== 'rgb(15, 23, 42)') {
        document.body.style.backgroundColor = '#0f172a';
        document.body.style.color = '#f1f5f9';
      }
    };

    // Ejecutar inmediatamente
    forceDarkMode();
    
    // También ejecutar en el siguiente tick para asegurar que se aplique
    setTimeout(forceDarkMode, 0);
    
    return () => {
      // Cleanup si es necesario
    };
  }, []);

  // No renderizar nada hasta que esté en el cliente
  if (!isClient) {
    return null;
  }

  return null; // Este componente no renderiza nada visible
}
