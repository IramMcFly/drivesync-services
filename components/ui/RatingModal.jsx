// components/ui/RatingModal.jsx
'use client';

import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import Modal from './Modal';

const RatingModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  tallerNombre, 
  serviceId,
  tallerId,
  isLoading = false 
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    setError('');
    
    try {
      await onSubmit({
        tallerId,
        serviceRequestId: serviceId,
        rating,
        comentario: comentario.trim()
      });
      
      // Reset form after successful submission
      setRating(0);
      setHoverRating(0);
      setComentario('');
    } catch (err) {
      setError(err.message || 'Error al enviar la calificación');
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setComentario('');
    setError('');
    onClose();
  };

  const StarRating = ({ currentRating, onRatingChange, onHover, onLeave }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-3xl transition-colors duration-200 ${
              star <= (hoverRating || currentRating)
                ? 'text-yellow-400'
                : 'text-gray-300'
            } hover:text-yellow-400`}
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => onHover(star)}
            onMouseLeave={onLeave}
          >
            <FaStar />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Califica tu experiencia">
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ¿Cómo fue tu experiencia con {tallerNombre}?
          </h3>
          <p className="text-gray-600">
            Tu opinión nos ayuda a mejorar el servicio
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Stars */}
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Calificación *
            </label>
            <StarRating
              currentRating={rating}
              onRatingChange={setRating}
              onHover={setHoverRating}
              onLeave={() => setHoverRating(0)}
            />
            <div className="mt-2 text-sm text-gray-500">
              {rating === 0 && 'Selecciona una calificación'}
              {rating === 1 && 'Muy malo'}
              {rating === 2 && 'Malo'}
              {rating === 3 && 'Regular'}
              {rating === 4 && 'Bueno'}
              {rating === 5 && 'Excelente'}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label 
              htmlFor="comentario" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Comentario (opcional)
            </label>
            <textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Cuéntanos sobre tu experiencia con el servicio..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {comentario.length}/500 caracteres
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || rating === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Enviando...' : 'Enviar Calificación'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RatingModal;