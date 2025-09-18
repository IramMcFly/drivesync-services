"use client";

import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaImage, FaTimes } from 'react-icons/fa';

export default function ServiceForm({ servicio = null, onSubmit, onCancel, isLoading = false }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precioMin: '',
    precioMax: '',
    subtipos: [],
    imagen: null
  });
  const [newSubtipo, setNewSubtipo] = useState({ nombre: '', precio: '' });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (servicio) {
      setFormData({
        nombre: servicio.nombre || '',
        descripcion: servicio.descripcion || '',
        precioMin: servicio.precioMin?.toString() || '',
        precioMax: servicio.precioMax?.toString() || '',
        subtipos: servicio.subtipos || [],
        imagen: null // No mostramos la imagen existente en el input
      });
      
      // Si el servicio tiene imagen, podríamos mostrar una preview
      if (servicio.imagen) {
        // Convertir buffer a blob URL si es necesario
        // setPreviewImage(URL.createObjectURL(new Blob([servicio.imagen])));
      }
    }
  }, [servicio]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imagen: file
      }));
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSubtipo = () => {
    if (newSubtipo.nombre.trim() && newSubtipo.precio) {
      setFormData(prev => ({
        ...prev,
        subtipos: [...prev.subtipos, {
          nombre: newSubtipo.nombre.trim(),
          precio: parseFloat(newSubtipo.precio)
        }]
      }));
      setNewSubtipo({ nombre: '', precio: '' });
    }
  };

  const removeSubtipo = (index) => {
    setFormData(prev => ({
      ...prev,
      subtipos: prev.subtipos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre.trim()) {
      alert('El nombre del servicio es requerido');
      return;
    }
    
    if (!formData.precioMin || !formData.precioMax) {
      alert('Los precios mínimo y máximo son requeridos');
      return;
    }
    
    if (parseFloat(formData.precioMin) > parseFloat(formData.precioMax)) {
      alert('El precio mínimo no puede ser mayor al precio máximo');
      return;
    }

    // Preparar datos para envío
    const submitData = {
      ...formData,
      precioMin: parseFloat(formData.precioMin),
      precioMax: parseFloat(formData.precioMax),
      subtipos: formData.subtipos
    };

    if (servicio) {
      submitData._id = servicio._id;
    }

    onSubmit(submitData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {servicio ? 'Editar Servicio' : 'Nuevo Servicio'}
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
              Nombre del Servicio *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Precios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="precioMin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Precio Mínimo ($) *
            </label>
            <input
              type="number"
              id="precioMin"
              name="precioMin"
              value={formData.precioMin}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label htmlFor="precioMax" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Precio Máximo ($) *
            </label>
            <input
              type="number"
              id="precioMax"
              name="precioMax"
              value={formData.precioMax}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
        </div>

        {/* Imagen */}
        <div>
          <label htmlFor="imagen" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Imagen del Servicio
          </label>
          <div className="flex items-center space-x-4">
            <label htmlFor="imagen" className="cursor-pointer flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <FaImage />
              <span>Seleccionar Imagen</span>
            </label>
            <input
              type="file"
              id="imagen"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {previewImage && (
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setFormData(prev => ({ ...prev, imagen: null }));
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Subtipos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subtipos de Servicio
          </label>
          
          {/* Agregar nuevo subtipo */}
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              placeholder="Nombre del subtipo"
              value={newSubtipo.nombre}
              onChange={(e) => setNewSubtipo(prev => ({ ...prev, nombre: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            />
            <input
              type="number"
              placeholder="Precio"
              value={newSubtipo.precio}
              onChange={(e) => setNewSubtipo(prev => ({ ...prev, precio: e.target.value }))}
              min="0"
              step="0.01"
              className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            />
            <button
              type="button"
              onClick={addSubtipo}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              <FaPlus />
            </button>
          </div>

          {/* Lista de subtipos */}
          {formData.subtipos.length > 0 && (
            <div className="space-y-2">
              {formData.subtipos.map((subtipo, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {subtipo.nombre}
                    </span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      ${subtipo.precio}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSubtipo(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
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
            {isLoading ? 'Guardando...' : (servicio ? 'Actualizar' : 'Crear Servicio')}
          </button>
        </div>
      </form>
    </div>
  );
}