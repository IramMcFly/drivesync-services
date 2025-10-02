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
  FaSearch,
  FaCheckCircle
} from 'react-icons/fa';

export default function LugaresAfiliados() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [talleres, setTalleres] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTaller, setSelectedTaller] = useState(null);
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
        
        // Fetch ratings para cada taller
        const ratingsData = {};
        for (const taller of data) {
          try {
            const ratingsRes = await fetch(`/api/ratings?tallerId=${taller._id}`);
            if (ratingsRes.ok) {
              const ratingsInfo = await ratingsRes.json();
              ratingsData[taller._id] = ratingsInfo;
            }
          } catch (error) {
            console.error(`Error fetching ratings for taller ${taller._id}:`, error);
            ratingsData[taller._id] = { taller: { rating: 0, totalRatings: 0 }, ratings: [] };
          }
        }
        setRatings(ratingsData);
      }
    } catch (error) {
      console.error('Error fetching talleres:', error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerRatingPromedio = (tallerId) => {
    const tallerRatings = ratings[tallerId];
    if (!tallerRatings || !tallerRatings.taller) return 0;
    return tallerRatings.taller.rating || 0;
  };

  const obtenerTotalRatings = (tallerId) => {
    const tallerRatings = ratings[tallerId];
    if (!tallerRatings || !tallerRatings.taller) return 0;
    return tallerRatings.taller.totalRatings || 0;
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
                                  i < Math.floor(obtenerRatingPromedio(taller._id))
                                    ? 'text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ({obtenerRatingPromedio(taller._id).toFixed(1)}) • {obtenerTotalRatings(taller._id)} reseñas
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
                      <span>Ver Reseñas ({obtenerTotalRatings(taller._id)})</span>
                    </button>
                    <button
                      onClick={() => window.open(`tel:${taller.telefono}`, '_self')}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors"
                    >
                      <FaPhone />
                    </button>
                  </div>
                </div>

                {/* Sección de Reseñas Expandible */}
                {selectedTaller === taller._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 bg-gray-50 dark:bg-gray-900"
                  >
                    {/* Estadísticas del Taller */}
                    <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Estadísticas de Calificaciones
                      </h4>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">
                            {obtenerRatingPromedio(taller._id).toFixed(1)}
                          </div>
                          <div className="flex items-center justify-center mb-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`text-lg ${
                                  i < Math.floor(obtenerRatingPromedio(taller._id))
                                    ? 'text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {obtenerTotalRatings(taller._id)} reseñas
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const ratingsForStar = ratings[taller._id]?.ratings?.filter(r => r.rating === rating).length || 0;
                              const percentage = obtenerTotalRatings(taller._id) > 0 ? (ratingsForStar / obtenerTotalRatings(taller._id)) * 100 : 0;
                              return (
                                <div key={rating} className="flex items-center space-x-2 text-sm">
                                  <span className="w-8">{rating}★</span>
                                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="bg-yellow-400 rounded-full h-2 transition-all duration-300"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="w-8 text-gray-600 dark:text-gray-400">{ratingsForStar}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lista de Reseñas */}
                    <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                      {ratings[taller._id]?.ratings?.length > 0 ? (
                        ratings[taller._id].ratings.map((rating, idx) => (
                          <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <FaUser className="text-gray-500" />
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {rating.usuario?.nombre || 'Usuario'}
                                </span>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar
                                      key={i}
                                      className={`text-xs ${
                                        i < rating.rating
                                          ? 'text-yellow-400'
                                          : 'text-gray-300 dark:text-gray-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(rating.fechaCalificacion).toLocaleDateString()}
                              </span>
                            </div>
                            {rating.comentario && (
                              <p className="text-gray-700 dark:text-gray-300 text-sm">
                                {rating.comentario}
                              </p>
                            )}
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                              <FaCheckCircle className="text-green-500" />
                              <span>Servicio verificado</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FaComment className="text-4xl text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 mb-2">
                            No hay reseñas aún para este taller
                          </p>
                          <p className="text-sm text-gray-400">
                            Las reseñas aparecen aquí cuando los clientes califican los servicios completados
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Información sobre cómo dejar reseñas */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <FaShieldAlt className="text-blue-500 mt-1" />
                          <div>
                            <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                              Reseñas Verificadas
                            </h5>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              Solo los clientes que han completado un servicio pueden dejar una reseña. 
                              Esto garantiza que todas las calificaciones sean auténticas y basadas en experiencias reales.
                            </p>
                          </div>
                        </div>
                      </div>
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
