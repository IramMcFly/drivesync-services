import { useState, useEffect } from 'react';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000,
    ...options
  };

  const requestLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError({
        code: 'NOT_SUPPORTED',
        message: 'La geolocalización no es compatible con este dispositivo'
      });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
        setError(null);
        setLoading(false);
      },
      (error) => {
        let errorInfo = {};
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorInfo = {
              code: 'PERMISSION_DENIED',
              message: 'Acceso a la ubicación denegado. Por favor, permite el acceso a la ubicación en tu navegador.',
              canRetry: true
            };
            break;
          case error.POSITION_UNAVAILABLE:
            errorInfo = {
              code: 'POSITION_UNAVAILABLE',
              message: 'No se pudo obtener tu ubicación. Verifica que el GPS esté activado.',
              canRetry: true
            };
            break;
          case error.TIMEOUT:
            errorInfo = {
              code: 'TIMEOUT',
              message: 'La solicitud de ubicación ha excedido el tiempo límite.',
              canRetry: true
            };
            break;
          default:
            errorInfo = {
              code: 'UNKNOWN',
              message: 'Error desconocido al obtener la ubicación.',
              canRetry: true
            };
        }
        
        setError(errorInfo);
        setLoading(false);
      },
      defaultOptions
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return {
    location,
    error,
    loading,
    requestLocation,
    isSupported: !!navigator.geolocation
  };
};

export default useGeolocation;
