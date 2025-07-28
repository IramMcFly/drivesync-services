"use client";
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar tema desde localStorage al iniciar
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('drivesync-theme');
      if (savedTheme !== null) {
        const themeValue = JSON.parse(savedTheme);
        setIsDarkMode(themeValue);
      } else {
        // Detectar preferencia del sistema
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(systemPrefersDark);
      }
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
      setIsDarkMode(false);
    }
    setIsLoaded(true);
  }, []);

  // Guardar tema en localStorage y aplicar clase cuando cambie
  useEffect(() => {
    if (!isLoaded) return; // No aplicar hasta que se haya cargado el estado inicial
    
    try {
      localStorage.setItem('drivesync-theme', JSON.stringify(isDarkMode));
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
    
    // Aplicar clase al documento
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode, isLoaded]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Evitar flash durante la carga
  if (!isLoaded) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
