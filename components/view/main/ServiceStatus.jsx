"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { 
  FaSearch, 
  FaUserCog, 
  FaCar, 
  FaCheckCircle, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaTimes, 
  FaExclamationTriangle,
  FaLightbulb,
  FaWifi
} from "react-icons/fa";

// Importar el mapa dinámicamente para evitar problemas de SSR
const LeafletMap = dynamic(() => import("@/components/maps/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
});

const ServiceStatus = ({ serviceId }) => {
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const { data: session } = useSession();

  // Estados del servicio con información visual
  const statusSteps = [
    {
      status: 'pendiente',
      title: 'Buscando asistente',
      description: 'Estamos buscando el mejor asistente para tu servicio',
      icon: FaSearch,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      animation: 'animate-pulse'
    },
    {
      status: 'asignado',
      title: 'Asistente asignado',
      description: 'Un asistente ha sido asignado y se está preparando',
      icon: FaUserCog,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      animation: 'animate-bounce'
    },
    {
      status: 'en_camino',
      title: 'En camino',
      description: 'El asistente está en camino a tu ubicación',
      icon: FaCar,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      animation: 'animate-pulse'
    },
    {
      status: 'finalizado',
      title: 'Servicio completado',
      description: 'El servicio ha sido completado exitosamente',
      icon: FaCheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-600/10',
      animation: ''
    }
  ];

  // Función para obtener datos del servicio
  const fetchServiceData = async () => {
    try {
      const response = await fetch(`/api/servicerequests?id=${serviceId}`);
      if (response.ok) {
        const data = await response.json();
        setServiceData(data);
        
        // Actualizar el step actual basado en el estado
        const stepIndex = statusSteps.findIndex(step => step.status === data.estado);
        setCurrentStep(stepIndex >= 0 ? stepIndex : 0);
        
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

  // Polling para actualizar el estado cada 5 segundos
  useEffect(() => {
    if (!serviceId) return;

    fetchServiceData();
    
    const interval = setInterval(() => {
      fetchServiceData();
    }, 5000);

    return () => clearInterval(interval);
  }, [serviceId]);

  // Prevenir que el usuario salga accidentalmente
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (serviceData && (serviceData.estado === 'pendiente' || serviceData.estado === 'asignado' || serviceData.estado === 'en_camino')) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres salir? Tu servicio está en progreso.';
        return '¿Estás seguro de que quieres salir? Tu servicio está en progreso.';
      }
    };

    const handlePopState = (e) => {
      if (serviceData && (serviceData.estado === 'pendiente' || serviceData.estado === 'asignado' || serviceData.estado === 'en_camino')) {
        e.preventDefault();
        if (confirm('¿Estás seguro de que quieres salir? Tu servicio está en progreso. Para salir, cancela el servicio primero.')) {
          // Si el usuario confirma, permitir la navegación
          window.history.pushState(null, null, window.location.pathname);
        } else {
          // Si cancela, mantener la página actual
          window.history.pushState(null, null, window.location.pathname);
        }
      }
    };

    // Agregar evento para prevenir cierre de página
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Agregar evento para prevenir navegación hacia atrás
    window.addEventListener('popstate', handlePopState);
    
    // Agregar entrada al historial para capturar el botón atrás
    window.history.pushState(null, null, window.location.pathname);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [serviceData]);

  // Redireccionar automáticamente cuando el servicio esté asignado o en camino
  useEffect(() => {
    if (serviceData && (serviceData.estado === 'asignado' || serviceData.estado === 'en_camino')) {
      // Mostrar notificación antes de redirigir
      const timer = setTimeout(() => {
        router.push(`/main/service-tracking/${serviceId}`);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [serviceData, serviceId, router]);

  // Estado para mostrar el mensaje de redirección
  const showRedirectMessage = serviceData && (serviceData.estado === 'asignado' || serviceData.estado === 'en_camino');

  // Simular progreso automático para demo (eliminar en producción)
  useEffect(() => {
    if (!serviceData || serviceData.estado !== 'pendiente') return;
    
    const timer = setTimeout(() => {
      // Simular cambio de estado para demo
      // En producción, esto se manejará desde el backend cuando un asistente acepte
      fetch(`/api/servicerequests`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: serviceId,
          estado: 'asignado'
        })
      });
    }, 10000); // Cambiar estado después de 10 segundos para demo

    return () => clearTimeout(timer);
  }, [serviceData, serviceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando información del servicio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
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

  const currentStatus = statusSteps[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 service-status-container">
      {/* Header fijo - más responsivo */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-lg sm:text-xl font-semibold">Estado del Servicio</h1>
          </div>
          {/* Indicador de conexión */}
          <div className="flex items-center justify-center mt-2">
            <div className="flex items-center space-x-2">
              <FaWifi className="text-green-500 animate-pulse" size={12} />
              <span className="text-xs text-gray-500 dark:text-gray-400">Actualizando en tiempo real</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal con scroll */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-20 sm:pb-6">
        {/* Mensaje de redirección */}
        {showRedirectMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 animate-pulse">
            <p className="text-sm text-green-800 dark:text-green-200 text-center flex items-center justify-center gap-2">
              <FaCar className="animate-bounce" />
              Redirigiendo al seguimiento en tiempo real...
            </p>
          </div>
        )}

        {/* Estado actual - Mejorado para móvil */}
        <div className={`${currentStatus.bgColor} rounded-2xl p-4 sm:p-6 text-center shadow-lg service-info-card animate-fade-in-up`}>
          <div className={`mb-3 sm:mb-4 ${currentStatus.animation} flex justify-center`}>
            <currentStatus.icon 
              size={60} 
              className={`${currentStatus.color} sm:text-6xl`}
            />
          </div>
          <h2 className={`text-xl sm:text-2xl font-bold ${currentStatus.color} mb-2 sm:mb-3`}>
            {currentStatus.title}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-2">
            {currentStatus.description}
          </p>
          
          {serviceData.asistente && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-1">
                  Asistente asignado:
                </p>
                <p className="font-semibold text-lg">{serviceData.asistente.nombre}</p>
                {serviceData.asistente.telefono && (
                  <a 
                    href={`tel:${serviceData.asistente.telefono}`}
                    className="inline-flex items-center gap-2 mt-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors service-action-button"
                  >
                    <FaPhoneAlt size={14} />
                    Llamar: {serviceData.asistente.telefono}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Progreso del servicio - Layout mejorado para móvil */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg service-info-card">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Progreso del servicio</h3>
          <div className="space-y-3 sm:space-y-4">
            {statusSteps.map((step, index) => (
              <div key={index} className="flex items-start sm:items-center">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold shadow-md ${
                  index <= currentStep 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <div className="ml-3 sm:ml-4 flex-1">
                  <p className={`font-medium text-sm sm:text-base ${
                    index <= currentStep ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className={`text-xs sm:text-sm mt-1 ${
                    index <= currentStep ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
                {index === currentStep && (
                  <div className="ml-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mapa con ubicación - Altura responsiva */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg service-info-card">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="text-primary" />
            Tu ubicación
          </h3>
          <div className="h-48 sm:h-64 lg:h-80 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 service-map-container">
            {serviceData.ubicacion ? (
              <LeafletMap
                center={[serviceData.ubicacion.lat, serviceData.ubicacion.lng]}
                zoom={15}
                markers={[{
                  position: [serviceData.ubicacion.lat, serviceData.ubicacion.lng],
                  popup: "Tu ubicación"
                }]}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <p className="text-gray-500">Ubicación no disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Detalles del servicio - Grid responsivo */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg service-info-card">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Detalles del servicio</h3>
          <div className="service-details-grid">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 block">Servicio</span>
              <span className="font-medium text-base">{serviceData.servicio?.nombre || 'N/A'}</span>
            </div>
            
            {serviceData.subtipo && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 block">Tipo</span>
                <span className="font-medium text-base">{serviceData.subtipo}</span>
              </div>
            )}
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 block">Vehículo</span>
              <span className="font-medium text-base">
                {serviceData.detallesVehiculo?.tipoVehiculo || 'N/A'}
                {serviceData.detallesVehiculo?.marca && ` ${serviceData.detallesVehiculo.marca}`}
              </span>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 block">Taller</span>
              <span className="font-medium text-base">{serviceData.taller?.nombre || 'Asignando...'}</span>
            </div>
            
            <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-3 sm:col-span-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 block">Precio total</span>
              <span className="font-bold text-xl sm:text-2xl text-primary">
                ${serviceData.precio?.toFixed(2)} MXN
              </span>
            </div>
          </div>
        </div>

        {/* Tiempo estimado */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-4 sm:p-6 border border-blue-200 dark:border-blue-800 service-info-card">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
              <FaClock className="text-blue-600 dark:text-blue-400" />
              Tiempo estimado
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {serviceData.estado === 'pendiente' ? '5-10 min' : 
               serviceData.estado === 'asignado' ? '10-15 min' : 
               serviceData.estado === 'en_camino' ? '5-20 min' : '¡Completado!'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {serviceData.estado === 'pendiente' ? 'para encontrar asistente' : 
               serviceData.estado === 'asignado' ? 'para llegar a tu ubicación' : 
               serviceData.estado === 'en_camino' ? 'tiempo estimado de llegada' : 'Servicio finalizado'}
            </p>
          </div>
        </div>

        {/* Botones de acción - Responsivos y más prominentes */}
        <div className="space-y-3">
          {/* Botón de cancelar - Solo si está pendiente o asignado */}
          {(serviceData.estado === 'pendiente' || serviceData.estado === 'asignado') && (
            <button
              onClick={() => {
                if (confirm('¿Estás seguro de que quieres cancelar este servicio? Esta acción no se puede deshacer.')) {
                  fetch(`/api/servicerequests`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      _id: serviceId,
                      estado: 'cancelado'
                    })
                  }).then(() => {
                    alert('Servicio cancelado correctamente');
                    router.push('/main/servicios-express');
                  });
                }
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 sm:py-4 rounded-xl font-semibold transition-colors text-sm sm:text-base shadow-lg service-action-button"
            >
              <div className="flex items-center justify-center gap-2">
                <FaTimes />
                Cancelar servicio
              </div>
            </button>
          )}

          {/* Información sobre cancelación */}
          {(serviceData.estado === 'en_camino') && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center flex items-center justify-center gap-2">
                <FaExclamationTriangle />
                El asistente está en camino. Para cancelar, contacta directamente al asistente.
              </p>
            </div>
          )}

          {/* Botón de finalizar cuando esté completado */}
          {serviceData.estado === 'finalizado' && (
            <button
              onClick={() => router.push('/main/servicios-express')}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3 sm:py-4 rounded-xl font-semibold transition-colors text-sm sm:text-base shadow-lg service-action-button"
            >
              <div className="flex items-center justify-center gap-2">
                <FaCheckCircle />
                Finalizar y volver a servicios
              </div>
            </button>
          )}

          {/* Mensaje informativo */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 text-center flex items-center justify-center gap-2">
              <FaLightbulb />
              Esta pantalla se actualiza automáticamente. Mantén la app abierta para recibir actualizaciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceStatus;
