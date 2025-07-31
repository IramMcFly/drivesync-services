'use client';

import { useState, useEffect } from 'react';
import { FaCar, FaPhone, FaMapMarkerAlt, FaClock, FaUser, FaTimes, FaCheck } from 'react-icons/fa';
import dynamic from 'next/dynamic';

// Importación dinámica para evitar errores de SSR
const LeafletMap = dynamic(() => import('../../maps/LeafletMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
    <p className="text-gray-500">Cargando mapa...</p>
  </div>
});

export default function ClienteServiceStatus({ serviceRequest, onClose }) {
  const [asistenteLocation, setAsistenteLocation] = useState(null);
  const [timeToArrival, setTimeToArrival] = useState(null);
  const [distanceToClient, setDistanceToClient] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Función para calcular distancia haversine
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Obtener ubicación del asistente
  const fetchAsistenteLocation = async () => {
    try {
      const response = await fetch(`/api/asistentes?asistenteId=${serviceRequest.asistente._id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.asistente?.ubicacionActual) {
          setAsistenteLocation(data.asistente.ubicacionActual);
        }
      }
    } catch (error) {
      console.error('Error obteniendo ubicación del asistente:', error);
    }
  };

  // Obtener ruta desde asistente hasta cliente
  const getRoute = async (start, end) => {
    try {
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248a1e0bd5aac6144f1b35549ad864b37fb&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const coordinates = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        const duration = Math.round(data.features[0].properties.segments[0].duration / 60);
        
        setRouteCoordinates(coordinates);
        setTimeToArrival(duration);
      }
    } catch (error) {
      console.error('Error obteniendo ruta:', error);
    }
  };

  // Calcular distancia y ruta cuando cambian las ubicaciones
  useEffect(() => {
    if (asistenteLocation && serviceRequest.ubicacion) {
      const distance = calculateDistance(
        asistenteLocation.lat,
        asistenteLocation.lng,
        serviceRequest.ubicacion.lat,
        serviceRequest.ubicacion.lng
      );
      setDistanceToClient(distance);
      
      // Obtener ruta
      getRoute(asistenteLocation, serviceRequest.ubicacion);
    }
  }, [asistenteLocation, serviceRequest.ubicacion]);

  // Actualizar ubicación del asistente cada 30 segundos
  useEffect(() => {
    fetchAsistenteLocation();
    const interval = setInterval(fetchAsistenteLocation, 30000);
    return () => clearInterval(interval);
  }, [serviceRequest.asistente._id]);

  const getStatusColor = () => {
    switch (serviceRequest.estado) {
      case 'asignado':
        return 'bg-blue-500';
      case 'en_camino':
        return 'bg-orange-500';
      case 'finalizado':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (serviceRequest.estado) {
      case 'asignado':
        return 'Asistente asignado';
      case 'en_camino':
        return 'Asistente en camino';
      case 'finalizado':
        return 'Servicio completado';
      default:
        return 'Estado desconocido';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {getStatusText()}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Información del asistente */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <FaUser className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {serviceRequest.asistente.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Asistente asignado
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => window.open(`tel:${serviceRequest.asistente.telefono}`, '_self')}
                className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                <FaPhone />
              </button>
            </div>
            
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p><strong>Teléfono:</strong> {serviceRequest.asistente.telefono}</p>
              <p><strong>Taller:</strong> {serviceRequest.taller.nombre}</p>
            </div>
          </div>

          {/* Métricas de llegada */}
          {asistenteLocation && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center">
                <FaClock className="text-blue-500 text-xl mx-auto mb-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Tiempo estimado</p>
                <p className="font-bold text-gray-900 dark:text-gray-100">
                  {timeToArrival ? `${timeToArrival} min` : 'Calculando...'}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center">
                <FaMapMarkerAlt className="text-green-500 text-xl mx-auto mb-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Distancia</p>
                <p className="font-bold text-gray-900 dark:text-gray-100">
                  {distanceToClient ? `${distanceToClient.toFixed(1)} km` : 'Calculando...'}
                </p>
              </div>
            </div>
          )}

          {/* Información del servicio */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <FaCar className="text-purple-600" />
              Detalles del Servicio
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Servicio:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {serviceRequest.servicio.nombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Vehículo:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {serviceRequest.detallesVehiculo.marca} {serviceRequest.detallesVehiculo.modelo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Precio:</span>
                <span className="font-bold text-lg text-green-600">
                  ${serviceRequest.precio.toFixed(2)} MXN
                </span>
              </div>
            </div>
          </div>

          {/* Mapa de seguimiento */}
          {asistenteLocation && serviceRequest.ubicacion && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Seguimiento en tiempo real
              </h3>
              <div className="h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                <LeafletMap
                  center={[
                    (asistenteLocation.lat + serviceRequest.ubicacion.lat) / 2,
                    (asistenteLocation.lng + serviceRequest.ubicacion.lng) / 2
                  ]}
                  zoom={13}
                  markers={[
                    {
                      position: [asistenteLocation.lat, asistenteLocation.lng],
                      popup: `Asistente: ${serviceRequest.asistente.nombre}`,
                      iconColor: "blue"
                    },
                    {
                      position: [serviceRequest.ubicacion.lat, serviceRequest.ubicacion.lng],
                      popup: "Tu ubicación",
                      iconColor: "red"
                    }
                  ]}
                  route={routeCoordinates.length > 0 ? routeCoordinates : undefined}
                />
              </div>
            </div>
          )}

          {/* Estado actual detallado */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()} mt-1`}></div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {getStatusText()}
                </p>
                {serviceRequest.estado === 'asignado' && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    El asistente se está preparando para dirigirse a tu ubicación.
                  </p>
                )}
                {serviceRequest.estado === 'en_camino' && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    El asistente está en camino hacia tu ubicación. Tiempo estimado: {timeToArrival ? `${timeToArrival} minutos` : 'Calculando...'}.
                  </p>
                )}
                {serviceRequest.estado === 'finalizado' && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    El servicio ha sido completado exitosamente. ¡Gracias por usar nuestros servicios!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botón de confirmación para servicios finalizados */}
          {serviceRequest.estado === 'finalizado' && (
            <button
              onClick={onClose}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <FaCheck />
              ¡Entendido!
            </button>
          )}

          {/* Información adicional */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-3">
            Actualizado automáticamente cada 30 segundos
          </div>
        </div>
      </div>
    </div>
  );
}
