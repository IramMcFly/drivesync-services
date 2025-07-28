"use client";
import { useTheme } from '../contexts/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme, isLoaded } = useTheme();

  if (!isLoaded) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 flex items-center justify-center group"
      title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDarkMode ? (
          <FaSun 
            className="text-yellow-500 group-hover:text-yellow-400 transition-colors duration-200" 
            size={18} 
          />
        ) : (
          <FaMoon 
            className="text-gray-700 group-hover:text-gray-800 transition-colors duration-200" 
            size={16} 
          />
        )}
      </div>
    </button>
  );
}
