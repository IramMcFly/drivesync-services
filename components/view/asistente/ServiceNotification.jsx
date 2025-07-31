"use client";

import { useState, useEffect, useCallback } from "react";
import { FaBell, FaTimes, FaCheck, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaCar, FaUser } from "react-icons/fa";

const ServiceNotification = ({ servicio, onAccept, onDismiss, timeLimit = 30 }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isVisible, setIsVisible] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Countdown timer con cleanup
  useEffect(() => {
    if (timeLeft <= 0) {
      handleDismiss();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleAccept = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      setIsVisible(false);
      await onAccept();
    } catch (error) {
      console.error('Error aceptando servicio:', error);
      setIsVisible(true);
      setIsProcessing(false);
    }
  }, [isProcessing, onAccept]);

  const handleDismiss = useCallback(() => {
    if (isProcessing) return;
    
    setIsVisible(false);
    onDismiss();
  }, [isProcessing, onDismiss]);

  // Auto-hide en mobile después de un tiempo
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && timeLeft <= 5) {
      // En móvil, hacer más prominente en los últimos 5 segundos
      const notification = document.getElementById('service-notification');
      if (notification) {
        notification.classList.add('animate-pulse', 'scale-105');
      }
    }
  }, [timeLeft]);

  if (!isVisible || !servicio) return null;

  const progressPercentage = (timeLeft / timeLimit) * 100;
  const isUrgent = timeLeft <= 10;

  return (
    <>
      {/* Overlay en mobile */}
      <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={handleDismiss} />
      
      {/* Notification */}
      <div 
        id="service-notification"
        className={`
          fixed z-50 w-full max-w-sm transition-all duration-300 ease-in-out
          ${isUrgent ? 'animate-bounce' : 'animate-slide-down'}
          
          /* Mobile positioning */
          bottom-4 left-4 right-4 mx-auto
          
          /* Desktop positioning */
          md:top-4 md:right-4 md:bottom-auto md:left-auto md:mx-0
        `}
      >
        <div className={`
          bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 overflow-hidden
          ${isUrgent ? 'border-red-500 shadow-red-500/25' : 'border-blue-500 shadow-blue-500/25'}
          transform transition-transform duration-200
          ${isProcessing ? 'scale-95 opacity-75' : 'scale-100 opacity-100'}
        `}>
          {/* Header */}
          <div className={`
            px-4 py-3 flex items-center justify-between text-white
            ${isUrgent ? 'bg-red-500' : 'bg-blue-500'}
          `}>
            <div className="flex items-center gap-2">
              <FaBell className={isUrgent ? "animate-ping" : "animate-pulse"} />
              <span className="font-semibold text-sm">
                {isUrgent ? '¡Servicio Urgente!' : 'Nuevo Servicio'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-sm" />
              <span className={`text-sm font-mono font-bold ${isUrgent ? 'animate-pulse' : ''}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 text-gray-900 dark:text-gray-100">
            <div className="mb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {servicio.servicio?.nombre || 'Servicio'}
              </h3>
              {servicio.subtipo && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {servicio.subtipo}
                </p>
              )}
            </div>
            
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FaUser className="text-blue-500" />
                <span className="font-medium">Cliente:</span>
                <span>{servicio.cliente?.nombre || 'Sin nombre'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FaCar className="text-green-500" />
                <span className="font-medium">Vehículo:</span>
                <span>
                  {servicio.detallesVehiculo?.marca} {servicio.detallesVehiculo?.modelo} 
                  {servicio.detallesVehiculo?.año && ` (${servicio.detallesVehiculo.año})`}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FaMapMarkerAlt className="text-red-500" />
                <span className="font-medium">Ubicación:</span>
                <span className="text-xs">
                  {servicio.ubicacion?.lat?.toFixed(4)}, {servicio.ubicacion?.lng?.toFixed(4)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FaMoneyBillWave className="text-yellow-500" />
                <span className="font-medium">Precio:</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  ${servicio.precio?.toFixed(2)} MXN
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
              <div 
                className={`
                  h-2 rounded-full transition-all duration-1000 ease-linear
                  ${isUrgent ? 'bg-red-500' : 'bg-blue-500'}
                `}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleAccept}
                disabled={isProcessing}
                className={`
                  flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200
                  flex items-center justify-center gap-2 text-white
                  ${isProcessing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600 active:bg-green-700 transform active:scale-95'
                  }
                  ${isUrgent ? 'animate-pulse' : ''}
                `}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <FaCheck />
                    Aceptar Servicio
                  </>
                )}
              </button>
              
              <button
                onClick={handleDismiss}
                disabled={isProcessing}
                className={`
                  py-3 px-4 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400
                  ${isProcessing 
                    ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed' 
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95'
                  }
                `}
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ServiceNotification;
