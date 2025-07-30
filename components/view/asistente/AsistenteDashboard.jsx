"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import dynamic from "next/dynamic";
import ServiceNotification from "./ServiceNotification";

// Importar el mapa dinámicamente
const LeafletMap = dynamic(() => import("@/components/maps/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
});

const AsistenteDashboard = () => {
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
        // Actualizar datos inmediatamente
        fetchData();
        alert('Servicio aceptado exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al aceptar servicio');
      }
    } catch (error) {
      console.error('Error aceptando servicio:', error);
      alert('Error de conexión');
    }
  };

  // Función para actualizar estado de servicio asignado
  const actualizarEstadoServicio = async (serviceId, nuevoEstado) => {
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
        fetchData();
        alert(`Servicio actualizado a ${nuevoEstado}`);
      }
    } catch (error) {
      console.error('Error actualizando servicio:', error);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header del Dashboard */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <h1 className="text-xl font-bold">Dashboard Asistente</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Indicador de última actualización */}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <FaWifi className="text-green-500" />
                <span>{lastUpdate.toLocaleTimeString()}</span>
              </div>
              
              {/* Botón de estado */}
              <button
                onClick={toggleOnlineStatus}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  isOnline 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isOnline ? <FaStop /> : <FaPlay />}
                <span>{isOnline ? 'Desconectar' : 'Conectar'}</span>
              </button>

              {/* Botón de logout */}
              <button
                onClick={() => router.push('/login')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Información del Asistente */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaCar className="text-primary" />
            Mi Información
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 block">Taller</span>
              <span className="font-medium">{asistenteData.taller}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 block">Placa</span>
              <span className="font-medium">{asistenteData.placa}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 block">Vehículo</span>
              <span className="font-medium">
                {asistenteData.vehiculo?.marca} {asistenteData.vehiculo?.modelo}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 block">Estado</span>
              <span className={`font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>

        {/* Servicios Asignados (Prioritarios) */}
        {serviciosAsignados.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-l-4 border-primary">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaBell className="text-primary animate-pulse" />
              Mis Servicios Activos ({serviciosAsignados.length})
            </h2>
            <div className="space-y-4">
              {serviciosAsignados.map(servicio => (
                <div key={servicio._id} className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{servicio.servicio.nombre}</h3>
                      {servicio.subtipo && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{servicio.subtipo}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        servicio.estado === 'asignado' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {servicio.estado === 'asignado' ? 'Asignado' : 'En Camino'}
                      </span>
                      <p className="text-xl font-bold text-primary mt-1">
                        ${servicio.precio.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cliente:</p>
                      <p className="font-medium">{servicio.cliente.nombre}</p>
                      <p className="text-sm text-gray-500">{servicio.cliente.telefono}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vehículo:</p>
                      <p className="font-medium">
                        {servicio.detallesVehiculo.tipoVehiculo} - {servicio.detallesVehiculo.marca}
                      </p>
                      <p className="text-sm text-gray-500">{servicio.detallesVehiculo.año}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`tel:${servicio.cliente.telefono}`}
                      className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      <FaPhoneAlt />
                      Llamar Cliente
                    </a>
                    
                    <button
                      onClick={() => irATracking(servicio._id)}
                      className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
                    >
                      <FaRoute />
                      Ver Ruta
                    </button>

                    {servicio.estado === 'asignado' && (
                      <button
                        onClick={() => actualizarEstadoServicio(servicio._id, 'en_camino')}
                        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        <FaCar />
                        Ir en Camino
                      </button>
                    )}

                    {servicio.estado === 'en_camino' && (
                      <button
                        onClick={() => actualizarEstadoServicio(servicio._id, 'finalizado')}
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                      >
                        <FaCheck />
                        Finalizar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Servicios Disponibles */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FaTools className="text-primary" />
              Servicios Disponibles ({serviciosDisponibles.length})
            </h2>
            {!isOnline && (
              <p className="text-sm text-red-500 flex items-center gap-2">
                <FaExclamationTriangle />
                Conéctate para ver servicios
              </p>
            )}
          </div>

          {!isOnline ? (
            <div className="text-center py-8">
              <FaPowerOff className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-500">Conéctate para recibir solicitudes de servicio</p>
            </div>
          ) : serviciosDisponibles.length === 0 ? (
            <div className="text-center py-8">
              <FaClock className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-500">No hay servicios disponibles en este momento</p>
              <p className="text-sm text-gray-400 mt-2">
                Se actualizará automáticamente cada 20 segundos
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {serviciosDisponibles.map(servicio => (
                <div key={servicio._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{servicio.servicio.nombre}</h3>
                      {servicio.subtipo && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{servicio.subtipo}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ${servicio.precio.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        <FaClock className="inline mr-1" />
                        {new Date(servicio.fechaSolicitud).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cliente:</p>
                      <p className="font-medium">{servicio.cliente.nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vehículo:</p>
                      <p className="font-medium">
                        {servicio.detallesVehiculo.tipoVehiculo} - {servicio.detallesVehiculo.marca}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaMapMarkerAlt className="mr-1" />
                      <span>Ubicación del cliente disponible</span>
                    </div>
                    
                    <button
                      onClick={() => aceptarServicio(servicio._id)}
                      className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <FaCheck />
                      Aceptar Servicio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mapa con ubicación actual */}
        {userLocation && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-primary" />
              Mi Ubicación Actual
            </h2>
            <div className="h-64 rounded-lg overflow-hidden">
              <LeafletMap
                center={[userLocation.lat, userLocation.lng]}
                zoom={15}
                markers={[{
                  position: [userLocation.lat, userLocation.lng],
                  popup: "Mi ubicación"
                }]}
              />
            </div>
          </div>
        )}
      </div>

      {/* Notificación de nuevo servicio */}
      {newServiceNotification && isOnline && (
        <ServiceNotification
          servicio={newServiceNotification}
          onAccept={aceptarServicioNotificacion}
          onDismiss={descartarNotificacion}
        />
      )}
    </div>
  );
};

export default AsistenteDashboard;
