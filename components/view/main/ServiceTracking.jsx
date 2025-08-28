"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import Modal from "@/components/ui/Modal";
import { useModal } from "@/hooks/useModal";

const MapComponent = dynamic(() => import("@/components/maps/LeafletMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
});

function haversineDistance(coord1, coord2) {
  try {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // km

    // Validar coordenadas
    if (!coord1 || !coord2 || coord1.length !== 2 || coord2.length !== 2) {
      console.error('❌ haversineDistance: Coordenadas inválidas');
      return 0;
    }

    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;

    // Verificar que son números válidos
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
      console.error('❌ haversineDistance: Coordenadas no son números');
      return 0;
    }

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const rLat1 = toRad(lat1);
    const rLat2 = toRad(lat2);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(rLat1) * Math.cos(rLat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return distance > 0 ? distance : 0;
  } catch (error) {
    console.error('❌ haversineDistance: Error en cálculo:', error);
    return 0;
  }
}

export default function ServiceTracking({ serviceId }) {
  const [serviceData, setServiceData] = useState(null);
  const [assistantLocation, setAssistantLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [distancia, setDistancia] = useState(null);
  const [tiempo, setTiempo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);

  const router = useRouter();
  const { data: session } = useSession();
  const { modalState, showConfirm, showError } = useModal();

  console.log('🎯 ServiceTracking: Received serviceId prop:', serviceId);

  // Función auxiliar para formatear la información del vehículo
  const formatVehicleInfo = (vehiculo) => {
    if (!vehiculo || typeof vehiculo !== 'object') {
      return vehiculo || 'No especificado';
    }
    
    const parts = [];
    if (vehiculo.marca) parts.push(vehiculo.marca);
    if (vehiculo.modelo) parts.push(vehiculo.modelo);
    if (vehiculo.año) parts.push(vehiculo.año);
    if (vehiculo.color) parts.push(`(${vehiculo.color})`);
    
    return parts.length > 0 ? parts.join(' ') : 'No especificado';
  };

  // Función para obtener datos del servicio
  const fetchServiceData = async () => {
    console.log('🔍 ServiceTracking: Fetching data for serviceId:', serviceId);
    
    try {
      const response = await fetch(`/api/servicerequests?id=${serviceId}`);
      console.log('📡 ServiceTracking: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ ServiceTracking: Data received:', { 
          estado: data.estado, 
          id: data._id,
          hasAsistente: !!data.asistente 
        });
        
        setServiceData(data);
        
        // Debug: Log vehicle data structure
        if (data.asistente?.vehiculo) {
          console.log('🚗 ServiceTracking: Vehicle data structure:', data.asistente.vehiculo);
          console.log('🔍 ServiceTracking: Vehicle type:', typeof data.asistente.vehiculo);
        }
        
        // Si el servicio está finalizado o cancelado, redirigir
        if (data.estado === 'finalizado' || data.estado === 'cancelado') {
          console.log('🔄 ServiceTracking: Redirecting to service-status due to state:', data.estado);
          
          // Limpiar datos antes del redirect para evitar efectos indeseados
          setServiceData(null);
          setAssistantLocation(null);
          setRoute(null);
          setDistancia(null);
          setTiempo(null);
          
          router.push(`/main/service-status/${serviceId}`);
          return;
        }
        
        setLoading(false);
      } else {
        console.error('❌ ServiceTracking: API error:', response.status);
        setError('No se pudo cargar la información del servicio');
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ ServiceTracking: Fetch error:', err);
      setError('Error de conexión');
      setLoading(false);
    }
  };

  // Obtener ubicación real del asistente desde la base de datos
  const getAssistantLocation = async () => {
    // Validar que el servicio siga activo antes de obtener ubicación
    if (!serviceData || ['cancelado', 'finalizado', 'completado'].includes(serviceData.estado)) {
      console.log('⚠️ ServiceTracking: Servicio no activo, cancelando getAssistantLocation');
      return;
    }

    if (!serviceData?.asistente?._id) {
      console.log('❌ ServiceTracking: No hay asistente asignado');
      return;
    }
    
    try {
      console.log('📍 ServiceTracking: Datos del asistente:', {
        asistenteId: serviceData.asistente._id,
        asistenteUser: serviceData.asistente.user,
        asistenteCompleto: serviceData.asistente
      });
      
      // Usar la nueva API específica para ubicación
      const apiUrl = `/api/asistente/ubicacion?asistenteId=${serviceData.asistente._id}`;
      
      console.log('📡 ServiceTracking: Consultando API de ubicación:', apiUrl);
      
      // Obtener la ubicación actual del asistente desde la API específica
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 ServiceTracking: Respuesta de API de ubicación:', JSON.stringify(data, null, 2));
        
        if (data.asistente?.ubicacionActual) {
          console.log('✅ ServiceTracking: Ubicación del asistente obtenida:', data.asistente.ubicacionActual);
          setAssistantLocation({
            lat: data.asistente.ubicacionActual.lat,
            lng: data.asistente.ubicacionActual.lng
          });
          setLastLocationUpdate(new Date(data.asistente.ultimaActualizacion || Date.now()));
        } else {
          console.log('⚠️ ServiceTracking: Asistente sin ubicación actual registrada');
          console.log('🔍 ServiceTracking: Estructura del asistente:', data.asistente);
          // No mostrar ubicación falsa - el asistente debe actualizar su ubicación
          setAssistantLocation(null);
          setDistancia(null);
          setTiempo(null);
          setLastLocationUpdate(null);
        }
      } else {
        console.error('❌ ServiceTracking: Error obteniendo ubicación del asistente:', response.status);
        const errorText = await response.text();
        console.error('❌ ServiceTracking: Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ ServiceTracking: Error de conexión al obtener ubicación del asistente:', error);
    }
  };

  // Calcular ruta usando solo cálculo directo (sin API externa para evitar errores)
  const getRoute = async (start, end) => {
    console.log('🗺️ ServiceTracking: Calculando ruta directa de:', start, 'a:', end);
    
    // Verificar que el servicio siga activo antes de hacer cualquier llamada
    if (!serviceData || ['cancelado', 'finalizado', 'completado'].includes(serviceData.estado)) {
      console.log('⚠️ ServiceTracking: Servicio no activo, cancelando getRoute');
      return;
    }
    
    // Verificar que tenemos las coordenadas necesarias
    if (!start?.lat || !start?.lng || !end?.lat || !end?.lng) {
      console.error('❌ ServiceTracking: Coordenadas incompletas');
      return;
    }

    // Validar coordenadas
    if (isNaN(start.lat) || isNaN(start.lng) || isNaN(end.lat) || isNaN(end.lng)) {
      console.error('❌ ServiceTracking: Coordenadas inválidas');
      return;
    }

    try {
      // Usar solo cálculo directo para evitar errores de fetch
      const km = haversineDistance([start.lat, start.lng], [end.lat, end.lng]);
      setDistancia(km.toFixed(2));
      
      const velocidadPromedio = 40; // km/h promedio en ciudad
      const tiempoEnHoras = km / velocidadPromedio;
      const minutos = Math.round(tiempoEnHoras * 60);
      setTiempo(minutos);
      
      console.log(`📊 ServiceTracking: Cálculo directo - ${km.toFixed(2)}km, ${minutos}min`);
      
      // Crear coordenadas de ruta simple para mostrar en el mapa
      const routeFeature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[start.lng, start.lat], [end.lng, end.lat]]
        }
      };
      setRoute(routeFeature);
      
    } catch (calcError) {
      console.error('❌ ServiceTracking: Error en cálculo directo:', calcError);
    }
  };

  // Polling para actualizar datos
  useEffect(() => {
    console.log('🚀 ServiceTracking: Component mounted with serviceId:', serviceId);
    
    if (!serviceId) {
      console.log('❌ ServiceTracking: No serviceId, redirecting to servicios-express');
      router.push('/main/servicios-express');
      return;
    }

    console.log('⏳ ServiceTracking: Starting data fetch and polling');
    fetchServiceData();
    
    const interval = setInterval(() => {
      console.log('🔄 ServiceTracking: Polling update');
      
      // Solo hacer polling si el servicio sigue activo
      if (!serviceData || ['cancelado', 'finalizado', 'completado'].includes(serviceData.estado)) {
        console.log('⚠️ ServiceTracking: Servicio no activo, deteniendo polling');
        clearInterval(interval);
        return;
      }
      
      fetchServiceData();
      getAssistantLocation(); // Obtener ubicación real del asistente
    }, 3000); // Cada 3 segundos para tracking en tiempo real

    return () => {
      console.log('🛑 ServiceTracking: Cleanup interval');
      clearInterval(interval);
    };
  }, [serviceId, serviceData]);

  // Calcular ruta cuando tengamos ambas ubicaciones
  useEffect(() => {
    // Validar que el servicio siga activo antes de calcular ruta
    if (!serviceData || ['cancelado', 'finalizado', 'completado'].includes(serviceData.estado)) {
      console.log('⚠️ ServiceTracking: Servicio no activo, evitando cálculo de ruta');
      return;
    }

    // Verificar que tenemos ubicaciones válidas
    if (serviceData?.ubicacion && assistantLocation) {
      // Validar que las coordenadas son números válidos
      const clientLat = serviceData.ubicacion.lat;
      const clientLng = serviceData.ubicacion.lng;
      const assistantLat = assistantLocation.lat;
      const assistantLng = assistantLocation.lng;
      
      if (!isNaN(clientLat) && !isNaN(clientLng) && !isNaN(assistantLat) && !isNaN(assistantLng) &&
          clientLat !== 0 && clientLng !== 0 && assistantLat !== 0 && assistantLng !== 0) {
        
        // Verificar que no son las mismas coordenadas
        const distance = Math.abs(clientLat - assistantLat) + Math.abs(clientLng - assistantLng);
        if (distance > 0.0001) { // Diferencia mínima para evitar cálculos innecesarios
          console.log('🗺️ ServiceTracking: Calculando ruta con coordenadas válidas');
          getRoute(assistantLocation, serviceData.ubicacion);
        } else {
          console.log('📍 ServiceTracking: Ubicaciones muy cercanas, omitiendo cálculo de ruta');
          setDistancia('0.1');
          setTiempo(1);
        }
      } else {
        console.warn('⚠️ ServiceTracking: Coordenadas inválidas detectadas');
      }
    }
  }, [serviceData?.ubicacion, assistantLocation]);

  // Obtener ubicación inicial del asistente
  useEffect(() => {
    // Validar que el servicio siga activo antes de obtener ubicación del asistente
    if (!serviceData || ['cancelado', 'finalizado', 'completado'].includes(serviceData.estado)) {
      console.log('⚠️ ServiceTracking: Servicio no activo, evitando obtener ubicación del asistente');
      return;
    }

    if (serviceData?.ubicacion && !assistantLocation) {
      getAssistantLocation();
    }
  }, [serviceData]);

  // Efecto de limpieza cuando el servicio cambia a estado inactivo
  useEffect(() => {
    if (serviceData && ['cancelado', 'finalizado', 'completado'].includes(serviceData.estado)) {
      console.log('🧹 ServiceTracking: Limpiando datos debido a estado inactivo:', serviceData.estado);
      
      // Limpiar todos los datos relacionados con tracking
      setAssistantLocation(null);
      setRoute(null);
      setDistancia(null);
      setTiempo(null);
      setError(null);
    }
  }, [serviceData?.estado]);

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
    showConfirm(
      '¿Estás seguro de que quieres cancelar este servicio? Esta acción no se puede deshacer.',
      async () => {
        try {
          const response = await fetch(`/api/servicerequests`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              _id: serviceId,
              estado: 'cancelado'
            })
          });

          if (response.ok) {
            router.push('/main/servicios-express');
          } else {
            showError('No se pudo cancelar el servicio. Inténtalo de nuevo.');
          }
        } catch (error) {
          showError('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
        }
      },
      'Cancelar Servicio'
    );
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
              {assistantLocation && distancia ? `${distancia} km` : 'Esperando ubicación...'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-lg">
            <FaClock className="text-green-500 mx-auto mb-2" size={24} />
            <p className="text-sm text-gray-600 dark:text-gray-400">Tiempo estimado</p>
            <p className="text-xl font-bold text-green-500">
              {assistantLocation && tiempo ? `${tiempo} min` : 'Esperando ubicación...'}
            </p>
          </div>
        </div>

        {/* Mapa con ruta */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="h-64 sm:h-80 lg:h-96">
            {serviceData.ubicacion && (
              <MapComponent
                center={[serviceData.ubicacion.lat, serviceData.ubicacion.lng]}
                zoom={assistantLocation ? 13 : 15}
                markers={[
                  {
                    position: [serviceData.ubicacion.lat, serviceData.ubicacion.lng],
                    popup: "Tu ubicación"
                  },
                  ...(assistantLocation ? [{
                    position: [assistantLocation.lat, assistantLocation.lng],
                    popup: "Asistente"
                  }] : [])
                ]}
                route={assistantLocation ? route : null}
              />
            )}
          </div>
          
          {/* Mensaje de estado cuando no hay ubicación del asistente */}
          {!assistantLocation && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400">
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-blue-500 mr-3 animate-pulse" />
                <div>
                  <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                    Esperando ubicación del asistente
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                    El asistente debe activar el seguimiento desde su aplicación. El mapa se actualizará automáticamente.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Mensaje cuando hay ubicación actualizada */}
          {assistantLocation && lastLocationUpdate && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-green-500 mr-2" />
                  <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                    Ubicación en tiempo real activa
                  </span>
                </div>
                <span className="text-green-600 dark:text-green-400 text-xs">
                  Actualizado: {lastLocationUpdate.toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}

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
                  <span className="font-medium">
                    {formatVehicleInfo(serviceData.asistente.vehiculo)}
                  </span>
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
      
      {/* Modal Component */}
      <Modal {...modalState} />
    </div>
  );
}
