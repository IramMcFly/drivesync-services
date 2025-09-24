'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  FaCar, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaStar,
  FaRegStar,
  FaSpinner,
  FaTimes,
  FaCheck,
  FaCalendarAlt,
  FaPalette,
  FaIdCard,
  FaTachometerAlt
} from 'react-icons/fa';

const TIPOS_VEHICULO = [
  { value: 'sedan', label: 'Sedán' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'suv', label: 'SUV' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'coupe', label: 'Coupé' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'wagon', label: 'Wagon' },
  { value: 'minivan', label: 'Minivan' },
  { value: 'motocicleta', label: 'Motocicleta' },
  { value: 'otro', label: 'Otro' }
];

export default function VehicleManager({ userId }) {
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    año: new Date().getFullYear(),
    color: '',
    tipoVehiculo: 'sedan',
    placa: '',
    numeroSerie: '',
    kilometraje: '',
    esPrincipal: false,
    notas: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar vehículos del usuario
  const fetchVehicles = async () => {
    try {
      const response = await fetch(`/api/vehicles?userId=${userId || session?.user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      } else {
        setError('Error al cargar vehículos');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId || session?.user?.id) {
      fetchVehicles();
    }
  }, [userId, session?.user?.id]);

  // Limpiar mensajes después de 3 segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      marca: '',
      modelo: '',
      año: new Date().getFullYear(),
      color: '',
      tipoVehiculo: 'sedan',
      placa: '',
      numeroSerie: '',
      kilometraje: '',
      esPrincipal: false,
      notas: ''
    });
    setEditingVehicle(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  // Abrir formulario para editar
  const handleEdit = (vehicle) => {
    setFormData({
      marca: vehicle.marca || '',
      modelo: vehicle.modelo || '',
      año: vehicle.año || new Date().getFullYear(),
      color: vehicle.color || '',
      tipoVehiculo: vehicle.tipoVehiculo || 'sedan',
      placa: vehicle.placa || '',
      numeroSerie: vehicle.numeroSerie || '',
      kilometraje: vehicle.kilometraje || '',
      esPrincipal: vehicle.esPrincipal || false,
      notas: vehicle.notas || ''
    });
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const url = editingVehicle ? '/api/vehicles' : '/api/vehicles';
      const method = editingVehicle ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        userId: userId || session?.user?.id,
        año: parseInt(formData.año),
        kilometraje: formData.kilometraje ? parseInt(formData.kilometraje) : null
      };

      if (editingVehicle) {
        payload._id = editingVehicle._id;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(editingVehicle ? 'Vehículo actualizado correctamente' : 'Vehículo agregado correctamente');
        resetForm();
        fetchVehicles();
      } else {
        setError(data.error || 'Error al guardar vehículo');
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      setError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar vehículo
  const handleDelete = async (vehicleId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este vehículo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/vehicles?id=${vehicleId}&userId=${userId || session?.user?.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Vehículo eliminado correctamente');
        fetchVehicles();
      } else {
        setError(data.error || 'Error al eliminar vehículo');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      setError('Error de conexión');
    }
  };

  // Establecer como principal
  const setPrincipal = async (vehicleId) => {
    try {
      const vehicle = vehicles.find(v => v._id === vehicleId);
      const response = await fetch('/api/vehicles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: vehicleId,
          userId: userId || session?.user?.id,
          ...vehicle,
          esPrincipal: true
        })
      });

      if (response.ok) {
        setSuccess('Vehículo principal actualizado');
        fetchVehicles();
      } else {
        setError('Error al actualizar vehículo principal');
      }
    } catch (error) {
      console.error('Error setting principal:', error);
      setError('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FaSpinner className="animate-spin text-2xl text-primary" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando vehículos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <FaCar className="text-xl sm:text-2xl text-primary" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                Mis Vehículos
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Gestiona los vehículos para tus servicios
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-3 sm:py-2 rounded-lg font-medium transition-colors w-full sm:w-auto"
          >
            <FaPlus />
            <span className="text-sm sm:text-base">Agregar Vehículo</span>
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Lista de vehículos */}
      {vehicles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <FaCar className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No tienes vehículos registrados
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Agrega tu primer vehículo para empezar a solicitar servicios
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Agregar Primer Vehículo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className={`bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border-2 transition-all ${
                vehicle.esPrincipal 
                  ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
              }`}
            >
              {/* Header de la tarjeta */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    vehicle.esPrincipal 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    <FaCar className="text-lg sm:text-xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 truncate">
                      {vehicle.marca} {vehicle.modelo}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {vehicle.año} • {vehicle.placa}
                      </span>
                      {vehicle.esPrincipal && (
                        <div className="flex items-center gap-1 text-xs bg-primary text-white px-2 py-1 rounded-full w-fit">
                          <FaStar className="text-xs" />
                          <span>Principal</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 sm:gap-2 justify-end sm:justify-start shrink-0">
                  {!vehicle.esPrincipal && (
                    <button
                      onClick={() => setPrincipal(vehicle._id)}
                      className="p-2 text-gray-400 hover:text-yellow-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Establecer como principal"
                    >
                      <FaRegStar className="text-sm sm:text-base" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Editar"
                  >
                    <FaEdit className="text-sm sm:text-base" />
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle._id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Eliminar"
                  >
                    <FaTrash className="text-sm sm:text-base" />
                  </button>
                </div>
              </div>

              {/* Detalles del vehículo */}
              <div className="space-y-2 sm:space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <FaPalette className="text-gray-400 text-sm shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {vehicle.color}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaIdCard className="text-gray-400 text-sm shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {TIPOS_VEHICULO.find(t => t.value === vehicle.tipoVehiculo)?.label || vehicle.tipoVehiculo}
                    </span>
                  </div>
                </div>

                {vehicle.kilometraje && (
                  <div className="flex items-center gap-2">
                    <FaTachometerAlt className="text-gray-400 text-sm shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {vehicle.kilometraje.toLocaleString()} km
                    </span>
                  </div>
                )}

                {vehicle.notas && (
                  <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
                      {vehicle.notas}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mt-2 sm:mt-0">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                  {editingVehicle ? 'Editar Vehículo' : 'Agregar Vehículo'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Marca */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Marca *
                  </label>
                  <input
                    type="text"
                    name="marca"
                    value={formData.marca}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Toyota, Honda, Ford..."
                  />
                </div>

                {/* Modelo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Corolla, Civic, Focus..."
                  />
                </div>

                {/* Año */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Año *
                  </label>
                  <input
                    type="number"
                    name="año"
                    value={formData.año}
                    onChange={handleInputChange}
                    required
                    min="1900"
                    max={new Date().getFullYear() + 2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color *
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Blanco, Negro, Rojo..."
                  />
                </div>

                {/* Tipo de vehículo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Vehículo *
                  </label>
                  <select
                    name="tipoVehiculo"
                    value={formData.tipoVehiculo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {TIPOS_VEHICULO.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Placa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Placa *
                  </label>
                  <input
                    type="text"
                    name="placa"
                    value={formData.placa}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="ABC-123"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>

              {/* Campos opcionales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Número de serie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Número de Serie (VIN)
                  </label>
                  <input
                    type="text"
                    name="numeroSerie"
                    value={formData.numeroSerie}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="17 caracteres"
                  />
                </div>

                {/* Kilometraje */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kilometraje
                  </label>
                  <input
                    type="number"
                    name="kilometraje"
                    value={formData.kilometraje}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="120000"
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notas adicionales
                </label>
                <textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Información adicional sobre el vehículo..."
                />
              </div>

              {/* Vehículo principal */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="esPrincipal"
                  name="esPrincipal"
                  checked={formData.esPrincipal}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="esPrincipal" className="text-sm text-gray-700 dark:text-gray-300">
                  Establecer como vehículo principal
                </label>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm sm:text-base order-1 sm:order-1"
                >
                  {submitting ? (
                    <FaSpinner className="animate-spin text-sm" />
                  ) : (
                    <FaCheck className="text-sm" />
                  )}
                  {submitting 
                    ? 'Guardando...' 
                    : editingVehicle 
                      ? 'Actualizar' 
                      : 'Agregar'
                  }
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 sm:px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base order-2 sm:order-2"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}