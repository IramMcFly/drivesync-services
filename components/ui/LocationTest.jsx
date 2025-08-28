"use client";

import { useGeolocation } from '../../hooks/useGeolocation';

export default function LocationTest() {
  const { 
    location, 
    error, 
    loading, 
    requestLocation, 
    isSupported 
  } = useGeolocation();

  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Test de Geolocalización
      </h2>
      
      {!isSupported && (
        <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
          <p className="text-red-700 dark:text-red-300">
            La geolocalización no es compatible con este dispositivo.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex items-center mb-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-blue-600 dark:text-blue-400">Obteniendo ubicación...</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
          <div className="flex items-center mb-2">
            <svg className="w-4 h-4 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700 dark:text-red-300 font-medium">
              Error: {error.code}
            </span>
          </div>
          <p className="text-red-600 dark:text-red-400 text-sm mb-3">
            {error.message}
          </p>
          {error.canRetry && (
            <button
              onClick={requestLocation}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Intentar nuevamente
            </button>
          )}
        </div>
      )}

      {location && (
        <div className="p-3 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-4">
          <div className="flex items-center mb-2">
            <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-700 dark:text-green-300 font-medium">
              Ubicación obtenida
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>Latitud:</strong> {location.lat.toFixed(6)}</p>
            <p><strong>Longitud:</strong> {location.lng.toFixed(6)}</p>
            <p><strong>Precisión:</strong> {location.accuracy?.toFixed(0)}m</p>
            <p><strong>Timestamp:</strong> {new Date(location.timestamp).toLocaleTimeString()}</p>
          </div>
        </div>
      )}

      <button
        onClick={requestLocation}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium"
      >
        {loading ? 'Obteniendo...' : 'Solicitar ubicación'}
      </button>
    </div>
  );
}
