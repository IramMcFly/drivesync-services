'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FaCar, FaPhone, FaMapMarkerAlt, FaClock, FaUser, FaTimes, FaCheck, FaSpinner, FaExclamationTriangle, FaRoute, FaMoneyBillWave, FaStar } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import RatingModal from '../../ui/RatingModal';

// Importación dinámica para evitar errores de SSR
const LeafletMap = dynamic(() => import('../../maps/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg flex items-center justify-center">
      <FaSpinner className="animate-spin text-gray-500 text-xl" />
    </div>
  )
});

export default function ClienteServiceStatus({ 
  serviceRequest, 
  onClose, 
  isEmbedded = false,
  stateInfo = null 
}) {
  const [asistenteLocation, setAsistenteLocation] = useState(null);
  const [timeToArrival, setTimeToArrival] = useState(null);
  const [distanceToClient, setDistanceToClient] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);
  
  // Estados para el rating
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Función para calcular distancia haversine
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Obtener ubicación del asistente con manejo de errores mejorado
  const fetchAsistenteLocation = useCallback(async () => {
    if (!serviceRequest?.asistente?._id) {
      setError('ID del asistente no disponible');
      setLoading(false);
      return;
    }

    // No fetch si el servicio está en estado final
    if (['cancelado', 'finalizado'].includes(serviceRequest?.estado)) {
      console.log('Service is in final state, skipping location fetch');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/asistentes?asistenteId=${serviceRequest.asistente._id}`, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.asistente?.ubicacionActual) {
        setAsistenteLocation(data.asistente.ubicacionActual);
        setLastUpdate(new Date());
      } else {
        setError('Ubicación del asistente no disponible');
      }
    } catch (error) {
      console.error('Error obteniendo ubicación del asistente:', error);
      setError(`Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [serviceRequest?.asistente?._id, serviceRequest?.estado]);

  // Calcular ruta usando solo cálculo directo (sin API externa para evitar errores)
  const getRoute = useCallback(async (start, end) => {
    try {
      // Validate service is still active
      if (!serviceRequest || ['cancelado', 'finalizado'].includes(serviceRequest.estado)) {
        console.log('🚫 ClienteServiceStatus: Saltando cálculo de ruta para servicio inactivo');
        return;
      }

      // Validate coordinates
      if (!start || !end || !start.lat || !start.lng || !end.lat || !end.lng) {
        console.warn('⚠️ ClienteServiceStatus: Coordenadas inválidas para routing');
        return;
      }

      // Validate coordinates are numbers
      if (isNaN(start.lat) || isNaN(start.lng) || isNaN(end.lat) || isNaN(end.lng)) {
        console.warn('⚠️ ClienteServiceStatus: Coordenadas no son números válidos');
        return;
      }

      console.log('🗺️ ClienteServiceStatus: Calculando ruta directa...');
      
      // Usar solo cálculo directo para evitar errores de fetch
      const distance = calculateDistance(start.lat, start.lng, end.lat, end.lng);
      
      // Crear coordenadas de ruta simple
      const coordinates = [[start.lat, start.lng], [end.lat, end.lng]];
      setRouteCoordinates(coordinates);
      
      // Calcular tiempo estimado de llegada (40 km/h promedio)
      const velocidadPromedio = 40;
      const tiempoEnHoras = distance / velocidadPromedio;
      const tiempoEnSegundos = tiempoEnHoras * 3600;
      const arrivalTime = new Date(Date.now() + tiempoEnSegundos * 1000);
      setTimeToArrival(arrivalTime);
      
      console.log(`📊 ClienteServiceStatus: Ruta calculada - ${distance.toFixed(2)}km, llegada: ${arrivalTime.toLocaleTimeString()}`);
      
    } catch (error) {
      console.error('❌ ClienteServiceStatus: Error calculando ruta:', error);
      setRouteCoordinates([]);
      setTimeToArrival(null);
    }
  }, [serviceRequest, calculateDistance]);

  // Calcular distancia y ruta cuando cambian las ubicaciones
  useEffect(() => {
    // No procesar si el servicio está en estado final
    if (!serviceRequest || ['cancelado', 'finalizado'].includes(serviceRequest.estado)) {
      return;
    }

    if (asistenteLocation && serviceRequest?.ubicacion) {
      // Validar que las coordenadas existan y sean números válidos
      if (asistenteLocation.lat && asistenteLocation.lng && 
          serviceRequest.ubicacion.lat && serviceRequest.ubicacion.lng &&
          !isNaN(asistenteLocation.lat) && !isNaN(asistenteLocation.lng) &&
          !isNaN(serviceRequest.ubicacion.lat) && !isNaN(serviceRequest.ubicacion.lng)) {
        
        const distance = calculateDistance(
          asistenteLocation.lat,
          asistenteLocation.lng,
          serviceRequest.ubicacion.lat,
          serviceRequest.ubicacion.lng
        );
        setDistanceToClient(distance);
        
        // Obtener ruta solo si están a una distancia razonable y las coordenadas son válidas
        if (distance < 50 && distance > 0.1) { // Entre 100m y 50km
          getRoute(asistenteLocation, serviceRequest.ubicacion);
        }
      }
    }
  }, [asistenteLocation, serviceRequest?.ubicacion, serviceRequest?.estado, calculateDistance, getRoute]);

  // Polling inteligente para ubicación del asistente
  useEffect(() => {
    // No iniciar polling si no hay asistente o si está en estado final
    if (!serviceRequest?.asistente?._id || ['cancelado', 'finalizado'].includes(serviceRequest?.estado)) {
      return;
    }

    // Fetch inicial
    fetchAsistenteLocation();

    // Intervalo variable según el estado
    const getInterval = () => {
      switch (serviceRequest.estado) {
        case 'en_camino': return 15000; // 15s cuando está en camino
        case 'asignado': return 30000;  // 30s cuando está asignado
        default: return 60000;          // 60s para otros estados
      }
    };

    intervalRef.current = setInterval(fetchAsistenteLocation, getInterval());

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [serviceRequest?.asistente?._id, serviceRequest?.estado, fetchAsistenteLocation]);

  // Función para manejar el envío de calificación
  const handleRatingSubmit = async (ratingData) => {
    setIsSubmittingRating(true);
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar la calificación');
      }

      const result = await response.json();
      console.log('Calificación enviada exitosamente:', result);
      
      setRatingSubmitted(true);
      setShowRatingModal(false);
      
      // Opcional: mostrar mensaje de éxito
      // toast.success('¡Gracias por tu calificación!');
      
    } catch (error) {
      console.error('Error enviando calificación:', error);
      throw error; // Re-throw para que el modal pueda mostrar el error
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Verificar si el servicio ya fue calificado
  useEffect(() => {
    if (serviceRequest?.isRated) {
      setRatingSubmitted(true);
    }
  }, [serviceRequest?.isRated]);

  // Limpiar estado cuando el servicio se cancela o finaliza
  useEffect(() => {
    if (serviceRequest && ['cancelado', 'finalizado'].includes(serviceRequest.estado)) {
      // Limpiar intervalos
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Limpiar estado de ubicación y rutas
      setAsistenteLocation(null);
      setRouteCoordinates([]);
      setTimeToArrival(null);
      setDistanceToClient(null);
      setError(null);
      setLoading(false);
    }
  }, [serviceRequest?.estado]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Estados y colores
  const getStatusColor = () => {
    if (stateInfo) return stateInfo.color;
    
    switch (serviceRequest?.estado) {
      case 'asignado': return 'blue';
      case 'en_camino': return 'orange';
      case 'finalizado': return 'green';
      case 'cancelado': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = () => {
    if (stateInfo) return stateInfo.label;
    
    switch (serviceRequest?.estado) {
      case 'asignado': return 'Asistente asignado';
      case 'en_camino': return 'Asistente en camino';
      case 'finalizado': return 'Servicio completado';
      case 'cancelado': return 'Servicio cancelado';
      default: return 'Estado desconocido';
    }
  };

  const getStatusBgClass = () => {
    const color = getStatusColor();
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'orange': return 'bg-orange-500';
      case 'green': return 'bg-green-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!serviceRequest) {
    return null;
  }

  // Si el servicio está en estado final, no mostrar información de tracking
  if (['cancelado', 'finalizado'].includes(serviceRequest.estado) && error) {
    return null;
  }

  // Renderizado para modo embedded (dentro del wrapper)
  if (isEmbedded) {
    return (
      <div className="h-full">
        <div className="p-4 space-y-4">
          {/* Información del asistente */}
          {serviceRequest.asistente && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <FaUser className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      {serviceRequest.asistente.user?.nombre || serviceRequest.asistente.nombre || 'Asistente'}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Asistente asignado
                    </p>
                  </div>
                </div>
                
                {serviceRequest.asistente.user?.telefono && (
                  <button
                    onClick={() => window.open(`tel:${serviceRequest.asistente.user.telefono}`, '_self')}
                    className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors text-sm"
                  >
                    <FaPhone />
                  </button>
                )}
              </div>
              
              <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                {serviceRequest.asistente.user?.telefono && (
                  <p><strong>Teléfono:</strong> {serviceRequest.asistente.user.telefono}</p>
                )}
                {serviceRequest.taller?.nombre && (
                  <p><strong>Taller:</strong> {serviceRequest.taller.nombre}</p>
                )}
                {serviceRequest.asistente.placa && (
                  <p><strong>Vehículo:</strong> {serviceRequest.asistente.placa}</p>
                )}
              </div>
            </div>
          )}

          {/* Métricas de llegada */}
          {asistenteLocation && serviceRequest.estado === 'en_camino' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center">
                <FaClock className="text-blue-500 text-lg mx-auto mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Tiempo estimado</p>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                  {timeToArrival ? `${timeToArrival} min` : 'Calculando...'}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center">
                <FaMapMarkerAlt className="text-green-500 text-lg mx-auto mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Distancia</p>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                  {distanceToClient ? `${distanceToClient.toFixed(1)} km` : 'Calculando...'}
                </p>
              </div>
            </div>
          )}

          {/* Información del servicio */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2 text-sm">
              <FaCar className="text-purple-600" />
              Detalles del Servicio
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Servicio:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {serviceRequest.servicio?.nombre || 'N/A'}
                </span>
              </div>
              {serviceRequest.subtipo && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtipo:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {serviceRequest.subtipo}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Vehículo:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {serviceRequest.detallesVehiculo?.marca} {serviceRequest.detallesVehiculo?.modelo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Precio:</span>
                <span className="font-bold text-sm text-green-600 flex items-center gap-1">
                  <FaMoneyBillWave />
                  ${serviceRequest.precio?.toFixed(2)} MXN
                </span>
              </div>
            </div>
          </div>

          {/* Mapa de seguimiento para móvil más pequeño */}
          {asistenteLocation && serviceRequest.ubicacion && serviceRequest.estado === 'en_camino' && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm flex items-center gap-2">
                <FaRoute className="text-blue-500" />
                Seguimiento en tiempo real
              </h3>
              <div className="h-32 md:h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                <LeafletMap
                  center={[
                    (asistenteLocation.lat + serviceRequest.ubicacion.lat) / 2,
                    (asistenteLocation.lng + serviceRequest.ubicacion.lng) / 2
                  ]}
                  zoom={13}
                  markers={[
                    {
                      position: [asistenteLocation.lat, asistenteLocation.lng],
                      popup: `Asistente: ${serviceRequest.asistente?.user?.nombre || 'Asistente'}`,
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
          <div className={`${stateInfo?.bgColor || 'bg-blue-50 dark:bg-blue-900/20'} rounded-xl p-4 border ${stateInfo?.borderColor || 'border-blue-200 dark:border-blue-800'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusBgClass()} mt-1 animate-pulse`}></div>
              <div>
                <p className={`font-medium mb-1 text-sm ${stateInfo?.textColor || 'text-gray-900 dark:text-gray-100'}`}>
                  {getStatusText()}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {stateInfo?.description || getStatusDescription()}
                </p>
                {lastUpdate && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Última actualización: {lastUpdate.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Estados de carga y error */}
          {loading && (
            <div className="flex items-center justify-center p-3 text-sm text-gray-600 dark:text-gray-400">
              <FaSpinner className="animate-spin mr-2" />
              Actualizando ubicación...
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <FaExclamationTriangle />
                <span>Error de conexión</span>
              </div>
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Renderizado para modo modal (standalone)
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusBgClass()}`}></div>
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

        {/* Contenido usando el componente embedded */}
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
          <ClienteServiceStatus
            serviceRequest={serviceRequest}
            onClose={onClose}
            isEmbedded={true}
            stateInfo={stateInfo}
          />
        </div>

        {/* Footer para servicios finalizados o cancelados */}
        {(serviceRequest.estado === 'finalizado' || serviceRequest.estado === 'cancelado') && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {serviceRequest.estado === 'finalizado' && !ratingSubmitted && !serviceRequest.isRated ? (
              // Mostrar botones de calificar y cerrar
              <div className="space-y-3">
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="w-full py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-white bg-yellow-500 hover:bg-yellow-600"
                >
                  <FaStar />
                  Calificar Servicio
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-gray-600 bg-gray-100 hover:bg-gray-200"
                >
                  Cerrar sin calificar
                </button>
              </div>
            ) : (
              // Botón normal para servicios cancelados o ya calificados
              <button
                onClick={onClose}
                className={`
                  w-full py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-white
                  ${serviceRequest.estado === 'finalizado' 
                    ? ratingSubmitted || serviceRequest.isRated
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-600 hover:bg-gray-700'
                  }
                `}
              >
                <FaCheck />
                {serviceRequest.estado === 'finalizado' 
                  ? (ratingSubmitted || serviceRequest.isRated ? '¡Gracias por calificar!' : '¡Entendido!')
                  : 'Cerrar'
                }
              </button>
            )}
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && (
          <RatingModal
            isOpen={showRatingModal}
            onClose={() => setShowRatingModal(false)}
            onSubmit={handleRatingSubmit}
            tallerNombre={serviceRequest?.taller?.nombre || 'el taller'}
            serviceId={serviceRequest?._id}
            tallerId={serviceRequest?.taller?._id}
            isLoading={isSubmittingRating}
          />
        )}
      </div>
    </div>
  );

  function getStatusDescription() {
    switch (serviceRequest?.estado) {
      case 'asignado':
        return 'El asistente se está preparando para dirigirse a tu ubicación.';
      case 'en_camino':
        return `El asistente está en camino hacia tu ubicación. ${timeToArrival ? `Tiempo estimado: ${timeToArrival} minutos.` : ''}`;
      case 'finalizado':
        return 'El servicio ha sido completado exitosamente. ¡Gracias por usar nuestros servicios!';
      case 'cancelado':
        return 'Tu servicio ha sido cancelado. Si necesitas ayuda, puedes solicitar un nuevo servicio.';
      default:
        return 'Procesando solicitud...';
    }
  }
}
