"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "../../ui";
import { useModal } from "../../../hooks/useModal";
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
import { motion, AnimatePresence } from "framer-motion";
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
  const { modalState, showSuccess, showError, hideModal } = useModal();
  const router = useRouter();
  const [userLocation, setUserLocation] = useState(null);
  const [distanceToClient, setDistanceToClient] = useState(null);
  const [timeToClient, setTimeToClient] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPanicModal, setShowPanicModal] = useState(false);

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
      const response = await fetch('/api/servicerequests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: servicio._id,
          estado: nuevoEstado,
          comentario: `Estado actualizado por asistente a: ${nuevoEstado}`
        })
      });

      if (response.ok) {
        const updatedService = await response.json();
        onServiceUpdate(updatedService);
        
        // Mensajes específicos según el estado
        switch (nuevoEstado) {
          case 'cancelado':
            showSuccess('Servicio cancelado correctamente');
            break;
          case 'en_camino':
            showSuccess('Has iniciado el viaje hacia el cliente');
            break;
          case 'finalizado':
            showSuccess('Servicio completado exitosamente');
            break;
          default:
            showSuccess(`Servicio actualizado a ${nuevoEstado}`);
        }
        
        if (nuevoEstado === 'finalizado' || nuevoEstado === 'cancelado') {
          setTimeout(() => onBack(), 1500); // Dar tiempo para leer el mensaje
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        
        // Mensajes específicos de error
        if (errorData.error && errorData.error.includes('cancelado')) {
          showError(
            'Este servicio ya fue cancelado por el cliente',
            'Servicio cancelado',
            () => {
              hideModal();
              onBack();
            }
          );
        } else if (errorData.error && errorData.error.includes('Transición inválida')) {
          showError(`No se puede cambiar el estado a ${nuevoEstado}. ${errorData.error}`);
        } else {
          showError(errorData.error || 'Error al actualizar el servicio');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error de conexión. Verifica tu internet e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Funciones para el botón de pánico
  const handlePanic = () => {
    setShowPanicModal(true);
  };

  const confirmPanic = () => {
    setShowPanicModal(false);
    // Enviar alerta de emergencia y llamar a emergencias
    window.location.href = "tel:911";
  };

  // Función para cancelar y devolver a pendiente
  const cancelarYDevolver = async () => {
    if (confirm('¿Deseas devolver este servicio a la lista de pendientes?')) {
      setLoading(true);
      try {
        const response = await fetch('/api/servicerequests', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            _id: servicio._id,
            estado: 'pendiente',
            asistente: null, // Remover asistente asignado
            comentario: 'Servicio devuelto a pendientes por el asistente'
          })
        });

        if (response.ok) {
          showSuccess(
            'Servicio devuelto a la lista de pendientes',
            'Operación exitosa',
            () => {
              hideModal();
              onServiceUpdate();
              onBack();
            }
          );
        } else {
          const errorData = await response.json();
          if (errorData.error && errorData.error.includes('cancelado')) {
            showError(
              'Este servicio ya fue cancelado por el cliente',
              'Servicio cancelado',
              () => {
                hideModal();
                onBack();
              }
            );
          } else {
            showError(errorData.error || 'Error al devolver el servicio');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión');
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
      <div className="bg-gray-800 shadow-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              <FaArrowLeft />
              <span className="text-sm sm:text-base">Volver</span>
            </button>
            <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusInfo.color}`}>
              {statusInfo.text}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-20">
        {/* Información principal del servicio */}
        <div className="bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold mb-1">{servicio.servicio.nombre}</h1>
              {servicio.subtipo && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{servicio.subtipo}</p>
              )}
              <p className="text-sm text-gray-500 mb-4">{statusInfo.description}</p>
            </div>
            
            <div className="text-center sm:text-right">
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                ${servicio.precio.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">MXN</p>
            </div>
          </div>
        </div>

        {/* Cliente y Vehículo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <FaUser className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">{servicio.cliente.nombre}</h3>
                <p className="text-sm text-gray-500">{servicio.cliente.telefono}</p>
              </div>
            </div>
            <a
              href={`tel:${servicio.cliente.telefono}`}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <FaPhoneAlt />
              Llamar Cliente
            </a>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <FaCar className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold">{servicio.detallesVehiculo.tipoVehiculo}</h3>
                <p className="text-sm text-gray-500">
                  {servicio.detallesVehiculo.marca} {servicio.detallesVehiculo.modelo} ({servicio.detallesVehiculo.año})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas de distancia */}
        {userLocation && servicio.ubicacion && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <FaLocationArrow className="text-primary text-xl mx-auto mb-2" />
              <p className="text-xs text-gray-600 dark:text-gray-400">Distancia</p>
              <p className="font-bold text-sm">
                {distanceToClient ? `${distanceToClient.toFixed(1)} km` : '---'}
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <FaClock className="text-blue-500 text-xl mx-auto mb-2" />
              <p className="text-xs text-gray-600 dark:text-gray-400">Tiempo</p>
              <p className="font-bold text-sm">
                {timeToClient ? `${timeToClient} min` : '---'}
              </p>
            </div>

            <div className={`rounded-xl p-3 shadow-sm border text-center ${
              puedeFinalizarPorDistancia 
                ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700' 
                : 'bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}>
              <FaMapMarkerAlt className={`text-xl mx-auto mb-2 ${
                puedeFinalizarPorDistancia ? 'text-green-600' : 'text-gray-400'
              }`} />
              <p className="text-xs text-gray-600 dark:text-gray-400">Proximidad</p>
              <p className={`font-bold text-sm ${
                puedeFinalizarPorDistancia ? 'text-green-600' : 'text-gray-500'
              }`}>
                {puedeFinalizarPorDistancia ? 'Cerca' : 'Lejos'}
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <FaUser className="text-orange-500 text-xl mx-auto mb-2" />
              <p className="text-xs text-gray-600 dark:text-gray-400">Estado</p>
              <p className="font-bold text-sm capitalize">
                {servicio.estado.replace('_', ' ')}
              </p>
            </div>
          </div>
        )}

        {/* Mapa */}
        {userLocation && servicio.ubicacion && (
          <div className="bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <FaRoute className="text-primary" />
                Ubicaciones
              </h3>
              <button
                onClick={() => router.push(`/asistente/service-active/${servicio._id}`)}
                className="text-sm text-primary hover:text-primary-hover font-medium"
              >
                Vista completa →
              </button>
            </div>
            <div className="h-48 sm:h-56 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
              <LeafletMap
                center={[
                  (userLocation.lat + servicio.ubicacion.lat) / 2,
                  (userLocation.lng + servicio.ubicacion.lng) / 2
                ]}
                zoom={13}
                markers={[
                  {
                    position: [userLocation.lat, userLocation.lng],
                    popup: "Mi ubicación",
                    iconColor: "blue"
                  },
                  {
                    position: [servicio.ubicacion.lat, servicio.ubicacion.lng],
                    popup: `Cliente: ${servicio.cliente.nombre}`,
                    iconColor: "red"
                  }
                ]}
              />
            </div>
          </div>
        )}

        {/* Mensaje de proximidad */}
        {!puedeFinalizarPorDistancia && servicio.estado === 'en_camino' && distanceToClient && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                  Acércate para finalizar
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Distancia actual: {(distanceToClient * 1000).toFixed(0)} metros (necesitas &lt; 100m)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel de acciones fijo */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="space-y-3">
          {/* Acción principal */}
          {servicio.estado === 'asignado' && (
            <button
              onClick={() => actualizarEstado('en_camino')}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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

          {(servicio.estado === 'asignado' || servicio.estado === 'en_camino') && (
            <button
              onClick={() => router.push(`/asistente/active-service/${servicio._id}`)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <FaMapMarkerAlt />
              Navegación Completa
            </button>
          )}

          {servicio.estado === 'en_camino' && (
            <button
              onClick={() => actualizarEstado('finalizado')}
              disabled={loading || !puedeFinalizarPorDistancia}
              className={`w-full py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                puedeFinalizarPorDistancia
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <FaCheck />
                  {puedeFinalizarPorDistancia ? 'Finalizar Servicio' : 'Acércate más para finalizar'}
                </>
              )}
            </button>
          )}

          {/* Botón de pánico - siempre visible durante un servicio activo */}
          {['asignado', 'en_camino'].includes(servicio.estado) && (
            <button
              onClick={handlePanic}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg border border-red-500"
            >
              <FaExclamationTriangle size={18} />
              BOTÓN DE EMERGENCIA
            </button>
          )}

          {/* Acciones secundarias */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={cancelarYDevolver}
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <FaStop />
              Devolver
            </button>
            
            <button
              onClick={() => actualizarEstado('cancelado')}
              disabled={loading}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <FaTimes />
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de pánico */}
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
              className="bg-gray-800 p-6 rounded-xl shadow-2xl text-center max-w-sm w-full"
            >
              <motion.div
                animate={{ rotate: [0, 20, -20, 20, -20, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-4xl mb-4"
              >
                <FaExclamationTriangle className="text-red-500 mx-auto" />
              </motion.div>
              <h2 className="text-xl font-bold mb-2 text-white">Emergencia</h2>
              <p className="text-gray-300 mb-6">
                ¿Necesitas ayuda de emergencia? Se enviará tu ubicación actual y se contactarán los servicios de emergencia.
              </p>
              <div className="space-y-3">
                <button
                  onClick={confirmPanic}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg w-full transition-colors"
                >
                  SÍ, LLAMAR A EMERGENCIAS
                </button>
                <button
                  onClick={() => setShowPanicModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg w-full transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
};

export default AsistenteServiceManager;
