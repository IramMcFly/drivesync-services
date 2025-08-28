"use client";

import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaRefresh, FaCog } from 'react-icons/fa';

export default function LocationDebugger() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentLocation = (options = {}) => {
    setLoading(true);
    setError(null);

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      ...options
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
          options: defaultOptions
        };

        setLocations(prev => [location, ...prev]);
        setLoading(false);
      },
      (error) => {
        setError({
          code: error.code,
          message: error.message,
          timestamp: Date.now()
        });
        setLoading(false);
      },
      defaultOptions
    );
  };

  const testDifferentOptions = () => {
    const optionSets = [
      { name: 'Alta precisión', enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      { name: 'Rápido', enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 },
      { name: 'Balanceado', enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    ];

    optionSets.forEach((options, index) => {
      setTimeout(() => {
        getCurrentLocation(options);
      }, index * 2000);
    });
  };

  const clearLocations = () => {
    setLocations([]);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center">
          <FaMapMarkerAlt className="mr-2 text-primary" />
          Depurador de Ubicación
        </h2>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => getCurrentLocation()}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <FaRefresh className="mr-2" />
            )}
            Obtener Ubicación
          </button>
          
          <button
            onClick={testDifferentOptions}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            <FaCog className="mr-2" />
            Probar Opciones
          </button>
          
          <button
            onClick={clearLocations}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            Limpiar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Error de Geolocalización</h3>
          <p className="text-red-700 dark:text-red-300">Código: {error.code}</p>
          <p className="text-red-700 dark:text-red-300">Mensaje: {error.message}</p>
          <p className="text-sm text-red-600 dark:text-red-400">
            Tiempo: {new Date(error.timestamp).toLocaleString()}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {locations.map((location, index) => (
          <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Latitud:</span>
                <p className="text-gray-900 dark:text-gray-100">{location.lat.toFixed(6)}</p>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Longitud:</span>
                <p className="text-gray-900 dark:text-gray-100">{location.lng.toFixed(6)}</p>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Precisión:</span>
                <p className="text-gray-900 dark:text-gray-100">{location.accuracy?.toFixed(0)}m</p>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Altitud:</span>
                <p className="text-gray-900 dark:text-gray-100">
                  {location.altitude ? `${location.altitude.toFixed(0)}m` : 'N/A'}
                </p>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Velocidad:</span>
                <p className="text-gray-900 dark:text-gray-100">
                  {location.speed ? `${location.speed.toFixed(1)} m/s` : 'N/A'}
                </p>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Timestamp:</span>
                <p className="text-gray-900 dark:text-gray-100">
                  {new Date(location.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Opciones utilizadas:</span>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Alta precisión: {location.options.enableHighAccuracy ? 'Sí' : 'No'} | 
                Timeout: {location.options.timeout/1000}s | 
                Edad máxima: {location.options.maximumAge/1000}s
              </p>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <a
                href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-hover underline text-sm"
              >
                Ver en Google Maps
              </a>
            </div>
          </div>
        ))}
      </div>

      {locations.length === 0 && !loading && !error && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Haz clic en "Obtener Ubicación" para comenzar el diagnóstico
        </div>
      )}
    </div>
  );
}
