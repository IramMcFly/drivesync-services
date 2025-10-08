"use client";

import { useState, useEffect } from 'react';
import { 
  FaShieldAlt, 
  FaMapMarkerAlt, 
  FaVideo, 
  FaClock, 
  FaUser,
  FaPhone,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaVolumeUp,
  FaExpand
} from 'react-icons/fa';

export default function AuthorityDashboard() {
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [cameraFeeds, setCameraFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveEmergencies();
    const interval = setInterval(loadActiveEmergencies, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const loadActiveEmergencies = async () => {
    try {
      // Simular emergencias activas
      const mockEmergencies = [
        {
          emergencyId: 'EMG-1728360000-A1B2C3D4',
          userId: 'user123',
          userName: 'Juan Pérez',
          phone: '+52 81 1234-5678',
          location: { lat: 25.6866, lng: -100.3161 },
          address: 'Av. Constitución 123, Centro, Monterrey',
          status: 'active',
          priority: 'critical',
          type: 'super_emergency',
          startTime: new Date(Date.now() - 2 * 60 * 1000), // 2 minutos atrás
          description: 'Usuario reporta situación de peligro en zona peligrosa',
          deviceInfo: {
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
            platform: 'iPhone'
          },
          cameras: [
            { id: 'CAM-001', name: 'Av. Constitución Norte', distance: 0.1, status: 'connected' },
            { id: 'CAM-002', name: 'Plaza Mayor', distance: 0.3, status: 'connected' }
          ],
          hasVideo: true,
          hasAudio: true,
          estimatedPoliceArrival: '3-5 min'
        }
      ];

      setActiveEmergencies(mockEmergencies);
      if (!selectedEmergency && mockEmergencies.length > 0) {
        setSelectedEmergency(mockEmergencies[0]);
        loadCameraFeeds(mockEmergencies[0].emergencyId);
      }
    } catch (error) {
      console.error('Error cargando emergencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCameraFeeds = async (emergencyId) => {
    try {
      // Simular feeds de cámaras
      const mockFeeds = [
        {
          cameraId: 'CAM-001',
          name: 'Cámara Principal - Av. Constitución',
          streamUrl: '/api/emergency/camera-stream/CAM-001',
          status: 'streaming',
          angle: 'street_view',
          canPanTilt: true
        },
        {
          cameraId: 'CAM-002',
          name: 'Cámara Secundaria - Plaza Mayor',
          streamUrl: '/api/emergency/camera-stream/CAM-002',
          status: 'streaming',
          angle: 'overview',
          canPanTilt: false
        }
      ];

      setCameraFeeds(mockFeeds);
    } catch (error) {
      console.error('Error cargando feeds de cámaras:', error);
    }
  };

  const handleEmergencyResponse = async (emergencyId, action) => {
    try {
      console.log(`Acción ${action} para emergencia ${emergencyId}`);
      
      // Aquí enviarías la acción al servidor
      // await fetch('/api/emergency/response', {
      //   method: 'POST',
      //   body: JSON.stringify({ emergencyId, action })
      // });

    } catch (error) {
      console.error('Error enviando respuesta:', error);
    }
  };

  const formatDuration = (startTime) => {
    const now = new Date();
    const diff = Math.floor((now - startTime) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Cargando sistema de monitoreo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-red-500" size={24} />
              <h1 className="text-xl font-bold">Centro de Monitoreo de Emergencias</h1>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm">ACTIVO</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Emergencias activas: <span className="text-red-400 font-bold">{activeEmergencies.length}</span>
            </div>
            <div className="text-sm text-gray-400">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Lista de Emergencias */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Emergencias Activas</h2>
            
            {activeEmergencies.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FaCheckCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>No hay emergencias activas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeEmergencies.map((emergency) => (
                  <div
                    key={emergency.emergencyId}
                    onClick={() => {
                      setSelectedEmergency(emergency);
                      loadCameraFeeds(emergency.emergencyId);
                    }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedEmergency?.emergencyId === emergency.emergencyId
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FaExclamationTriangle className="text-red-500" />
                        <span className="font-medium text-sm">{emergency.emergencyId.split('-')[2]}</span>
                      </div>
                      <span className="text-xs bg-red-500 px-2 py-1 rounded">
                        {emergency.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <FaUser size={12} />
                        <span>{emergency.userName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt size={12} />
                        <span className="text-gray-300 truncate">
                          {emergency.address}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClock size={12} />
                        <span className="text-red-400">
                          {formatDuration(emergency.startTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedEmergency ? (
            <>
              {/* Emergency Info */}
              <div className="bg-gray-800 border-b border-gray-700 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Info Principal */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-4 mb-4">
                      <h2 className="text-2xl font-bold">Emergencia {selectedEmergency.emergencyId.split('-')[2]}</h2>
                      <span className="px-3 py-1 bg-red-500 rounded-full text-sm font-medium">
                        CRÍTICA
                      </span>
                      <span className="px-3 py-1 bg-green-500 rounded-full text-sm font-medium">
                        MONITOREO ACTIVO
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Usuario:</span>
                        <p className="font-medium">{selectedEmergency.userName}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Duración:</span>
                        <p className="font-medium text-red-400">{formatDuration(selectedEmergency.startTime)}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Ubicación:</span>
                        <p className="font-medium">{selectedEmergency.address}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">ETA Policía:</span>
                        <p className="font-medium text-yellow-400">{selectedEmergency.estimatedPoliceArrival}</p>
                      </div>
                    </div>
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="space-y-3">
                    <button
                      onClick={() => window.open(`tel:${selectedEmergency.phone}`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium"
                    >
                      <FaPhone />
                      Contactar Usuario
                    </button>
                    
                    <button
                      onClick={() => handleEmergencyResponse(selectedEmergency.emergencyId, 'dispatch_units')}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium"
                    >
                      <FaShieldAlt />
                      Enviar Unidades
                    </button>
                    
                    <button
                      onClick={() => handleEmergencyResponse(selectedEmergency.emergencyId, 'escalate')}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium"
                    >
                      <FaExclamationTriangle />
                      Escalar Prioridad
                    </button>
                  </div>
                </div>
              </div>

              {/* Feeds de Cámaras */}
              <div className="flex-1 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Monitoreo en Vivo</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <FaVideo />
                      <span>{cameraFeeds.length} cámaras conectadas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaEye />
                      <span>Grabando automáticamente</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  {cameraFeeds.map((feed) => (
                    <div key={feed.cameraId} className="bg-gray-800 rounded-lg overflow-hidden">
                      <div className="bg-gray-700 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">{feed.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="text-gray-400 hover:text-white">
                            <FaVolumeUp size={14} />
                          </button>
                          <button className="text-gray-400 hover:text-white">
                            <FaExpand size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="aspect-video bg-gray-900 flex items-center justify-center">
                        {/* Aquí iría el feed real de la cámara */}
                        <div className="text-center">
                          <FaVideo size={48} className="mx-auto mb-4 text-gray-600" />
                          <p className="text-gray-400 text-sm">Feed de cámara {feed.cameraId}</p>
                          <p className="text-green-400 text-xs mt-1">● EN VIVO</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <FaShieldAlt size={64} className="mx-auto mb-4 opacity-50" />
                <p>Selecciona una emergencia para ver detalles</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}