'use client';

import { useServiceStatus } from '../../../hooks/useServiceStatus';
import ClienteServiceStatus from './ClienteServiceStatus';
import { useEffect, useState } from 'react';
import { FaTimes, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

export default function ServiceStatusWrapper() {
  const { 
    activeService, 
    showServiceStatus, 
    setShowServiceStatus, 
    isLoading, 
    error,
    getStateInfo,
    SERVICE_STATES 
  } = useServiceStatus();
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [lastShownState, setLastShownState] = useState(null);

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
        <div className="h-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
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

          {/* Estado de carga */}
          {isLoading && (
            <div className="flex items-center justify-center p-4 border-b border-gray-200 dark:border-gray-700">
              <FaSpinner className="animate-spin text-blue-500 mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Actualizando información...
              </span>
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
              onClose={() => setShowServiceStatus(false)}
              isEmbedded={true}
              stateInfo={stateInfo}
            />
          </div>

          {/* Footer para estados finales */}
          {canClose && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <button
                onClick={() => setShowServiceStatus(false)}
                className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
