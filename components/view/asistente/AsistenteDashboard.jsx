"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AsistenteServiceInfo from "./AsistenteServiceInfo";
import { Modal } from "../../ui";
import { useModal } from "../../../hooks/useModal";
import { 
  FaCar, 
  FaUser, 
  FaMapMarkerAlt, 
  FaClock, 
  FaPhoneAlt,
  FaCheck,
  FaRoute,
  FaTimes,
  FaWifi,
  FaPowerOff,
  FaPlay,
  FaStop,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaTools,
  FaSignOutAlt,
  FaBell
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ServiceNotification from "./ServiceNotification";

const AsistenteDashboard = () => {
  const { modalState, showSuccess, showError, hideModal } = useModal();
  const { data: session } = useSession();
  const router = useRouter();
  const [asistenteData, setAsistenteData] = useState(null);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [serviciosAsignados, setServiciosAsignados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [newServiceNotification, setNewServiceNotification] = useState(null);
  const [previousServicesCount, setPreviousServicesCount] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceInfo, setShowServiceInfo] = useState(false);
  const [showPanicModal, setShowPanicModal] = useState(false);

  // Debug inicial
  useEffect(() => {
    console.log('🚀 AsistenteDashboard montado', {
      sessionUserId: session?.user?.id,
      showServiceInfo,
      hasSelectedService: !!selectedService
    });
  }, [session?.user?.id, showServiceInfo, selectedService]);

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          // Actualizar ubicación en el servidor si está online
          if (isOnline && session?.user?.id) {
            updateLocation(location);
          }
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
        }
      );
    }
  }, [isOnline, session]);

  // Función para actualizar ubicación en el servidor
  const updateLocation = async (location) => {
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

  // Función para obtener datos del asistente y servicios
  const fetchData = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/asistente?userId=${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setAsistenteData(data.asistente);
        
        // Separar servicios disponibles y asignados
        const disponibles = data.servicios.filter(s => s.estado === 'pendiente');
        const asignados = data.servicios.filter(s => ['asignado', 'en_camino'].includes(s.estado));
        
        // Detectar nuevos servicios para notificación
        if (isOnline && disponibles.length > previousServicesCount && previousServicesCount > 0) {
          const nuevoServicio = disponibles[0]; // El más reciente
          setNewServiceNotification(nuevoServicio);
          
          // Reproducir sonido de notificación si está disponible
          try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('No se pudo reproducir sonido'));
          } catch (e) {
            console.log('Audio no disponible');
          }
        }
        
        setPreviousServicesCount(disponibles.length);
        setServiciosDisponibles(disponibles);
        setServiciosAsignados(asignados);
        setIsOnline(data.asistente.activo);
        setLastUpdate(new Date());
        setError(null);
      } else {
        setError('Error al cargar datos del asistente');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Polling cada 20 segundos
  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [session]);

  // Función para cambiar estado activo/inactivo
  const toggleOnlineStatus = async () => {
    try {
      const response = await fetch('/api/asistente', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          action: 'toggle_active',
          ubicacion: userLocation
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsOnline(data.activo);
        if (data.activo && userLocation) {
          updateLocation(userLocation);
        }
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
    }
  };

  // Función para aceptar un servicio desde la notificación
  const aceptarServicioNotificacion = async () => {
    if (newServiceNotification) {
      await aceptarServicio(newServiceNotification._id);
      setNewServiceNotification(null);
    }
  };

  // Función para descartar notificación
  const descartarNotificacion = () => {
    setNewServiceNotification(null);
  };

  // Función para aceptar un servicio
  const aceptarServicio = async (serviceId) => {
    console.log('🔄 Iniciando aceptación de servicio:', serviceId);
    
    try {
      const response = await fetch('/api/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          serviceId
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Servicio aceptado, datos recibidos:', data);
        
        // Navegar inmediatamente con el servicio devuelto por la API
        if (data.servicio) {
          console.log('🧭 Navegando a ServiceInfo con servicio:', data.servicio._id);
          setSelectedService(data.servicio);
          setShowServiceInfo(true);
          
          // Asegurar que se oculte cualquier notificación
          setNewServiceNotification(null);
          
          console.log('✅ Estado actualizado - showServiceInfo: true');
        } else {
          console.error('❌ No se recibió el servicio en la respuesta');
          showError('No se pudo obtener la información del servicio');
        }
        
        // Actualizar datos después de la navegación (sin await para no bloquear)
        console.log('🔄 Actualizando datos en segundo plano...');
        fetchData().catch(console.error);
      } else {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        showError(errorData.error || 'Error al aceptar servicio');
      }
    } catch (error) {
      console.error('❌ Error aceptando servicio:', error);
      showError('Error de conexión');
    }
  };

  // Función para actualizar estado de servicio asignado
  const actualizarEstadoServicio = async (serviceId, nuevoEstado) => {
    try {
      const response = await fetch('/api/servicerequests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: serviceId,
          estado: nuevoEstado,
          comentario: `Estado actualizado por asistente a: ${nuevoEstado}`
        })
      });

      if (response.ok) {
        const updatedService = await response.json();
        fetchData(); // Refrescar datos
        
        // Mensajes específicos según el estado
        switch (nuevoEstado) {
          case 'cancelado':
            showSuccess('Servicio cancelado correctamente');
            break;
          case 'en_camino':
            showSuccess('Has iniciado el viaje hacia el cliente');
            break;
          case 'finalizado':
            showSuccess('Servicio marcado como finalizado');
            break;
          default:
            showSuccess(`Servicio actualizado a ${nuevoEstado}`);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        
        // Mensajes específicos de error
        if (errorData.error && errorData.error.includes('cancelado')) {
          showError('Este servicio ya fue cancelado por el cliente');
        } else if (errorData.error && errorData.error.includes('Transición inválida')) {
          showError(`No se puede cambiar el estado a ${nuevoEstado}. ${errorData.error}`);
        } else {
          showError(errorData.error || 'Error al actualizar el servicio');
        }
      }
    } catch (error) {
      console.error('Error actualizando servicio:', error);
      showError('Error de conexión. Verifica tu internet e intenta de nuevo.');
    }
  };

  // Función para manejar un servicio asignado
  const manejarServicio = (servicio) => {
    setSelectedService(servicio);
    setShowServiceInfo(true);
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

  // Función para volver del service info
  const volverDelServiceInfo = () => {
    console.log('🔙 Volviendo del ServiceInfo al Dashboard');
    setShowServiceInfo(false);
    setSelectedService(null);
    // Actualizar datos para refrescar el estado
    fetchData().catch(console.error);
  };

  // Función para ir al tracking de un servicio específico
  const irATracking = (serviceId) => {
    router.push(`/main/service-tracking/${serviceId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-primary text-white px-6 py-2 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!asistenteData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaUser className="text-gray-400 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No eres un asistente</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Esta sección es solo para asistentes registrados.
          </p>
          <button 
            onClick={() => router.push('/main')}
            className="bg-primary text-white px-6 py-2 rounded-lg"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Si estamos mostrando el service info
  if (showServiceInfo && selectedService) {
    console.log('🎯 Renderizando AsistenteServiceInfo con servicio:', selectedService._id);
    return (
      <AsistenteServiceInfo
        servicio={selectedService}
        session={session}
        onServiceUpdate={fetchData}
        onBack={volverDelServiceInfo}
      />
    );
  }

  console.log('🏠 Renderizando Dashboard principal', { 
    showServiceInfo, 
    hasSelectedService: !!selectedService,
    serviciosDisponibles: serviciosDisponibles?.length || 0,
    serviciosAsignados: serviciosAsignados?.length || 0
  });

  return (
    <div className="dashboard-container bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header del Dashboard */}
      <div className="sticky-header bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <h1 className="text-lg sm:text-xl font-bold truncate">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Indicador de última actualización - oculto en móvil muy pequeño */}
              <div className="hidden xs:flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                <FaWifi className="text-green-500" />
                <span className="hidden sm:inline">{lastUpdate.toLocaleTimeString()}</span>
              </div>
              
              {/* Botón de pánico - siempre visible */}
              <button
                onClick={handlePanic}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-xs sm:text-sm shadow-lg"
              >
                <FaExclamationTriangle className="w-3 h-3" />
                <span className="hidden sm:inline">SOS</span>
              </button>

              {/* Botón de estado */}
              <button
                onClick={toggleOnlineStatus}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-colors text-xs sm:text-sm ${
                  isOnline 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isOnline ? <FaStop className="w-3 h-3" /> : <FaPlay className="w-3 h-3" />}
                <span className="hidden sm:inline">{isOnline ? 'Desconectar' : 'Conectar'}</span>
              </button>

              {/* Botón de logout */}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FaSignOutAlt className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-20 sm:pb-8">
        {/* Información del Asistente */}
        <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <FaCar className="text-primary w-4 h-4 sm:w-5 sm:h-5" />
            Mi Información
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 block">Taller</span>
              <span className="font-medium text-sm sm:text-base truncate block">{asistenteData.taller}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 block">Placa</span>
              <span className="font-medium text-sm sm:text-base">{asistenteData.placa}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 block">Vehículo</span>
              <span className="font-medium text-sm sm:text-base truncate block">
                {asistenteData.vehiculo?.marca} {asistenteData.vehiculo?.modelo}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 block">Estado</span>
              <span className={`font-medium text-sm sm:text-base ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>

        {/* Servicios Asignados (Prioritarios) */}
        {serviciosAsignados.length > 0 && (
          <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-primary">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <FaBell className="text-primary animate-pulse w-4 h-4 sm:w-5 sm:h-5" />
              Mis Servicios Activos ({serviciosAsignados.length})
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {serviciosAsignados.map(servicio => (
                <div key={servicio._id} className="bg-primary/10 border border-primary/20 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base sm:text-lg">{servicio.servicio.nombre}</h3>
                      {servicio.subtipo && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{servicio.subtipo}</p>
                      )}
                    </div>
                    <div className="flex sm:flex-col items-start sm:items-end sm:text-right space-x-3 sm:space-x-0">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        servicio.estado === 'asignado' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {servicio.estado === 'asignado' ? 'Asignado' : 'En Camino'}
                      </span>
                      <p className="text-lg sm:text-xl font-bold text-primary">
                        ${servicio.precio.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Cliente:</p>
                      <p className="font-medium text-sm sm:text-base">{servicio.cliente.nombre}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{servicio.cliente.telefono}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Vehículo:</p>
                      <p className="font-medium text-sm sm:text-base">
                        {servicio.detallesVehiculo.tipoVehiculo} - {servicio.detallesVehiculo.marca}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">{servicio.detallesVehiculo.año}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`tel:${servicio.cliente.telefono}`}
                      className="flex items-center gap-1 sm:gap-2 bg-green-500 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      <FaPhoneAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Llamar</span>
                    </a>
                    
                    <button
                      onClick={() => manejarServicio(servicio)}
                      className="flex items-center gap-1 sm:gap-2 bg-primary text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-primary-hover transition-colors"
                    >
                      <FaCar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Gestionar</span>
                      <span className="sm:hidden">Gest.</span>
                    </button>

                    <button
                      onClick={() => router.push(`/asistente/service-active/${servicio._id}`)}
                      className="flex items-center gap-1 sm:gap-2 bg-blue-500 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      <FaRoute className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Navegar</span>
                      <span className="sm:hidden">Nav.</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Servicios Disponibles */}
        <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 space-y-2 sm:space-y-0">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <FaTools className="text-primary w-4 h-4 sm:w-5 sm:h-5" />
              Servicios Disponibles ({serviciosDisponibles.length})
            </h2>
            {!isOnline && (
              <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1 sm:gap-2">
                <FaExclamationTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                Conéctate para ver servicios
              </p>
            )}
          </div>

          {!isOnline ? (
            <div className="text-center py-6 sm:py-8">
              <FaPowerOff className="text-gray-400 text-2xl sm:text-4xl mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-500">Conéctate para recibir solicitudes de servicio</p>
            </div>
          ) : serviciosDisponibles.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <FaClock className="text-gray-400 text-2xl sm:text-4xl mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-500">No hay servicios disponibles en este momento</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-2">
                Se actualizará automáticamente cada 20 segundos
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {serviciosDisponibles.map(servicio => (
                <div key={servicio._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base sm:text-lg">{servicio.servicio.nombre}</h3>
                      {servicio.subtipo && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{servicio.subtipo}</p>
                      )}
                    </div>
                    <div className="flex sm:flex-col items-start sm:items-end sm:text-right space-x-3 sm:space-x-0">
                      <p className="text-lg sm:text-2xl font-bold text-primary">
                        ${servicio.precio.toFixed(2)}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                        <FaClock className="w-3 h-3" />
                        {new Date(servicio.fechaSolicitud).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Cliente:</p>
                      <p className="font-medium text-sm sm:text-base">{servicio.cliente.nombre}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Vehículo:</p>
                      <p className="font-medium text-sm sm:text-base">
                        {servicio.detallesVehiculo.tipoVehiculo} - {servicio.detallesVehiculo.marca}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                      <span>Ubicación del cliente disponible</span>
                    </div>
                    
                    <button
                      onClick={() => aceptarServicio(servicio._id)}
                      className="mobile-service-button bg-primary hover:bg-primary-hover active:bg-primary-dark text-white px-4 py-3 sm:py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full shadow-lg hover:shadow-xl transform active:scale-95 transition-transform"
                    >
                      <FaCheck className="w-4 h-4" />
                      <span>Aceptar Servicio</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notificación de nuevo servicio */}
      {newServiceNotification && isOnline && (
        <ServiceNotification
          servicio={newServiceNotification}
          onAccept={aceptarServicioNotificacion}
          onDismiss={descartarNotificacion}
        />
      )}

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

export default AsistenteDashboard;
