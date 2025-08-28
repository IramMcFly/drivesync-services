"use client";

import LocationDebugger from '../../../components/ui/LocationDebugger';

export default function LocationTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Prueba de Geolocalización
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Esta página te ayuda a diagnosticar problemas de ubicación
          </p>
        </div>
        
        <LocationDebugger />
        
        <div className="mt-8 max-w-4xl mx-auto p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
            💡 Consejos para mejorar la precisión de ubicación:
          </h3>
          <ul className="text-blue-700 dark:text-blue-300 space-y-2 text-sm">
            <li>• Asegúrate de dar permisos de ubicación al navegador</li>
            <li>• Activa el GPS en tu dispositivo</li>
            <li>• Si estás en interiores, acércate a una ventana</li>
            <li>• Las redes WiFi pueden afectar la precisión - prueba desactivándolas</li>
            <li>• En móviles, los datos móviles suelen dar mejor ubicación que WiFi</li>
            <li>• Si la ubicación está muy lejos, usa "Alta precisión" y espera más tiempo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
