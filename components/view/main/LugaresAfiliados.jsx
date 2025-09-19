"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaStar, 
  FaComment, 
  FaUser,
  FaWrench,
  FaClock,
  FaShieldAlt,
  FaEdit,
  FaTrash,
  FaHeart,
  FaEye,
  FaFilter,
  FaSearch
} from 'react-icons/fa';

export default function LugaresAfiliados() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [talleres, setTalleres] = useState([]);
  const [comentarios, setComentarios] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTaller, setSelectedTaller] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [calificacion, setCalificacion] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [redirectTimer, setRedirectTimer] = useState(null);

  useEffect(() => {
    // Limpiar el timer anterior si existe
    if (redirectTimer) {
      clearTimeout(redirectTimer);
    }

    if (status === "unauthenticated") {
      // Esperar un poco antes de redirigir para evitar problemas con la actualización de sesión
      const timer = setTimeout(() => {
        router.push("/login");
      }, 1000);
      setRedirectTimer(timer);
      return;
    }
    
    if (status === "authenticated") {
      // Limpiar cualquier timer de redirección si el usuario se autentica
      if (redirectTimer) {
        clearTimeout(redirectTimer);
        setRedirectTimer(null);
      }
      fetchTalleres();
    }

    // Cleanup function
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [status, router]);

  const fetchTalleres = async () => {
    try {
      const response = await fetch('/api/talleres');
      if (response.ok) {
        const data = await response.json();
        setTalleres(data);
        
        // Fetch comentarios para cada taller
        const comentariosData = {};
        for (const taller of data) {
          try {
            const commentsRes = await fetch(`/api/comentarios?tallerId=${taller._id}`);
            if (commentsRes.ok) {
              const comments = await commentsRes.json();
              comentariosData[taller._id] = comments;
            }
          } catch (error) {
            console.error(`Error fetching comments for taller ${taller._id}:`, error);
            comentariosData[taller._id] = [];
          }
        }
        setComentarios(comentariosData);
      }
    } catch (error) {
      console.error('Error fetching talleres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (tallerId) => {
    if (!nuevoComentario.trim()) return;
    
    setSubmittingComment(true);
    try {
      const response = await fetch('/api/comentarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tallerId,
          userId: session.user.id,
          comentario: nuevoComentario,
          calificacion: calificacion
        }),
      });

      if (response.ok) {
        setNuevoComentario('');
        setCalificacion(5);
        // Refresh comentarios
        fetchTalleres();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const calcularPromedioCalificacion = (tallerId) => {
    const comments = comentarios[tallerId] || [];
    if (comments.length === 0) return 0;
    const suma = comments.reduce((acc, comment) => acc + comment.calificacion, 0);
    return (suma / comments.length).toFixed(1);
  };

  const talleresFiltrados = talleres.filter(taller => {
    const matchesBusqueda = taller.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                           taller.direccion.toLowerCase().includes(busqueda.toLowerCase());
    return matchesBusqueda;
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando lugares afiliados...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center transition-colors">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acceso no autorizado</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Necesitas iniciar sesión para ver los lugares afiliados.</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-md transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-20 md:pb-0 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Lugares Afiliados</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Descubre nuestros talleres certificados y lee las experiencias de otros usuarios
          </p>
        </motion.div>

        {/* Filtros y Búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar talleres por nombre o ubicación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>
        </motion.div>

        {/* Grid de Talleres */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-6 shadow-lg animate-pulse">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talleresFiltrados.map((taller, index) => (
              <motion.div
                key={taller._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Header del Taller */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-orange-500 rounded-lg flex items-center justify-center">
                        <FaWrench className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {taller.nombre}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`text-sm ${
                                  i < Math.floor(calcularPromedioCalificacion(taller._id))
                                    ? 'text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ({calcularPromedioCalificacion(taller._id)})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información del Taller */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <FaMapMarkerAlt className="text-primary" />
                      <span className="text-sm">{taller.direccion}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <FaPhone className="text-primary" />
                      <span className="text-sm">{taller.telefono}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <FaEnvelope className="text-primary" />
                      <span className="text-sm">{taller.email}</span>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => setSelectedTaller(selectedTaller === taller._id ? null : taller._id)}
                      className="flex-1 bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <FaComment />
                      <span>Ver Comentarios ({comentarios[taller._id]?.length || 0})</span>
                    </button>
                    <button
                      onClick={() => window.open(`tel:${taller.telefono}`, '_self')}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors"
                    >
                      <FaPhone />
                    </button>
                  </div>
                </div>

                {/* Sección de Comentarios Expandible */}
                {selectedTaller === taller._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 bg-gray-50 dark:bg-gray-900"
                  >
                    {/* Lista de Comentarios */}
                    <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                      {comentarios[taller._id]?.length > 0 ? (
                        comentarios[taller._id].map((comentario, idx) => (
                          <div key={idx} className="bg-gray-800 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <FaUser className="text-gray-500" />
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {comentario.usuario?.nombre || 'Usuario'}
                                </span>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar
                                      key={i}
                                      className={`text-xs ${
                                        i < comentario.calificacion
                                          ? 'text-yellow-400'
                                          : 'text-gray-300 dark:text-gray-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(comentario.fecha).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {comentario.comentario}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No hay comentarios aún. ¡Sé el primero en comentar!
                        </p>
                      )}
                    </div>

                    {/* Formulario de Nuevo Comentario */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                        Deja tu comentario
                      </h4>
                      
                      {/* Selector de Calificación */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Calificación:</span>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setCalificacion(star)}
                              className={`text-lg ${
                                star <= calificacion ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                              } hover:text-yellow-400 transition-colors`}
                            >
                              <FaStar />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Textarea para comentario */}
                      <textarea
                        value={nuevoComentario}
                        onChange={(e) => setNuevoComentario(e.target.value)}
                        placeholder="Comparte tu experiencia con este taller..."
                        rows={3}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />

                      {/* Botón de Envío */}
                      <button
                        onClick={() => handleSubmitComment(taller._id)}
                        disabled={submittingComment || !nuevoComentario.trim()}
                        className="mt-3 w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        {submittingComment ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Enviando...</span>
                          </>
                        ) : (
                          <>
                            <FaComment />
                            <span>Enviar Comentario</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Mensaje cuando no hay talleres */}
        {!loading && talleresFiltrados.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FaMapMarkerAlt className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No se encontraron talleres
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {busqueda ? 'Intenta con otros términos de búsqueda' : 'Aún no hay talleres afiliados registrados'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
