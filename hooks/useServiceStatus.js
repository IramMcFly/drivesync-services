'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useServiceStatus() {
  const { data: session } = useSession();
  const [activeService, setActiveService] = useState(null);
  const [showServiceStatus, setShowServiceStatus] = useState(false);
  const [lastServiceState, setLastServiceState] = useState(null);

  // Verificar si hay servicios activos del usuario
  const checkActiveService = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/servicerequests', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Buscar servicios activos (asignado, en_camino)
        const activeServiceRequest = data.servicios?.find(servicio => 
          servicio.cliente._id === session.user.id && 
          ['asignado', 'en_camino', 'finalizado'].includes(servicio.estado)
        );

        if (activeServiceRequest) {
          const currentState = `${activeServiceRequest._id}-${activeServiceRequest.estado}`;
          
          setActiveService(activeServiceRequest);
          
          // Solo mostrar automáticamente si es un NUEVO estado
          // (no mostrar en cada polling si ya se mostró)
          if (['asignado', 'en_camino'].includes(activeServiceRequest.estado)) {
            if (lastServiceState !== currentState) {
              console.log('🔔 Nuevo estado de servicio detectado:', activeServiceRequest.estado);
              setShowServiceStatus(true);
              setLastServiceState(currentState);
            }
          } else if (activeServiceRequest.estado === 'finalizado') {
            // Auto-cerrar cuando se finaliza
            setShowServiceStatus(false);
            setLastServiceState(currentState);
          }
        } else {
          setActiveService(null);
          setShowServiceStatus(false);
          setLastServiceState(null);
        }
      }
    } catch (error) {
      console.error('Error verificando servicios activos:', error);
    }
  };

  // Verificar servicios activos cada 30 segundos
  useEffect(() => {
    if (session?.user?.id) {
      checkActiveService();
      const interval = setInterval(checkActiveService, 30000);
      return () => clearInterval(interval);
    }
  }, [session?.user?.id]);

  return {
    activeService,
    showServiceStatus,
    setShowServiceStatus,
    checkActiveService
  };
}
