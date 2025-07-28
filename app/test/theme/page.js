"use client";
import { useTheme } from '../../../contexts/ThemeContext';
import ThemeToggle from '../../../components/ThemeToggle';

export default function TestTheme() {
  const { isDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Prueba de Tema
            </h1>
            <ThemeToggle />
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Modo actual: <span className="font-semibold">{isDarkMode ? 'Oscuro' : 'Claro'}</span>
            </p>
            
            <div className="input-container">
              <input
                type="text"
                placeholder="Campo de prueba"
                className="input-mobile"
              />
            </div>
            
            <button className="btn-mobile bg-primary text-white hover:bg-primary-hover">
              Botón de Prueba
            </button>
            
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">
                Este es un área de contenido para probar los colores del tema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
