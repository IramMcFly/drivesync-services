"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FaCar, 
  FaMapMarkerAlt, 
  FaClock, 
  FaPhoneAlt,
  FaCheck,
  FaRoute,
  FaTimes,
  FaPlay,
  FaStop,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaArrowLeft,
  FaLocationArrow,
  FaUser
} from "react-icons/fa";
import dynamic from "next/dynamic";

// Importar el mapa dinámicamente
const LeafletMap = dynamic(() => import("@/components/maps/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
});

const AsistenteServiceManager = ({ servicio, session, onServiceUpdate, onBack }) => {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState(null);
  const [distanceToClient, setDistanceToClient] = useState(null);
  const [timeToClient, setTimeToClient] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Calcular distancia en línea recta (Haversine)
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

  // Obtener ubicación del usuario y calcular ruta
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          if (servicio.ubicacion) {
            const distance = calculateDistance(
              location.lat, 
              location.lng, 
              servicio.ubicacion.lat, 
              servicio.ubicacion.lng
            );
            setDistanceToClient(distance);
            setTimeToClient(Math.round(distance * 3)); // Estimación: 3 minutos por km
          }
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [servicio]);

  // Función para actualizar estado del servicio
  const actualizarEstado = async (nuevoEstado) => {
    setLoading(true);
    try {
      const response = await fetch('/api/asistente', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          action: 'update_service',
          serviceId: servicio._id,
          nuevoEstado
        })
      });

      if (response.ok) {
        onServiceUpdate();
        if (nuevoEstado === 'finalizado' || nuevoEstado === 'cancelado') {
          onBack();
        }
      } else {
        alert('Error al actualizar el servicio');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar y devolver a pendiente
  const cancelarYDevolver = async () => {
    if (confirm('¿Deseas cancelar este servicio y devolverlo a la lista de pendientes?')) {
      setLoading(true);
      try {
        const response = await fetch('/api/asistente', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            action: 'release_service',
            serviceId: servicio._id
          })
        });

        if (response.ok) {
          onServiceUpdate();
          onBack();
        } else {
          alert('Error al devolver el servicio');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
      } finally {
        setLoading(false);
      }
    }
  };

  // Determinar si puede finalizar (está cerca del cliente)
  const puedeFinalizarPorDistancia = distanceToClient !== null && distanceToClient <= 0.1; // 100 metros

  const getStatusInfo = () => {
    switch (servicio.estado) {
      case 'asignado':
        return {
          color: 'bg-blue-500',
          text: 'Servicio Asignado',
          description: 'Puedes iniciar el viaje hacia el cliente'
        };
      case 'en_camino':
        return {
          color: 'bg-orange-500',
          text: 'En Camino',
          description: 'Dirigiéndote hacia el cliente'
        };
      default:
        return {
          color: 'bg-gray-500',
          text: servicio.estado,
          description: ''
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header responsivo */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <FaArrowLeft />
              <span className="hidden sm:inline">Volver</span>
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-center flex-1">
              Gestión de Servicio
            </h1>
            <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-white ${statusInfo.color}`}>
              {statusInfo.text}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Información del servicio */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{servicio.servicio.nombre}</h2>
              {servicio.subtipo && (
                <p className="text-gray-600 dark:text-gray-400 mb-3">{servicio.subtipo}</p>
              )}
              <p className="text-sm text-gray-500 mb-4">{statusInfo.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cliente:</p>
                  <p className="font-semibold text-lg">{servicio.cliente.nombre}</p>
                  <p className="text-sm text-gray-500">{servicio.cliente.telefono}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vehículo:</p>
                  <p className="font-semibold">{servicio.detallesVehiculo.tipoVehiculo}</p>
                  <p className="text-sm text-gray-500">
                    {servicio.detallesVehiculo.marca} {servicio.detallesVehiculo.modelo} ({servicio.detallesVehiculo.año})
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center sm:text-right">
              <p className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                ${servicio.precio.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">Valor del servicio</p>
            </div>
          </div>
        </div>

        {/* Información de distancia y tiempo */}
        {userLocation && servicio.ubicacion && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-lg text-center">
              <FaLocationArrow className="text-primary text-xl sm:text-2xl mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Distancia</p>
              <p className="font-bold text-sm sm:text-lg">
                {distanceToClient ? `${distanceToClient.toFixed(1)} km` : 'Calculando...'}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-lg text-center">
              <FaClock className="text-blue-500 text-xl sm:text-2xl mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tiempo estimado</p>
              <p className="font-bold text-sm sm:text-lg">
                {timeToClient ? `${timeToClient} min` : 'Calculando...'}
              </p>
            </div>

            <div className={`rounded-xl p-3 sm:p-4 shadow-lg text-center ${
              puedeFinalizarPorDistancia 
                ? 'bg-green-100 dark:bg-green-900 border-2 border-green-500' 
                : 'bg-white dark:bg-gray-800'
            }`}>
              <FaMapMarkerAlt className={`text-xl sm:text-2xl mx-auto mb-2 ${
                puedeFinalizarPorDistancia ? 'text-green-600' : 'text-gray-400'
              }`} />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Proximidad</p>
              <p className={`font-bold text-sm sm:text-lg ${
                puedeFinalizarPorDistancia ? 'text-green-600' : 'text-gray-500'
              }`}>
                {puedeFinalizarPorDistancia ? 'Muy cerca' : 'Lejano'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-lg text-center">
              <FaUser className="text-purple-500 text-xl sm:text-2xl mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Estado</p>
              <p className="font-bold text-sm sm:text-lg capitalize">
                {servicio.estado.replace('_', ' ')}
              </p>
            </div>
          </div>
        )}

        {/* Mapa con ubicaciones */}
        {userLocation && servicio.ubicacion && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaRoute className="text-primary" />
              Ubicaciones
            </h3>
            <div className="h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden">
              <LeafletMap
                center={[
                  (userLocation.lat + servicio.ubicacion.lat) / 2,
                  (userLocation.lng + servicio.ubicacion.lng) / 2
                ]}
                zoom={13}
                markers={[
                  {
                    position: [userLocation.lat, userLocation.lng],
                    popup: "Mi ubicación (Asistente)",
                    iconColor: "blue"
                  },
                  {
                    position: [servicio.ubicacion.lat, servicio.ubicacion.lng],
                    popup: `Cliente: ${servicio.cliente.nombre}`,
                    iconColor: "red"
                  }
                ]}
                route={routeCoordinates.length > 0 ? routeCoordinates : undefined}
              />
            </div>
          </div>
        )}

        {/* Acciones del servicio */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Acciones del Servicio</h3>
          
          <div className="space-y-3">
            {/* Llamar al cliente */}
            <a
              href={`tel:${servicio.cliente.telefono}`}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 sm:py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FaPhoneAlt />
              Llamar a {servicio.cliente.nombre}
            </a>

            {/* Acciones según el estado */}
            {servicio.estado === 'asignado' && (
              <button
                onClick={() => actualizarEstado('en_camino')}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white py-3 sm:py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FaPlay />
                    Iniciar Viaje al Cliente
                  </>
                )}
              </button>
            )}

            {servicio.estado === 'en_camino' && (
              <button
                onClick={() => actualizarEstado('finalizado')}
                disabled={loading || !puedeFinalizarPorDistancia}
                className={`w-full py-3 sm:py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 ${
                  puedeFinalizarPorDistancia
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                }`}
                title={!puedeFinalizarPorDistancia ? 'Debes estar cerca del cliente para finalizar' : ''}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FaCheck />
                    Finalizar Servicio
                    {!puedeFinalizarPorDistancia && (
                      <span className="text-xs">(Acércate más)</span>
                    )}
                  </>
                )}
              </button>
            )}

            {/* Botón para ir al tracking completo */}
            <button
              onClick={() => router.push(`/asistente/service-active/${servicio._id}`)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 sm:py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FaRoute />
              Vista de Navegación Completa
            </button>

            {/* Acciones de cancelación */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600 space-y-2">
              <button
                onClick={cancelarYDevolver}
                disabled={loading}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FaStop />
                    Cancelar y Devolver a Pendientes
                  </>
                )}
              </button>
              
              <button
                onClick={() => actualizarEstado('cancelado')}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FaTimes />
                    Cancelar Definitivamente
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        {!puedeFinalizarPorDistancia && servicio.estado === 'en_camino' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                  Proximidad requerida
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Para finalizar el servicio, debes estar a menos de 100 metros del cliente. 
                  Tu distancia actual: {distanceToClient ? `${(distanceToClient * 1000).toFixed(0)} metros` : 'Calculando...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AsistenteServiceManager;
