"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  FaCar, 
  FaMapMarkerAlt, 
  FaClock, 
  FaPhoneAlt,
  FaCheck,
  FaTimes,
  FaArrowLeft,
  FaLocationArrow,
  FaRoute,
  FaExclamationTriangle,
  FaUser,
  FaCompass,
  FaWifi
} from "react-icons/fa";
import dynamic from "next/dynamic";

// Importar el mapa dinámicamente
const LeafletMap = dynamic(() => import("@/components/maps/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
});

const AsistenteActiveService = ({ serviceId }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [serviceData, setServiceData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distanceToClient, setDistanceToClient] = useState(null);
  const [timeToClient, setTimeToClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Calcular distancia usando Haversine
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Obtener datos del servicio
  const fetchServiceData = async () => {
    try {
      const response = await fetch(`/api/servicerequests?id=${serviceId}`);
      if (response.ok) {
        const data = await response.json();
        setServiceData(data);
        
        // Si el servicio está finalizado o cancelado, redirigir
        if (data.estado === 'finalizado' || data.estado === 'cancelado') {
          router.push('/asistente');
          return;
        }
        
        setLoading(false);
      } else {
        setError('No se pudo cargar la información del servicio');
        setLoading(false);
      }
    } catch (err) {
      setError('Error de conexión');
      setLoading(false);
    }
  };

  // Obtener y monitorear ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setLastUpdate(new Date());
          
          // Actualizar ubicación en el servidor
          if (session?.user?.id) {
            updateLocationOnServer(location);
          }
          
          // Calcular distancia y tiempo si tenemos los datos del servicio
          if (serviceData?.ubicacion) {
            const distance = calculateDistance(
              location.lat, 
              location.lng, 
              serviceData.ubicacion.lat, 
              serviceData.ubicacion.lng
            );
            setDistanceToClient(distance);
            setTimeToClient(Math.round(distance * 2.5)); // Estimación más realista
            
            // Obtener ruta si estamos en camino
            if (serviceData.estado === 'en_camino') {
              calculateRoute(location, serviceData.ubicacion);
            }
          }
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 5000, 
          timeout: 10000 
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [serviceData, session]);

  // Actualizar ubicación en el servidor
  const updateLocationOnServer = async (location) => {
    try {
      await fetch('/api/asistente', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          action: 'update_location',
          ubicacion: location
        })
      });
    } catch (error) {
      console.error('Error actualizando ubicación:', error);
    }
  };

  // Calcular ruta usando OpenRouteService
  const calculateRoute = async (from, to) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENROUTE_API_KEY || process.env.LEAFLETMAP_API_KEY;
      if (!apiKey) {
        console.warn('No se encontró API key para OpenRouteService');
        return;
      }

      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${from.lng},${from.lat}&end=${to.lng},${to.lat}`
      );

      if (response.ok) {
        const data = await response.json();
        const coordinates = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRouteCoordinates(coordinates);
      }
    } catch (error) {
      console.error('Error calculando ruta:', error);
    }
  };

  // Actualizar estado del servicio
  const actualizarEstado = async (nuevoEstado) => {
    try {
      const response = await fetch('/api/asistente', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          action: 'update_service',
          serviceId,
          nuevoEstado
        })
      });

      if (response.ok) {
        fetchServiceData();
        if (nuevoEstado === 'finalizado') {
          setTimeout(() => router.push('/asistente'), 2000);
        }
      }
    } catch (error) {
      console.error('Error actualizando servicio:', error);
    }
  };

  // Polling para actualizar datos cada 10 segundos
  useEffect(() => {
    fetchServiceData();
    const interval = setInterval(fetchServiceData, 10000);
    return () => clearInterval(interval);
  }, [serviceId]);

  const puedeFinalizarPorDistancia = distanceToClient !== null && distanceToClient <= 0.1;

  if (loading) {
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
      {/* Header fijo - optimizado para móvil */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-20">
        <div className="px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/asistente')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm"
            >
              <FaArrowLeft />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <FaWifi className="text-green-500" />
              <span className="hidden sm:inline">Actualizado:</span>
              <span>{lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Información compacta del servicio - sticky en móvil */}
      <div className="bg-primary text-white sticky top-12 sm:top-14 z-10">
        <div className="px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-sm sm:text-base truncate">
                {serviceData.cliente.nombre}
              </h1>
              <p className="text-xs opacity-90 truncate">
                {serviceData.servicio.nombre}
              </p>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4 text-right">
              {distanceToClient && (
                <div>
                  <p className="text-xs opacity-90">Distancia</p>
                  <p className="font-bold text-sm sm:text-base">
                    {distanceToClient.toFixed(1)} km
                  </p>
                </div>
              )}
              {timeToClient && (
                <div>
                  <p className="text-xs opacity-90">Tiempo</p>
                  <p className="font-bold text-sm sm:text-base">
                    {timeToClient} min
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mapa principal - ocupa la mayor parte de la pantalla */}
      <div className="relative h-[calc(100vh-200px)] sm:h-[calc(100vh-160px)]">
        {userLocation && serviceData.ubicacion && (
          <LeafletMap
            center={userLocation ? [userLocation.lat, userLocation.lng] : [serviceData.ubicacion.lat, serviceData.ubicacion.lng]}
            zoom={15}
            markers={[
              {
                position: [userLocation.lat, userLocation.lng],
                popup: "Mi ubicación",
                iconColor: "blue"
              },
              {
                position: [serviceData.ubicacion.lat, serviceData.ubicacion.lng],
                popup: `Cliente: ${serviceData.cliente.nombre}`,
                iconColor: "red"
              }
            ]}
            route={routeCoordinates.length > 0 ? routeCoordinates : undefined}
          />
        )}
        
        {/* Overlay con información de navegación */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FaCompass className="text-primary" />
                <span className="font-semibold text-sm sm:text-base">Navegación</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                serviceData.estado === 'asignado' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {serviceData.estado === 'asignado' ? 'Asignado' : 'En Camino'}
              </span>
            </div>
            
            {distanceToClient && (
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-primary">
                  {distanceToClient.toFixed(1)} km
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {timeToClient} minutos estimados
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Indicador de proximidad */}
        {puedeFinalizarPorDistancia && (
          <div className="absolute bottom-24 left-4 right-4 z-10">
            <div className="bg-green-500 text-white rounded-xl shadow-lg p-3 sm:p-4 animate-pulse">
              <div className="flex items-center justify-center gap-2">
                <FaMapMarkerAlt />
                <span className="font-semibold text-sm sm:text-base">
                  ¡Estás cerca del cliente!
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel de acciones fijo en la parte inferior */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
          {/* Llamar */}
          <a
            href={`tel:${serviceData.cliente.telefono}`}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 sm:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <FaPhoneAlt />
            <span className="hidden sm:inline">Llamar</span>
          </a>

          {/* Acción principal según el estado */}
          {serviceData.estado === 'asignado' && (
            <button
              onClick={() => actualizarEstado('en_camino')}
              className="flex-2 bg-primary hover:bg-primary-hover text-white py-2 sm:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <FaCar />
              Iniciar Viaje
            </button>
          )}

          {serviceData.estado === 'en_camino' && (
            <button
              onClick={() => actualizarEstado('finalizado')}
              disabled={!puedeFinalizarPorDistancia}
              className={`flex-2 py-2 sm:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm ${
                puedeFinalizarPorDistancia
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FaCheck />
              {puedeFinalizarPorDistancia ? 'Finalizar' : 'Acércate más'}
            </button>
          )}
        </div>

        {/* Información del cliente */}
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div>
              <p className="font-semibold">{serviceData.cliente.nombre}</p>
              <p className="text-gray-600 dark:text-gray-400">
                {serviceData.detallesVehiculo.marca} {serviceData.detallesVehiculo.modelo}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary text-lg sm:text-xl">
                ${serviceData.precio.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsistenteActiveService;
