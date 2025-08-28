'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { Modal } from "../../ui";
import { useModal } from "../../../hooks/useModal";
import { 
  FaArrowLeft, 
  FaUser, 
  FaCar, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaLocationArrow,
  FaPlay,
  FaCheck,
  FaStop,
  FaTimes,
  FaExclamationTriangle,
  FaWrench
} from 'react-icons/fa';

// Importación dinámica para evitar errores de SSR
const LeafletMap = dynamic(() => import('../../maps/LeafletMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
    <p className="text-gray-500">Cargando mapa...</p>
  </div>
});

export default function AsistenteActiveService() {
  const { modalState, showError, showWarning, hideModal } = useModal();
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const serviceId = params?.serviceId;

  const [serviceData, setServiceData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [distanceToClient, setDistanceToClient] = useState(null);
  const [timeToClient, setTimeToClient] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Obtener ubicación del usuario con mejores opciones de precisión
  const getUserLocation = () => {
    if (navigator.geolocation) {
      console.log('📍 AsistenteActiveService: Solicitando ubicación del usuario...');
      
      const options = {
        enableHighAccuracy: true,
        timeout: 15000, // 15 segundos
        maximumAge: 0 // No usar cache, siempre obtener ubicación fresca
      };
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          console.log('📍 AsistenteActiveService: Ubicación obtenida:', {
            ...location,
            accuracy: position.coords.accuracy + 'm',
            timestamp: new Date(position.timestamp).toLocaleTimeString()
          });
          
          setUserLocation(location);
          
          // Actualizar ubicación en el servidor
          fetch('/api/asistente', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: session?.user?.id,
              action: 'update_location',
              ubicacion: location
            })
          })
          .then(response => response.json())
          .then(data => {
            console.log('✅ AsistenteActiveService: Ubicación actualizada en servidor:', data);
          })
          .catch(error => {
            console.error('❌ AsistenteActiveService: Error actualizando ubicación:', error);
          });
        },
        (error) => {
          console.error('❌ AsistenteActiveService: Error obteniendo ubicación:', error);
          let errorMessage = 'Error desconocido al obtener ubicación';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permisos de ubicación denegados. Ve a configuración del navegador y permite la ubicación.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Tu ubicación no está disponible. Verifica que el GPS esté activado.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tiempo agotado al obtener ubicación. Inténtalo de nuevo.';
              break;
          }
          
          showError(errorMessage, 'Error de ubicación');
        },
        options
      );
    } else {
      console.error('❌ AsistenteActiveService: Geolocalización no soportada');
      showError('Tu dispositivo no soporta geolocalización', 'Funcionalidad no disponible');
    }
  };

  // Obtener ruta usando solo cálculo directo (sin API externa para evitar errores)
  const getRoute = async (start, end) => {
    console.log('🗺️ AsistenteActiveService: Calculando ruta directa de:', start, 'a:', end);
    
    // Verificar que tenemos las coordenadas necesarias
    if (!start?.lat || !start?.lng || !end?.lat || !end?.lng) {
      console.error('❌ AsistenteActiveService: Coordenadas incompletas');
      return;
    }

    // Validar coordenadas
    if (isNaN(start.lat) || isNaN(start.lng) || isNaN(end.lat) || isNaN(end.lng)) {
      console.error('❌ AsistenteActiveService: Coordenadas inválidas');
      return;
    }

    try {
      // Usar solo cálculo directo para evitar errores de fetch
      const km = calculateDistance(start.lat, start.lng, end.lat, end.lng);
      setDistanceToClient(km);
      
      const velocidadPromedio = 40; // km/h
      const tiempoEnHoras = km / velocidadPromedio;
      const minutos = Math.round(tiempoEnHoras * 60);
      setTimeToClient(minutos);
      
      console.log(`📊 AsistenteActiveService: Cálculo directo - ${km.toFixed(2)}km, ${minutos}min`);
      
      // Crear coordenadas de ruta simple (línea recta) para mostrar en el mapa
      const routeCoords = [
        [start.lat, start.lng],
        [end.lat, end.lng]
      ];
      setRouteCoordinates(routeCoords);
      
    } catch (calcError) {
      console.error('❌ AsistenteActiveService: Error en cálculo directo:', calcError);
    }
  };

  // Obtener datos del servicio específico
  const fetchServiceData = async () => {
    if (!session?.user?.id || !serviceId) return;
    
    try {
      // Primero verificar el estado específico del servicio
      const serviceResponse = await fetch(`/api/servicerequests?id=${serviceId}`);
      if (serviceResponse.ok) {
        const serviceData = await serviceResponse.json();
        if (serviceData && serviceData.estado === 'cancelado') {
          showError('Este servicio ha sido cancelado por el cliente.');
          setTimeout(() => {
            router.push('/asistente');
          }, 3000);
          return;
        } else if (serviceData && serviceData.estado === 'finalizado') {
          showError('Este servicio ya ha sido completado.');
          setTimeout(() => {
            router.push('/asistente');
          }, 3000);
          return;
        }
      }

      // Luego obtener la lista de servicios activos del asistente
      const response = await fetch(`/api/asistente?userId=${session.user.id}`);
      if (!response.ok) {
        throw new Error('Error al cargar datos');
      }
      
      const data = await response.json();
      
      // Buscar el servicio específico en los servicios asignados
      const servicioEncontrado = data.servicios?.find(s => s._id === serviceId);
      
      if (servicioEncontrado) {
        setServiceData(servicioEncontrado);
        setError(null);
        
        // Verificaciones adicionales de estado
        if (servicioEncontrado.estado === 'cancelado') {
          showError('El servicio ha sido cancelado por el cliente');
          setTimeout(() => {
            router.push('/asistente');
          }, 3000);
        } else if (!['asignado', 'en_camino', 'completado'].includes(servicioEncontrado.estado)) {
          showWarning(`Estado del servicio: ${servicioEncontrado.estado}`);
        }
      } else {
        // El servicio no se encuentra en los servicios activos del asistente
        showError('El servicio ya no está asignado a ti. Puede haber sido reasignado o cancelado.');
        setTimeout(() => {
          router.push('/asistente');
        }, 3000);
      }
    } catch (error) {
      showError('Error al obtener información del servicio: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calcular distancia cuando cambian las ubicaciones
  useEffect(() => {
    if (userLocation && serviceData?.ubicacion) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        serviceData.ubicacion.lat,
        serviceData.ubicacion.lng
      );
      setDistanceToClient(distance);
      
      // Obtener ruta
      getRoute(userLocation, serviceData.ubicacion);
    }
  }, [userLocation, serviceData]);

  // Obtener ubicación del usuario cada 10 segundos para tracking en tiempo real
  useEffect(() => {
    if (session?.user?.id) {
      getUserLocation();
      const locationInterval = setInterval(getUserLocation, 10000); // Cada 10 segundos
      return () => clearInterval(locationInterval);
    }
  }, [session]);

  // Función para cancelar y devolver
  const cancelarYDevolver = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/asistente', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          action: 'release_service',
          serviceId
        })
      });

      if (response.ok) {
        router.push('/asistente');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al devolver servicio');
      }
    } catch (error) {
      console.error('Error devolviendo servicio:', error);
      showError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar estado del servicio
  const actualizarEstado = async (nuevoEstado) => {
    setLoading(true);
    try {
      const response = await fetch('/api/asistente', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          action: 'update_service_state',
          serviceId,
          nuevoEstado
        })
      });

      if (response.ok) {
        fetchServiceData();
        if (nuevoEstado === 'finalizado') {
          setTimeout(() => router.push('/asistente'), 2000);
        }
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al actualizar servicio');
      }
    } catch (error) {
      console.error('Error actualizando servicio:', error);
      showError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Polling para actualizar datos cada 10 segundos
  useEffect(() => {
    if (session?.user?.id) {
      fetchServiceData();
      const interval = setInterval(fetchServiceData, 10000);
      return () => clearInterval(interval);
    }
  }, [serviceId, session]);

  const puedeFinalizarPorDistancia = distanceToClient !== null && distanceToClient <= 0.1;

  if (loading && !serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando servicio...</p>
        </div>
      </div>
    );
  }

  if (error || !serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/asistente')}
            className="bg-primary text-white px-6 py-2 rounded-lg"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header fijo */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/asistente')}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
            >
              <FaArrowLeft className="text-gray-600 dark:text-gray-300" />
            </button>
            
            <div className="flex-1 text-center mx-4">
              <h1 className="text-lg sm:text-xl font-semibold">Servicio Activo</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {serviceData?.cliente?.nombre}
              </p>
            </div>
            
            <div className="text-right min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Distancia</p>
              <p className="font-bold text-sm sm:text-base text-primary">
                {distanceToClient ? `${distanceToClient.toFixed(1)} km` : '---'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
        {/* Métricas principales */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 text-center shadow-lg">
            <FaClock className="text-blue-500 mx-auto mb-2" size={20} />
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tiempo</p>
            <p className="text-lg sm:text-xl font-bold text-blue-500">
              {timeToClient ? `${timeToClient} min` : '---'}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 text-center shadow-lg">
            <FaLocationArrow className="text-green-500 mx-auto mb-2" size={20} />
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Distancia</p>
            <p className="text-lg sm:text-xl font-bold text-green-500">
              {distanceToClient ? `${distanceToClient.toFixed(1)} km` : '---'}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 text-center shadow-lg col-span-2 sm:col-span-1">
            <FaMapMarkerAlt 
              className={`mx-auto mb-2 ${
                puedeFinalizarPorDistancia ? 'text-green-500' : 'text-gray-400'
              }`} 
              size={20} 
            />
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Estado</p>
            <p className={`text-lg sm:text-xl font-bold ${
              puedeFinalizarPorDistancia ? 'text-green-500' : 'text-gray-400'
            }`}>
              {puedeFinalizarPorDistancia ? 'Cerca' : 'Lejos'}
            </p>
          </div>
        </div>

        {/* Mapa */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="h-64 sm:h-80 lg:h-96">
            {userLocation && serviceData?.ubicacion && (
              <LeafletMap
                center={[
                  (userLocation.lat + serviceData.ubicacion.lat) / 2,
                  (userLocation.lng + serviceData.ubicacion.lng) / 2
                ]}
                zoom={15}
                markers={[
                  {
                    position: [userLocation.lat, userLocation.lng],
                    popup: "Mi ubicación",
                    iconColor: "blue"
                  },
                  {
                    position: [serviceData.ubicacion.lat, serviceData.ubicacion.lng],
                    popup: `Cliente: ${serviceData.cliente?.nombre}`,
                    iconColor: "red"
                  }
                ]}
                route={routeCoordinates.length > 0 ? routeCoordinates : undefined}
              />
            )}
          </div>
          
          {/* Estado de ruta */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Navegación activa
              </div>
            </div>
          </div>
        </div>

        {/* Información del cliente y servicio */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaUser className="text-primary" />
            Información del Cliente
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <FaUser className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{serviceData?.cliente?.nombre}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{serviceData?.cliente?.telefono}</p>
                </div>
              </div>
              <button
                onClick={() => window.open(`tel:${serviceData?.cliente?.telefono}`, '_self')}
                className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors shrink-0"
              >
                <FaPhoneAlt size={14} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FaCar className="text-purple-600 dark:text-purple-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{serviceData?.detallesVehiculo?.tipoVehiculo}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {serviceData?.detallesVehiculo?.marca} {serviceData?.detallesVehiculo?.modelo}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FaWrench className="text-orange-600 dark:text-orange-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{serviceData?.servicio?.nombre}</p>
                  <p className="text-sm text-primary font-semibold">${serviceData?.precio?.toFixed(2)} MXN</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerta de proximidad */}
        {!puedeFinalizarPorDistancia && distanceToClient && serviceData?.estado === 'en_camino' && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">Acércate para finalizar</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Distancia actual: {(distanceToClient * 1000).toFixed(0)}m (necesitas menos de 100m)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="space-y-3 sm:space-y-4">
          {serviceData?.estado === 'asignado' && (
            <button
              onClick={() => actualizarEstado('en_camino')}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 sm:py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <FaPlay size={14} />
                  Iniciar Viaje
                </>
              )}
            </button>
          )}

          {serviceData?.estado === 'en_camino' && (
            <button
              onClick={() => actualizarEstado('finalizado')}
              disabled={loading || !puedeFinalizarPorDistancia}
              className={`w-full py-3 sm:py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base ${
                puedeFinalizarPorDistancia
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <FaCheck size={14} />
                  <span className="text-center">
                    {puedeFinalizarPorDistancia ? 'Finalizar Servicio' : 'Acércate más para finalizar'}
                  </span>
                </>
              )}
            </button>
          )}

          {/* Acciones secundarias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={cancelarYDevolver}
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 sm:py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm"
            >
              <FaStop size={12} />
              <span className="hidden sm:inline">Devolver Servicio</span>
              <span className="sm:hidden">Devolver</span>
            </button>
            
            <button
              onClick={() => actualizarEstado('cancelado')}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white py-2.5 sm:py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm"
            >
              <FaTimes size={12} />
              <span className="hidden sm:inline">Cancelar Servicio</span>
              <span className="sm:hidden">Cancelar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de carga */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 flex flex-col items-center gap-3 max-w-sm w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-gray-700 dark:text-gray-300 font-medium text-center">Actualizando servicio...</p>
          </div>
        </div>
      )}

      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        showCancel={modalState.showCancel}
      />
    </div>
  );
}
