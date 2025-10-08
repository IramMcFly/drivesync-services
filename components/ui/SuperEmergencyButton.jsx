"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
  FaExclamationTriangle, 
  FaShieldAlt, 
  FaVideo, 
  FaMicrophone, 
  FaMapMarkerAlt,
  FaPhone,
  FaEye,
  FaCheckCircle,
  FaTimes
} from 'react-icons/fa';

export default function SuperEmergencyButton({ className = "" }) {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [emergencyStage, setEmergencyStage] = useState('inactive'); // inactive, confirming, active, monitoring
  const [location, setLocation] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [emergencyId, setEmergencyId] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // Countdown para auto-activación
  useEffect(() => {
    let interval = null;
    if (emergencyStage === 'confirming' && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown => countdown - 1);
      }, 1000);
    } else if (emergencyStage === 'confirming' && countdown === 0) {
      activateEmergency();
    }
    return () => clearInterval(interval);
  }, [emergencyStage, countdown]);

  // Obtener ubicación del usuario
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          setLocation(coords);
          resolve(coords);
        },
        (error) => {
          reject(error);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    });
  };

  // Activar cámara y micrófono
  const activateCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });
      
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Iniciar grabación
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        // Aquí enviarías el video al servidor
        uploadEmergencyVideo(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      return stream;
    } catch (error) {
      console.error('Error activando cámara:', error);
      throw error;
    }
  };

  // Enviar video de emergencia al servidor
  const uploadEmergencyVideo = async (videoBlob) => {
    try {
      const formData = new FormData();
      formData.append('video', videoBlob, `emergency-${emergencyId}-${Date.now()}.webm`);
      formData.append('emergencyId', emergencyId);
      formData.append('userId', session?.user?.id);
      formData.append('timestamp', new Date().toISOString());

      const response = await fetch('/api/emergency/video', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error subiendo video');
      }

      console.log('✅ Video de emergencia enviado');
    } catch (error) {
      console.error('❌ Error enviando video:', error);
    }
  };

  // Iniciar proceso de emergencia
  const startEmergencyProcess = () => {
    setShowModal(true);
    setEmergencyStage('confirming');
    setCountdown(10);
  };

  // Activar emergencia completa
  const activateEmergency = async () => {
    try {
      setEmergencyStage('active');
      
      // 1. Obtener ubicación
      const coords = await getUserLocation();
      
      // 2. Activar cámara
      await activateCamera();
      
      // 3. Crear alerta de emergencia
      const emergencyResponse = await fetch('/api/emergency/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          location: coords,
          type: 'super_emergency',
          timestamp: new Date().toISOString(),
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          }
        })
      });

      if (!emergencyResponse.ok) {
        throw new Error('Error creando alerta de emergencia');
      }

      const emergencyData = await emergencyResponse.json();
      setEmergencyId(emergencyData.emergencyId);
      
      // 4. Notificar a autoridades
      await fetch('/api/emergency/notify-authorities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emergencyId: emergencyData.emergencyId,
          location: coords,
          userId: session?.user?.id
        })
      });

      setEmergencyStage('monitoring');
      
    } catch (error) {
      console.error('Error activando emergencia:', error);
      alert('Error al activar emergencia. Por favor, contacta a las autoridades directamente.');
    }
  };

  // Cancelar emergencia
  const cancelEmergency = () => {
    setEmergencyStage('inactive');
    setShowModal(false);
    setCountdown(10);
    
    // Detener cámara
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    
    // Detener grabación
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Finalizar emergencia
  const endEmergency = async () => {
    try {
      if (emergencyId) {
        await fetch('/api/emergency/end', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emergencyId,
            endTime: new Date().toISOString()
          })
        });
      }
      
      cancelEmergency();
    } catch (error) {
      console.error('Error finalizando emergencia:', error);
    }
  };

  return (
    <>
      {/* Botón de Super Emergencia */}
      <button
        onClick={startEmergencyProcess}
        className={`relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 ${className}`}
        disabled={emergencyStage !== 'inactive'}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <FaShieldAlt size={20} />
            {emergencyStage === 'monitoring' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <span>SUPER EMERGENCIA</span>
        </div>
        
        {emergencyStage === 'monitoring' && (
          <div className="absolute inset-0 rounded-lg bg-green-500/20 animate-pulse"></div>
        )}
      </button>

      {/* Modal de Emergencia */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-red-500/50">
            
            {/* Etapa de Confirmación */}
            {emergencyStage === 'confirming' && (
              <div className="text-center">
                <div className="text-6xl mb-4 text-red-500 animate-pulse">
                  {countdown}
                </div>
                <h2 className="text-xl font-bold mb-4 text-red-400">
                  🚨 ACTIVANDO SUPER EMERGENCIA
                </h2>
                <p className="text-gray-300 mb-6">
                  Se activará automáticamente en {countdown} segundos.
                  Las autoridades serán notificadas y podrán monitorear tu ubicación.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={activateEmergency}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium"
                  >
                    ACTIVAR AHORA
                  </button>
                  <button
                    onClick={cancelEmergency}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium"
                  >
                    CANCELAR
                  </button>
                </div>
              </div>
            )}

            {/* Etapa Activa */}
            {emergencyStage === 'active' && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                <h2 className="text-xl font-bold mb-4 text-red-400">
                  🚨 ACTIVANDO SISTEMA DE EMERGENCIA
                </h2>
                <div className="text-left space-y-2 text-sm text-gray-300">
                  <p>✅ Obteniendo ubicación GPS...</p>
                  <p>✅ Activando cámara y micrófono...</p>
                  <p>✅ Notificando a autoridades...</p>
                  <p>🔄 Conectando con cámaras cercanas...</p>
                </div>
              </div>
            )}

            {/* Etapa de Monitoreo */}
            {emergencyStage === 'monitoring' && (
              <div>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FaCheckCircle className="text-white" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-green-400">
                    🛡️ MONITOREO ACTIVO
                  </h2>
                  <p className="text-gray-300 text-sm">
                    Las autoridades han sido notificadas y están monitoreando tu ubicación
                  </p>
                </div>

                {/* Video feed */}
                {cameraStream && (
                  <div className="mb-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full rounded-lg"
                      style={{ maxHeight: '200px' }}
                    />
                    <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-400">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>GRABANDO - Transmitiendo a autoridades</span>
                    </div>
                  </div>
                )}

                {/* Info de emergencia */}
                <div className="bg-gray-800 rounded-lg p-3 mb-4 text-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMapMarkerAlt className="text-blue-400" />
                    <span className="text-gray-300">
                      Ubicación: {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Obteniendo...'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaVideo className="text-green-400" />
                    <span className="text-gray-300">Cámara: Activa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaEye className="text-purple-400" />
                    <span className="text-gray-300">Autoridades: Conectadas</span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open('tel:911')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center gap-2"
                  >
                    <FaPhone size={14} />
                    Llamar 911
                  </button>
                  <button
                    onClick={endEmergency}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm"
                  >
                    Estoy Seguro
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}