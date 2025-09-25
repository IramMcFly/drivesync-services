'use client';

import { useServiceStatus } from '../../../hooks/useServiceStatus';
import ClienteServiceStatus from './ClienteServiceStatus';
import { useEffect, useState, useCallback } from 'react';
import { FaTimes, FaSpinner, FaExclamationTriangle, FaSyncAlt } from 'react-icons/fa';

export default function ServiceStatusWrapper() {
  const { 
    activeService, 
    showServiceStatus, 
    setShowServiceStatus, 
    isLoading, 
    error,
    getStateInfo,
    SERVICE_STATES,
    checkActiveService
  } = useServiceStatus();
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [lastShownState, setLastShownState] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  // Helper para marcar servicios como mostrados
  const addShownService = useCallback((serviceId, estado) => {
    try {
      if (typeof window === 'undefined') return;
      const stored = localStorage.getItem('shownServices');
      const shownServices = stored ? JSON.parse(stored) : [];
      const serviceKey = `${serviceId}-${estado}`;
      
      if (!shownServices.includes(serviceKey)) {
        shownServices.push(serviceKey);
        const limited = shownServices.slice(-50);
        localStorage.setItem('shownServices', JSON.stringify(limited));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  // Comentamos la auto-actualización para que solo sea manual
  // useEffect(() => {
  //   if (!autoRefreshEnabled || !activeService) return;

  //   const interval = setInterval(() => {
  //     checkActiveService(true);
  //     setLastRefresh(Date.now());
  //   }, 20000); // 20 segundos

  //   return () => clearInterval(interval);
  // }, [autoRefreshEnabled, activeService, checkActiveService]);

  // Función para refrescar manualmente
  const handleManualRefresh = useCallback(() => {
    checkActiveService(true);
  }, [checkActiveService]);

  // Función para mostrar confirmación de cancelación
  const handleCancelClick = useCallback(() => {
    setShowCancelConfirm(true);
  }, []);

  // Función para cancelar servicio con confirmación
  const handleCancelService = useCallback(async () => {
    if (!activeService) return;

    setIsCancelling(true);
    setShowCancelConfirm(false);

    try {
      const response = await fetch(`/api/servicerequests`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: activeService._id,
          estado: SERVICE_STATES.CANCELADO
        })
      });

      if (response.ok) {
        // Verificar que se canceló correctamente
        const updatedService = await response.json();
        if (updatedService.estado === SERVICE_STATES.CANCELADO) {
          setCancelSuccess(true);
          // Actualizar inmediatamente después de cancelar
          setTimeout(() => {
            checkActiveService(true);
            setCancelSuccess(false);
          }, 2000);
        } else {
          throw new Error('El servicio no se canceló correctamente');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cancelar el servicio');
      }
    } catch (error) {
      console.error('Error al cancelar servicio:', error);
      // Mostrar error al usuario
      alert(`Error al cancelar el servicio: ${error.message}`);
    } finally {
      setIsCancelling(false);
    }
  }, [activeService, SERVICE_STATES.CANCELADO, checkActiveService]);

  // Auto-mostrar cuando hay cambios de estado importantes
  useEffect(() => {
    if (activeService && showServiceStatus) {
      const currentStateKey = `${activeService._id}-${activeService.estado}`;
      if (lastShownState !== currentStateKey) {
        setIsMinimized(false);
        setLastShownState(currentStateKey);
      }
    }
  }, [activeService, showServiceStatus, lastShownState]);

  // No mostrar si no hay servicio activo
  if (!showServiceStatus || !activeService) {
    return null;
  }

  const stateInfo = getStateInfo(activeService.estado);
  const canClose = [SERVICE_STATES.FINALIZADO, SERVICE_STATES.CANCELADO].includes(activeService.estado);
  const canCancel = [SERVICE_STATES.PENDIENTE, SERVICE_STATES.ASIGNADO, SERVICE_STATES.EN_CAMINO].includes(activeService.estado);
  
  // Componente minimizado para móviles
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
        <button
          onClick={() => setIsMinimized(false)}
          className={`
            w-full p-3 rounded-lg shadow-lg border-l-4 transition-all duration-200
            ${stateInfo.bgColor} ${stateInfo.textColor} ${stateInfo.borderColor}
            flex items-center justify-between
          `}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span className="font-medium text-sm">{stateInfo.label}</span>
          </div>
          <span className="text-xs opacity-75">Toca para ver detalles</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Overlay para móviles */}
      <div 
        className="fixed inset-0 bg-black/50 z-30 md:hidden"
        onClick={() => canClose ? setShowServiceStatus(false) : setIsMinimized(true)}
      />
      
      {/* Modal/Panel principal */}
      <div className={`
        fixed z-40 transition-all duration-300 ease-in-out
        
        /* Mobile: Modal centrado */
        inset-4 md:inset-auto
        
        /* Desktop: Panel lateral derecho */
        md:top-4 md:right-4 md:bottom-4 md:w-96 md:max-w-md
        
        ${showServiceStatus ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
      `}>
        <div className="h-full bg-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className={`
            px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0
            ${stateInfo.bgColor}
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`
                  w-3 h-3 rounded-full animate-pulse
                  ${stateInfo.color === 'yellow' ? 'bg-yellow-500' : 
                    stateInfo.color === 'blue' ? 'bg-blue-500' :
                    stateInfo.color === 'orange' ? 'bg-orange-500' :
                    stateInfo.color === 'green' ? 'bg-green-500' : 'bg-red-500'}
                `} />
                <h3 className={`font-semibold ${stateInfo.textColor}`}>
                  {stateInfo.label}
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Botón minimizar (solo móvil) */}
                {!canClose && (
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="md:hidden p-1 rounded-full hover:bg-black/10 transition-colors"
                  >
                    <FaTimes className={`w-4 h-4 ${stateInfo.textColor}`} />
                  </button>
                )}
                
                {/* Botón cerrar */}
                <button
                  onClick={() => setShowServiceStatus(false)}
                  disabled={!canClose && !isLoading}
                  className={`
                    p-1 rounded-full transition-colors
                    ${canClose || isLoading 
                      ? 'hover:bg-black/10 cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  <FaTimes className={`w-4 h-4 ${stateInfo.textColor}`} />
                </button>
              </div>
            </div>
            
            <p className={`text-sm mt-1 ${stateInfo.textColor} opacity-90`}>
              {stateInfo.description}
            </p>
          </div>

          {/* Botón de actualizar */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <FaSyncAlt className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>

          {/* Estado de éxito al cancelar */}
          {cancelSuccess && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <span className="text-sm font-medium">Servicio cancelado exitosamente</span>
              </div>
            </div>
          )}

          {/* Estado de error */}
          {error && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <FaExclamationTriangle />
                <span className="text-sm font-medium">Error de conexión</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {error}
              </p>
            </div>
          )}

          {/* Contenido principal */}
          <div className="flex-1 overflow-hidden">
            <ClienteServiceStatus
              serviceRequest={activeService}
              onClose={() => {
                // Marcar como mostrado al cerrar desde el componente interno
                if (activeService) {
                  addShownService(activeService._id, activeService.estado);
                }
                setShowServiceStatus(false);
              }}
              isEmbedded={true}
              stateInfo={stateInfo}
            />
          </div>

          {/* Footer con botones */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
            {canClose ? (
              <button
                onClick={() => {
                  // Marcar como mostrado al cerrar manualmente
                  if (activeService) {
                    addShownService(activeService._id, activeService.estado);
                  }
                  setShowServiceStatus(false);
                }}
                className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Cerrar
              </button>
            ) : canCancel ? (
              <button
                onClick={handleCancelClick}
                disabled={isCancelling}
                className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  'Cancelar Servicio'
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Modal de confirmación para cancelar */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                  <FaExclamationTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    ¿Cancelar servicio?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {activeService.estado === 'en_camino' ? (
                  <>
                    ¿Estás seguro de que quieres cancelar este servicio? 
                    El asistente ya está en camino hacia tu ubicación. 
                    Una vez cancelado, no podrás reactivarlo y tendrás que solicitar un nuevo servicio.
                  </>
                ) : (
                  <>
                    ¿Estás seguro de que quieres cancelar este servicio? 
                    Una vez cancelado, no podrás reactivarlo y tendrás que solicitar un nuevo servicio.
                  </>
                )}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  No, mantener servicio
                </button>
                <button
                  onClick={handleCancelService}
                  className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Sí, cancelar servicio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
