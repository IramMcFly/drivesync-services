"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaPhoneAlt, 
  FaExclamationTriangle, 
  FaTimes, 
  FaCar,
  FaMapMarkerAlt,
  FaClock,
  FaRoute,
  FaUser
} from "react-icons/fa";

const MapComponent = dynamic(() => import("@/components/maps/LeafletMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
});

function haversineDistance(coord1, coord2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // km

  const dLat = toRad(coord2[0] - coord1[0]);
  const dLon = toRad(coord2[1] - coord1[1]);
  const lat1 = toRad(coord1[0]);
  const lat2 = toRad(coord2[0]);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function ServiceTracking() {
  const [serviceData, setServiceData] = useState(null);
  const [assistantLocation, setAssistantLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [distancia, setDistancia] = useState(null);
  const [tiempo, setTiempo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPanicModal, setShowPanicModal] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const serviceId = searchParams.get('serviceId');

  // Función para obtener datos del servicio
  const fetchServiceData = async () => {
    try {
      const response = await fetch(`/api/servicerequests?id=${serviceId}`);
      if (response.ok) {
        const data = await response.json();
        setServiceData(data);
        
        // Si el servicio está finalizado o cancelado, redirigir
        if (data.estado === 'finalizado' || data.estado === 'cancelado') {
          router.push(`/main/service-status/${serviceId}`);
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

  // Simular ubicación del asistente (en producción esto vendría de la API)
  const getAssistantLocation = () => {
    if (!serviceData?.ubicacion) return;
    
    // Simular movimiento del asistente hacia el cliente
    const clientLat = serviceData.ubicacion.lat;
    const clientLng = serviceData.ubicacion.lng;
    
    // Generar una ubicación aleatoria cerca del cliente
    const offsetLat = (Math.random() - 0.5) * 0.02; // ~1km radius
    const offsetLng = (Math.random() - 0.5) * 0.02;
    
    setAssistantLocation({
      lat: clientLat + offsetLat,
      lng: clientLng + offsetLng
    });
  };

  // Obtener ruta usando OpenRouteService
  const getRoute = async (start, end) => {
    try {
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${process.env.NEXT_PUBLIC_OPENROUTE_API_KEY}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setRoute(data.features[0]);
        
        // Calcular distancia y tiempo de la ruta real
        const routeDistance = data.features[0].properties.segments[0].distance / 1000; // km
        const routeTime = Math.round(data.features[0].properties.segments[0].duration / 60); // minutos
        
        setDistancia(routeDistance.toFixed(2));
        setTiempo(routeTime);
      }
    } catch (error) {
      console.error('Error obteniendo ruta:', error);
      // Fallback al cálculo directo
      if (start && end) {
        const km = haversineDistance([start.lat, start.lng], [end.lat, end.lng]);
        setDistancia(km.toFixed(2));
        
        const velocidadPromedio = 40;
        const tiempoEnHoras = km / velocidadPromedio;
        const minutos = Math.round(tiempoEnHoras * 60);
        setTiempo(minutos);
      }
    }
  };

  // Polling para actualizar datos
  useEffect(() => {
    if (!serviceId) {
      router.push('/main/servicios-express');
      return;
    }

    fetchServiceData();
    
    const interval = setInterval(() => {
      fetchServiceData();
      getAssistantLocation(); // Simular movimiento del asistente
    }, 5000);

    return () => clearInterval(interval);
  }, [serviceId]);

  // Calcular ruta cuando tengamos ambas ubicaciones
  useEffect(() => {
    if (serviceData?.ubicacion && assistantLocation) {
      getRoute(assistantLocation, serviceData.ubicacion);
    }
  }, [serviceData, assistantLocation]);

  // Obtener ubicación inicial del asistente
  useEffect(() => {
    if (serviceData?.ubicacion && !assistantLocation) {
      getAssistantLocation();
    }
  }, [serviceData]);

  const handlePanic = () => {
    setShowPanicModal(true);
  };

  const confirmPanic = () => {
    setShowPanicModal(false);
    // Enviar alerta de emergencia (implementar según necesidades)
    window.location.href = "tel:911";
  };

  const handleCallAssistant = () => {
    if (serviceData?.asistente?.telefono) {
      window.location.href = `tel:${serviceData.asistente.telefono}`;
    }
  };

  const handleCancelService = () => {
    if (confirm('¿Estás seguro de que quieres cancelar este servicio?')) {
      fetch(`/api/servicerequests`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: serviceId,
          estado: 'cancelado'
        })
      }).then(() => {
        router.push('/main/servicios-express');
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando seguimiento...</p>
        </div>
      </div>
    );
  }

  if (error || !serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Servicio no encontrado'}</p>
          <button 
            onClick={() => router.push('/main/servicios-express')}
            className="bg-primary text-white px-4 py-2 rounded-lg"
          >
            Volver a servicios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <AnimatePresence>
        {showPanicModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm w-full"
            >
              <motion.div
                animate={{ rotate: [0, 20, -20, 20, -20, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-4xl mb-4"
              >
                <FaExclamationTriangle className="text-red-500 mx-auto" />
              </motion.div>
              <h2 className="text-xl font-bold mb-2">Emergencia</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Se ha enviado tu ubicación a tus contactos de emergencia.
              </p>
              <div className="space-y-3">
                <button
                  onClick={confirmPanic}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md w-full"
                >
                  Llamar a emergencias
                </button>
                <button
                  onClick={() => setShowPanicModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md w-full"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaCar className="text-primary animate-pulse" />
              <h1 className="text-lg sm:text-xl font-semibold">Asistente en camino</h1>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Servicio: {serviceData.servicio?.nombre}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Información de tiempo y distancia */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-lg">
            <FaRoute className="text-primary mx-auto mb-2" size={24} />
            <p className="text-sm text-gray-600 dark:text-gray-400">Distancia</p>
            <p className="text-xl font-bold text-primary">
              {distancia ? `${distancia} km` : 'Calculando...'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-lg">
            <FaClock className="text-green-500 mx-auto mb-2" size={24} />
            <p className="text-sm text-gray-600 dark:text-gray-400">Tiempo estimado</p>
            <p className="text-xl font-bold text-green-500">
              {tiempo ? `${tiempo} min` : 'Calculando...'}
            </p>
          </div>
        </div>

        {/* Mapa con ruta */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="h-64 sm:h-80 lg:h-96">
            {serviceData.ubicacion && assistantLocation && (
              <MapComponent
                center={[serviceData.ubicacion.lat, serviceData.ubicacion.lng]}
                zoom={13}
                markers={[
                  {
                    position: [serviceData.ubicacion.lat, serviceData.ubicacion.lng],
                    popup: "Tu ubicación"
                  },
                  {
                    position: [assistantLocation.lat, assistantLocation.lng],
                    popup: "Asistente"
                  }
                ]}
                route={route}
              />
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-700">
            <button
              onClick={handleCancelService}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FaTimes size={16} />
              Cancelar
            </button>
            <button
              onClick={handleCallAssistant}
              className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              disabled={!serviceData.asistente?.telefono}
            >
              <FaPhoneAlt size={16} />
              Llamar
            </button>
          </div>

          {/* Botón de pánico */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={handlePanic}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors"
            >
              <FaExclamationTriangle size={18} />
              Botón de emergencia
            </button>
          </div>
        </div>

        {/* Información del asistente */}
        {serviceData.asistente && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaUser className="text-primary" />
              Tu asistente
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Nombre:</span>
                <span className="font-medium">{serviceData.asistente.nombre}</span>
              </div>
              
              {serviceData.asistente.telefono && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Teléfono:</span>
                  <span className="font-medium">{serviceData.asistente.telefono}</span>
                </div>
              )}
              
              {serviceData.asistente.vehiculo && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Vehículo:</span>
                  <span className="font-medium">{serviceData.asistente.vehiculo}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detalles del servicio */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Detalles del servicio</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Servicio:</span>
              <span className="font-medium">{serviceData.servicio?.nombre}</span>
            </div>
            
            {serviceData.subtipo && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                <span className="font-medium">{serviceData.subtipo}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Precio:</span>
              <span className="font-bold text-lg text-primary">
                ${serviceData.precio?.toFixed(2)} MXN
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
