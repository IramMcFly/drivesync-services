'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

// Estados válidos del servicio y sus transiciones permitidas
const SERVICE_STATES = {
  PENDIENTE: 'pendiente',
  ASIGNADO: 'asignado',
  EN_CAMINO: 'en_camino',
  FINALIZADO: 'finalizado',
  CANCELADO: 'cancelado'
};

const STATE_TRANSITIONS = {
  [SERVICE_STATES.PENDIENTE]: [SERVICE_STATES.ASIGNADO, SERVICE_STATES.CANCELADO],
  [SERVICE_STATES.ASIGNADO]: [SERVICE_STATES.EN_CAMINO, SERVICE_STATES.CANCELADO, SERVICE_STATES.PENDIENTE],
  [SERVICE_STATES.EN_CAMINO]: [SERVICE_STATES.FINALIZADO, SERVICE_STATES.CANCELADO],
  [SERVICE_STATES.FINALIZADO]: [], // Estado final
  [SERVICE_STATES.CANCELADO]: [] // Estado final
};

export function useServiceStatus() {
  const { data: session } = useSession();
  const [activeService, setActiveService] = useState(null);
  const [showServiceStatus, setShowServiceStatus] = useState(false);
  const [lastServiceState, setLastServiceState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notificationQueue, setNotificationQueue] = useState([]);
  
  // Refs para evitar múltiples llamadas
  const pollingStopped = useRef(false);
  const lastFetchTime = useRef(0);
  
  // Validar si una transición de estado es válida
  const isValidStateTransition = useCallback((currentState, newState) => {
    if (!currentState || !newState) return false;
    return STATE_TRANSITIONS[currentState]?.includes(newState) || false;
  }, []);

  // Obtener información del estado actual
  const getStateInfo = useCallback((estado) => {
    const stateMap = {
      [SERVICE_STATES.PENDIENTE]: {
        label: 'Pendiente',
        description: 'Esperando asignación de asistente',
        color: 'yellow',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900',
        textColor: 'text-yellow-800 dark:text-yellow-200',
        borderColor: 'border-yellow-300 dark:border-yellow-700',
        canCancel: true,
        showToUser: false
      },
      [SERVICE_STATES.ASIGNADO]: {
        label: 'Asignado',
        description: 'Asistente asignado, preparándose',
        color: 'blue',
        bgColor: 'bg-blue-100 dark:bg-blue-900',
        textColor: 'text-blue-800 dark:text-blue-200',
        borderColor: 'border-blue-300 dark:border-blue-700',
        canCancel: true,
        showToUser: true
      },
      [SERVICE_STATES.EN_CAMINO]: {
        label: 'En camino',
        description: 'Asistente en camino a tu ubicación',
        color: 'orange',
        bgColor: 'bg-orange-100 dark:bg-orange-900',
        textColor: 'text-orange-800 dark:text-orange-200',
        borderColor: 'border-orange-300 dark:border-orange-700',
        canCancel: true,
        showToUser: true
      },
      [SERVICE_STATES.FINALIZADO]: {
        label: 'Finalizado',
        description: 'Servicio completado exitosamente',
        color: 'green',
        bgColor: 'bg-green-100 dark:bg-green-900',
        textColor: 'text-green-800 dark:text-green-200',
        borderColor: 'border-green-300 dark:border-green-700',
        canCancel: false,
        showToUser: true
      },
      [SERVICE_STATES.CANCELADO]: {
        label: 'Cancelado',
        description: 'Servicio cancelado',
        color: 'red',
        bgColor: 'bg-red-100 dark:bg-red-900',
        textColor: 'text-red-800 dark:text-red-200',
        borderColor: 'border-red-300 dark:border-red-700',
        canCancel: false,
        showToUser: true // Cambiado para mostrar cancelaciones
      }
    };
    
    return stateMap[estado] || stateMap[SERVICE_STATES.PENDIENTE];
  }, []);

  // Verificar si hay servicios activos del usuario con debounce
  const checkActiveService = useCallback(async (force = false) => {
    if (!session?.user?.id || pollingStopped.current) return;
    
    const now = Date.now();
    if (!force && now - lastFetchTime.current < 5000) return; // Debounce de 5 segundos
    
    lastFetchTime.current = now;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/servicerequests', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache' // Evitar cache para datos en tiempo real
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
        
      // Buscar servicios activos - excluir finalizados y cancelados antiguos
      const activeServiceRequest = data.find ? data.find(servicio => 
        servicio.cliente?._id === session.user.id && 
        [SERVICE_STATES.ASIGNADO, SERVICE_STATES.EN_CAMINO].includes(servicio.estado)
      ) : data.servicios?.find(servicio => 
        servicio.cliente?._id === session.user.id && 
        [SERVICE_STATES.ASIGNADO, SERVICE_STATES.EN_CAMINO].includes(servicio.estado)
      );

      // Buscar servicios recién finalizados o cancelados para notificar
      const recentlyFinished = (data.find ? data : data.servicios || []).find(servicio => 
        servicio.cliente?._id === session.user.id && 
        [SERVICE_STATES.FINALIZADO, SERVICE_STATES.CANCELADO].includes(servicio.estado) &&
        new Date(servicio.updatedAt) > new Date(Date.now() - 2 * 60 * 1000) // Últimos 2 minutos
      );

      if (activeServiceRequest) {
        const currentState = `${activeServiceRequest._id}-${activeServiceRequest.estado}`;
        const previousState = lastServiceState;
        
        setActiveService(activeServiceRequest);
        
        // Mostrar notificación solo para nuevos estados
        const stateInfo = getStateInfo(activeServiceRequest.estado);
        if (stateInfo.showToUser && previousState !== currentState) {
          console.log('🔔 Nuevo estado de servicio detectado:', activeServiceRequest.estado);
          setShowServiceStatus(true);
          setLastServiceState(currentState);
          
          // Agregar a cola de notificaciones
          setNotificationQueue(prev => [...prev, {
            id: currentState,
            service: activeServiceRequest,
            type: 'state_change',
            timestamp: Date.now()
          }]);
        }
      } else if (recentlyFinished) {
        // Manejar servicio recién finalizado o cancelado
        const finishedState = `${recentlyFinished._id}-${recentlyFinished.estado}`;
        if (lastServiceState !== finishedState) {
          setActiveService(recentlyFinished);
          setShowServiceStatus(true);
          setLastServiceState(finishedState);
          
          // Auto-cerrar después de un tiempo diferente según el estado
          const autoCloseTime = recentlyFinished.estado === SERVICE_STATES.CANCELADO ? 8000 : 5000;
          setTimeout(() => {
            setShowServiceStatus(false);
            setActiveService(null);
          }, autoCloseTime);
        }
      } else {
        // No hay servicios activos
        if (activeService && [SERVICE_STATES.FINALIZADO, SERVICE_STATES.CANCELADO].includes(activeService.estado)) {
          // Mantener por un momento para mostrar el estado final
          setTimeout(() => {
            setActiveService(null);
            setShowServiceStatus(false);
            setLastServiceState(null);
          }, 3000);
        } else {
          setActiveService(null);
          setShowServiceStatus(false);
          setLastServiceState(null);
        }
      }
    } catch (error) {
      console.error('Error verificando servicios activos:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, lastServiceState, activeService, getStateInfo]);

  // Actualizar estado de servicio con validación
  const updateServiceState = useCallback(async (serviceId, newState, comment = '') => {
    if (!serviceId || !newState) {
      throw new Error('Service ID y nuevo estado son requeridos');
    }

    // Validar transición de estado
    if (activeService && !isValidStateTransition(activeService.estado, newState)) {
      throw new Error(`Transición inválida de ${activeService.estado} a ${newState}`);
    }

    setIsLoading(true);
    try {
      const updateData = {
        _id: serviceId,
        estado: newState,
        $push: {
          historial: {
            estado: newState,
            fecha: new Date(),
            comentario: comment
          }
        }
      };

      const response = await fetch('/api/servicerequests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar servicio');
      }

      const updatedService = await response.json();
      setActiveService(updatedService);
      
      // Forzar verificación inmediata
      setTimeout(() => checkActiveService(true), 1000);
      
      return updatedService;
    } catch (error) {
      console.error('Error actualizando estado del servicio:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [activeService, isValidStateTransition, checkActiveService]);

  // Cancelar servicio
  const cancelService = useCallback(async (serviceId, reason = 'Cancelado por el usuario') => {
    return updateServiceState(serviceId, SERVICE_STATES.CANCELADO, reason);
  }, [updateServiceState]);

  // Limpiar notificaciones antiguas
  useEffect(() => {
    const interval = setInterval(() => {
      setNotificationQueue(prev => 
        prev.filter(notification => 
          Date.now() - notification.timestamp < 60000 // Mantener por 1 minuto
        )
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Polling inteligente
  useEffect(() => {
    if (!session?.user?.id) {
      pollingStopped.current = true;
      return;
    }

    pollingStopped.current = false;
    checkActiveService(true); // Verificación inicial

    // Intervalo variable basado en el estado
    const getPollingInterval = () => {
      if (!activeService) return 45000; // 45s sin servicio activo
      if (activeService.estado === SERVICE_STATES.EN_CAMINO) return 15000; // 15s en camino
      if (activeService.estado === SERVICE_STATES.ASIGNADO) return 30000; // 30s asignado
      return 60000; // 60s por defecto
    };

    const interval = setInterval(() => {
      checkActiveService();
    }, getPollingInterval());

    return () => {
      clearInterval(interval);
      pollingStopped.current = true;
    };
  }, [session?.user?.id, activeService?.estado, checkActiveService]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      pollingStopped.current = true;
    };
  }, []);

  return {
    // Estados
    activeService,
    showServiceStatus,
    isLoading,
    error,
    notificationQueue,
    
    // Funciones
    setShowServiceStatus,
    checkActiveService,
    updateServiceState,
    cancelService,
    getStateInfo,
    isValidStateTransition,
    
    // Constantes
    SERVICE_STATES,
    STATE_TRANSITIONS
  };
}
