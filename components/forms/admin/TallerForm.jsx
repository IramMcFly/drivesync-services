"use client";

import { useState, useEffect } from 'react';
import { FaTimes, FaMapMarkerAlt, FaPlus, FaTrash } from 'react-icons/fa';

export default function TallerForm({ taller = null, onSubmit, onCancel, isLoading = false }) {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    password: '',
    ubicacion: {
      lat: 0,
      lng: 0,
      direccion: ''
    },
    servicios: [],
    calificacion: 0
  });

  const [errors, setErrors] = useState({});
  const [availableServicios, setAvailableServicios] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(true);

  // Cargar servicios disponibles
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const response = await fetch('/api/servicios');
        if (response.ok) {
          const servicios = await response.json();
          setAvailableServicios(servicios);
        }
      } catch (error) {
        console.error('Error al cargar servicios:', error);
      } finally {
        setLoadingServicios(false);
      }
    };

    fetchServicios();
  }, []);

  useEffect(() => {
    if (taller) {
      // Extraer los IDs de los servicios si vienen como objetos (populate)
      const serviciosIds = taller.servicios ? 
        taller.servicios.map(servicio => 
          typeof servicio === 'string' ? servicio : servicio._id
        ) : [];

      setFormData({
        nombre: taller.nombre || '',
        direccion: taller.direccion || '',
        telefono: taller.telefono || '',
        email: taller.email || '',
        password: '', // No mostramos la contraseña existente
        ubicacion: taller.ubicacion || { lat: 0, lng: 0, direccion: '' },
        servicios: serviciosIds,
        calificacion: taller.calificacion || 0
      });
    }
  }, [taller]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleUbicacionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      ubicacion: {
        ...prev.ubicacion,
        [field]: value
      }
    }));
  };

  const handleServicioToggle = (servicioId) => {
    setFormData(prev => ({
      ...prev,
      servicios: prev.servicios.includes(servicioId)
        ? prev.servicios.filter(id => id !== servicioId)
        : [...prev.servicios, servicioId]
    }));
  };

  const isServicioSelected = (servicioId) => {
    return formData.servicios.includes(servicioId);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Solo validar contraseña si es un nuevo taller o si se está cambiando
    if (!taller && !formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.ubicacion.lat || !formData.ubicacion.lng) {
      newErrors.ubicacion = 'La ubicación (coordenadas) es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Preparar datos para envío
    const submitData = {
      ...formData,
      ubicacion: {
        ...formData.ubicacion,
        direccion: formData.ubicacion.direccion || formData.direccion
      }
    };

    // Si es edición, agregar el ID
    if (taller) {
      submitData._id = taller._id;
      // Si no se cambió la contraseña, no la enviamos
      if (!formData.password) {
        delete submitData.password;
      }
    }

    onSubmit(submitData);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            ubicacion: {
              ...prev.ubicacion,
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
        },
        (error) => {
          alert('Error al obtener la ubicación: ' + error.message);
        }
      );
    } else {
      alert('La geolocalización no es compatible con este navegador.');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {taller ? 'Editar Taller' : 'Nuevo Taller'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <FaTimes size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Taller *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                errors.telefono ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
          </div>
        </div>

        {/* Email y contraseña */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contraseña {taller ? '(dejar vacío para no cambiar)' : '*'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
        </div>

        {/* Dirección */}
        <div>
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dirección *
          </label>
          <textarea
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleInputChange}
            rows="3"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
              errors.direccion ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>}
        </div>

        {/* Ubicación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ubicación (Coordenadas) *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="lat" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Latitud
              </label>
              <input
                type="number"
                id="lat"
                step="any"
                value={formData.ubicacion.lat}
                onChange={(e) => handleUbicacionChange('lat', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="lng" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Longitud
              </label>
              <input
                type="number"
                id="lng"
                step="any"
                value={formData.ubicacion.lng}
                onChange={(e) => handleUbicacionChange('lng', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={getCurrentLocation}
                className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <FaMapMarkerAlt />
                Ubicación Actual
              </button>
            </div>
          </div>
          {errors.ubicacion && <p className="text-red-500 text-xs mt-1">{errors.ubicacion}</p>}
        </div>

        {/* Calificación (solo para edición) */}
        {taller && (
          <div>
            <label htmlFor="calificacion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Calificación (0-5)
            </label>
            <input
              type="number"
              id="calificacion"
              name="calificacion"
              min="0"
              max="5"
              step="0.1"
              value={formData.calificacion}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        )}

        {/* Servicios que ofrece el taller */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Servicios que Ofrece el Taller
          </label>
          
          {loadingServicios ? (
            <div className="flex items-center justify-center py-8 border border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Cargando servicios...</span>
            </div>
          ) : availableServicios.length === 0 ? (
            <div className="text-center py-8 border border-gray-300 dark:border-gray-600 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No hay servicios disponibles. Crea servicios primero.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Resumen de servicios seleccionados */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Servicios Seleccionados
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      {formData.servicios.length === 0 
                        ? 'No hay servicios seleccionados' 
                        : `${formData.servicios.length} de ${availableServicios.length} servicios seleccionados`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {formData.servicios.length}
                    </div>
                  </div>
                </div>
                
                {/* Lista de servicios seleccionados con nombres */}
                {formData.servicios.length > 0 ? (
                  <div className="space-y-2">
                    {formData.servicios.map((servicioId, index) => {
                      const servicio = availableServicios.find(s => s._id === servicioId);
                      return servicio ? (
                        <div 
                          key={servicioId}
                          className="flex items-center justify-between bg-blue-100 dark:bg-blue-900/40 rounded-lg p-3"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                {servicio.nombre}
                              </h5>
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                ${servicio.precioMin} - ${servicio.precioMax}
                                {servicio.subtipos?.length > 0 && ` • ${servicio.subtipos.length} variantes`}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleServicioToggle(servicioId)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-bold text-lg"
                            title="Quitar servicio"
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg">
                    <p className="text-blue-600 dark:text-blue-400 text-sm">
                      Selecciona servicios para que este taller los ofrezca
                    </p>
                  </div>
                )}
              </div>

              {/* Grid de servicios disponibles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableServicios.map((servicio) => {
                  const isSelected = isServicioSelected(servicio._id);
                  return (
                    <div
                      key={servicio._id}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md transform scale-[1.02]'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary/50 hover:shadow-sm'
                      }`}
                      onClick={() => handleServicioToggle(servicio._id)}
                    >
                      {/* Indicador de selección visual */}
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium mb-1 ${
                            isSelected 
                              ? 'text-primary dark:text-primary-light' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {servicio.nombre}
                          </h4>
                          
                          {servicio.descripcion && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {servicio.descripcion}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className={`px-2 py-1 rounded-full ${
                              isSelected 
                                ? 'bg-primary/20 text-primary dark:text-primary-light' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}>
                              ${servicio.precioMin} - ${servicio.precioMax}
                            </span>
                            {servicio.subtipos && servicio.subtipos.length > 0 && (
                              <span className={`px-2 py-1 rounded-full ${
                                isSelected 
                                  ? 'bg-primary/20 text-primary dark:text-primary-light' 
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}>
                                {servicio.subtipos.length} variantes
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Checkbox visual */}
                        <div className={`ml-3 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'border-primary bg-primary'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botones de acción rápida */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, servicios: availableServicios.map(s => s._id) }))}
                    className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                  >
                    Seleccionar Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, servicios: [] }))}
                    className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Limpiar Todo
                  </button>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Haz clic en un servicio para seleccionarlo
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : (taller ? 'Actualizar' : 'Crear Taller')}
          </button>
        </div>
      </form>
    </div>
  );
}
