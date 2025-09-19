"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "../../ui";
import { useModal } from "../../../hooks/useModal";
import { 
  FaCar, 
  FaMapMarkerAlt, 
  FaClock, 
  FaPhoneAlt,
  FaCheck,
  FaTimes,
  FaPlay,
  FaStop,
  FaMoneyBillWave,
  FaArrowLeft,
  FaLocationArrow,
  FaUser,
  FaRoute
} from "react-icons/fa";

const AsistenteServiceInfo = ({ servicio, session, onServiceUpdate, onBack }) => {
  const { modalState, showSuccess, showError, hideModal } = useModal();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Información del estado del servicio
  const getStatusInfo = () => {
    switch (servicio.estado) {
      case 'asignado':
        return {
          color: 'bg-blue-500',
          icon: FaPlay,
          title: 'Servicio Asignado',
          description: 'Presiona "Iniciar Viaje" cuando estés listo para partir'
        };
      case 'en_camino':
        return {
          color: 'bg-yellow-500',
          icon: FaClock,
          title: 'En Camino',
          description: 'Te estás dirigiendo hacia el cliente'
        };
      case 'en_progreso':
        return {
          color: 'bg-green-500',
          icon: FaCar,
          title: 'Servicio en Progreso',
          description: 'Atendiendo al cliente'
        };
      default:
        return {
          color: 'bg-gray-500',
          icon: FaClock,
          title: 'Estado Desconocido',
          description: ''
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // Función para actualizar estado del servicio
  const actualizarEstado = async (nuevoEstado) => {
    console.log('🔄 AsistenteServiceInfo: Actualizando estado a:', nuevoEstado);
    
    setLoading(true);
    try {
      const response = await fetch('/api/servicerequests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: servicio._id,
          estado: nuevoEstado,
          comentario: `Estado actualizado por asistente a: ${nuevoEstado}`
        })
      });

      console.log('📡 AsistenteServiceInfo: Response status:', response.status);
      
      if (response.ok) {
        const updatedService = await response.json();
        console.log('✅ AsistenteServiceInfo: Estado actualizado exitosamente:', updatedService);
        onServiceUpdate(updatedService);
        
        // Mensajes específicos según el estado
        switch (nuevoEstado) {
          case 'cancelado':
            showSuccess('Servicio cancelado correctamente');
            break;
          case 'en_camino':
            showSuccess('Has iniciado el viaje hacia el cliente');
            // Navegar al componente de tracking activo
            router.push(`/asistente/service-active/${servicio._id}`);
            return;
          case 'finalizado':
            showSuccess('Servicio completado exitosamente');
            break;
          default:
            showSuccess(`Servicio actualizado a ${nuevoEstado}`);
        }
        
        if (nuevoEstado === 'finalizado' || nuevoEstado === 'cancelado') {
          setTimeout(() => onBack(), 1500);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ AsistenteServiceInfo: Error del servidor:', errorData);
        
        // Mensajes específicos de error
        if (errorData.error && errorData.error.includes('cancelado')) {
          showError(
            'Este servicio ya fue cancelado por el cliente',
            'Servicio cancelado',
            () => {
              hideModal();
              onBack();
            }
          );
        } else if (errorData.error && errorData.error.includes('Transición inválida')) {
          showError(`No se puede cambiar el estado a ${nuevoEstado}. ${errorData.error}`);
        } else {
          showError(errorData.error || 'Error al actualizar el servicio');
        }
      }
    } catch (error) {
      console.error('❌ AsistenteServiceInfo: Error de conexión:', error);
      showError('Error de conexión. Verifica tu internet e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar y devolver a pendiente
  const cancelarYDevolver = async () => {
    if (confirm('¿Deseas devolver este servicio a la lista de pendientes?')) {
      setLoading(true);
      try {
        const response = await fetch('/api/servicerequests', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            _id: servicio._id,
            estado: 'pendiente',
            asistente: null, // Remover asistente asignado
            comentario: 'Servicio devuelto a pendientes por el asistente'
          })
        });

        if (response.ok) {
          showSuccess(
            'Servicio devuelto a la lista de pendientes',
            'Operación exitosa',
            () => {
              hideModal();
              onServiceUpdate();
              onBack();
            }
          );
        } else {
          const errorData = await response.json();
          if (errorData.error && errorData.error.includes('cancelado')) {
            showError(
              'Este servicio ya fue cancelado por el cliente',
              'Servicio cancelado',
              () => {
                hideModal();
                onBack();
              }
            );
          } else {
            showError(errorData.error || 'Error al devolver el servicio');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <FaArrowLeft className="text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${statusInfo.color} rounded-full flex items-center justify-center`}>
            <StatusIcon className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold">{statusInfo.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ID: {servicio._id.slice(-8)}
            </p>
          </div>
        </div>
      </div>

      {/* Información del servicio */}
      <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold mb-1">{servicio.servicio.nombre}</h1>
            {servicio.subtipo && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{servicio.subtipo}</p>
            )}
            <p className="text-sm text-gray-500 mb-4">{statusInfo.description}</p>
          </div>
          
          <div className="text-center sm:text-right">
            <p className="text-2xl sm:text-3xl font-bold text-primary">
              ${servicio.precio.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">MXN</p>
          </div>
        </div>
      </div>

      {/* Cliente y Vehículo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <FaUser className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold">{servicio.cliente.nombre}</h3>
              <p className="text-sm text-gray-500">{servicio.cliente.telefono}</p>
            </div>
          </div>
          <a
            href={`tel:${servicio.cliente.telefono}`}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <FaPhoneAlt />
            Llamar Cliente
          </a>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <FaCar className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">{servicio.detallesVehiculo.tipoVehiculo}</h3>
              <p className="text-sm text-gray-500">
                {servicio.detallesVehiculo.marca} {servicio.detallesVehiculo.modelo} ({servicio.detallesVehiculo.año})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ubicación */}
      <div className="bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <FaMapMarkerAlt className="text-primary" />
          Ubicación del Cliente
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {servicio.direccion}
        </p>
        <button
          onClick={() => router.push(`/asistente/service-active/${servicio._id}`)}
          className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <FaRoute />
          Ver Mapa y Navegación
        </button>
      </div>

      {/* Botones de acción */}
      <div className="space-y-3">
        {servicio.estado === 'asignado' && (
          <button
            onClick={() => actualizarEstado('en_camino')}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FaPlay />
            {loading ? 'Iniciando...' : 'Iniciar Viaje'}
          </button>
        )}

        {servicio.estado === 'en_camino' && (
          <button
            onClick={() => actualizarEstado('en_progreso')}
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FaCar />
            {loading ? 'Actualizando...' : 'Llegué al Cliente'}
          </button>
        )}

        {servicio.estado === 'en_progreso' && (
          <button
            onClick={() => actualizarEstado('finalizado')}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FaCheck />
            {loading ? 'Finalizando...' : 'Finalizar Servicio'}
          </button>
        )}

        <button
          onClick={cancelarYDevolver}
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <FaTimes />
          {loading ? 'Cancelando...' : 'Cancelar y Devolver'}
        </button>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        showCancel={modalState.showCancel}
      />
    </div>
  );
};

export default AsistenteServiceInfo;
