"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaRegStar, FaTimes, FaCheckCircle, FaComment, FaThumbsUp } from 'react-icons/fa';

export default function ServiceRatingModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  serviceData, 
  tallerData 
}) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        rating,
        comentario,
        serviceId: serviceData._id,
        tallerId: serviceData.taller._id,
        clienteId: serviceData.cliente._id
      });
      
      // Mostrar mensaje de éxito
      setShowSuccess(true);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error al enviar calificación:', error);
      // Mostrar un mensaje de error más específico
      const errorMessage = error.message || 'Error al enviar la calificación. Inténtalo de nuevo.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const ratingTexts = [
    '',
    'Muy malo',
    'Malo', 
    'Regular',
    'Bueno',
    'Excelente'
  ];

  const ratingDescriptions = [
    '',
    'El servicio fue muy deficiente y no cumplió las expectativas',
    'El servicio tuvo varios problemas importantes',
    'El servicio fue aceptable pero puede mejorar',
    'El servicio fue bueno y cumplió las expectativas',
    'El servicio fue excepcional, superó las expectativas'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          {showSuccess ? (
            // Mensaje de éxito
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-green-500 text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                ¡Calificación Enviada!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Tu calificación se ha guardado exitosamente. Gracias por ayudar a mejorar nuestros servicios.
              </p>
              <div className="flex items-center justify-center space-x-1 text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  star <= rating ? (
                    <FaStar key={star} className="text-xl" />
                  ) : (
                    <FaRegStar key={star} className="text-xl" />
                  )
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {ratingTexts[rating]}
              </p>
            </motion.div>
          ) : (
            // Modal original de calificación
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-green-500 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    ¡Servicio Completado!
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Califica tu experiencia
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Service Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Servicio:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {serviceData?.servicio?.nombre || 'Servicio general'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Taller:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {tallerData?.nombre || serviceData?.taller?.nombre || 'Taller'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Costo:</span>
                  <span className="text-sm font-bold text-primary">
                    ${serviceData?.precio?.toFixed(2) || '0.00'} MXN
                  </span>
                </div>
              </div>
            </div>

            {/* Rating Section */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  ¿Cómo calificarías el servicio?
                </label>
                
                {/* Stars */}
                <div className="flex items-center justify-center space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      {(hoveredRating || rating) >= star ? (
                        <FaStar className="text-yellow-400 text-3xl" />
                      ) : (
                        <FaRegStar className="text-gray-300 dark:text-gray-600 text-3xl" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Rating text */}
                {(hoveredRating || rating) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {ratingTexts[hoveredRating || rating]}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {ratingDescriptions[hoveredRating || rating]}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Comment Section */}
              <div>
                <label htmlFor="comentario" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comentarios adicionales (opcional)
                </label>
                <div className="relative">
                  <FaComment className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    id="comentario"
                    rows={3}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Comparte tu experiencia para ayudar a otros usuarios..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                    maxLength={500}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {comentario.length}/500 caracteres
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
                >
                  Omitir calificación
                </button>
                <button
                  type="submit"
                  disabled={rating === 0 || loading}
                  className="flex-1 py-3 px-4 bg-primary hover:bg-primary-hover disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FaThumbsUp />
                      <span>Enviar calificación</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Rating requirement note */}
            {rating === 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                * La calificación es obligatoria para continuar
              </p>
            )}
          </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}