'use client';

import { useState, useEffect } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalada
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInAppBrowser = window.navigator.standalone === true;
      setIsInstalled(isStandalone || isInAppBrowser);
    };

    checkIfInstalled();

    // Escuchar evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Escuchar evento appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Recordar que el usuario rechazó la instalación por 7 días
    localStorage.setItem('pwa-install-dismissed', Date.now() + (7 * 24 * 60 * 60 * 1000));
  };

  // No mostrar si ya está instalada o si fue rechazada recientemente
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed && Date.now() < parseInt(dismissed)) {
      setShowInstallPrompt(false);
    }
  }, []);

  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-2xl p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg">¡Instala DriveSync!</h3>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-sm mb-4 opacity-90">
          Agrega DriveSync a tu pantalla de inicio para acceso rápido y una experiencia como app nativa.
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 px-4 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
          >
            Ahora no
          </button>
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2 px-4 bg-white text-blue-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <FaDownload className="w-4 h-4" />
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}