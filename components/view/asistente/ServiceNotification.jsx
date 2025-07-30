"use client";

import { useState, useEffect } from "react";
import { FaBell, FaTimes, FaCheck, FaMapMarkerAlt, FaClock, FaMoneyBillWave } from "react-icons/fa";

const ServiceNotification = ({ servicio, onAccept, onDismiss }) => {
  const [timeLeft, setTimeLeft] = useState(30); // 30 segundos para responder
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDismiss]);

  const handleAccept = () => {
    setIsVisible(false);
    onAccept();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-primary text-white rounded-xl shadow-2xl border-2 border-white overflow-hidden animate-bounce">
        {/* Header */}
        <div className="bg-primary-dark px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaBell className="animate-pulse" />
            <span className="font-semibold text-sm">Nuevo Servicio</span>
          </div>
          <div className="flex items-center gap-2">
            <FaClock className="text-sm" />
            <span className="text-sm font-mono">{timeLeft}s</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{servicio.servicio.nombre}</h3>
          {servicio.subtipo && (
            <p className="text-sm opacity-90 mb-2">{servicio.subtipo}</p>
          )}
          
          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt />
              <span>Cliente: {servicio.cliente.nombre}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaMoneyBillWave />
              <span className="font-bold">${servicio.precio.toFixed(2)} MXN</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-4">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            ></div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <FaCheck />
              Aceptar
            </button>
            <button
              onClick={handleDismiss}
              className="bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceNotification;
