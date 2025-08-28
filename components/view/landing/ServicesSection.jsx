"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaWrench, FaBatteryHalf, FaCar, FaOilCan, FaTachometerAlt, FaTools } from 'react-icons/fa';

export default function ServicesSection() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Servicios por defecto con iconos
  const serviciosDefault = [
    {
      nombre: "Mecánica Express",
      descripcion: "Reparaciones mecánicas rápidas en el lugar",
      icon: FaWrench,
      color: "from-blue-500 to-blue-600"
    },
    {
      nombre: "Cambio de Batería",
      descripcion: "Reemplazo e instalación de baterías",
      icon: FaBatteryHalf,
      color: "from-green-500 to-green-600"
    },
    {
      nombre: "Diagnóstico",
      descripcion: "Escaneo completo del sistema vehicular",
      icon: FaTachometerAlt,
      color: "from-purple-500 to-purple-600"
    },
    {
      nombre: "Cambio de Aceite",
      descripcion: "Servicio completo de lubricación",
      icon: FaOilCan,
      color: "from-yellow-500 to-yellow-600"
    },
    {
      nombre: "Asistencia Vial",
      descripcion: "Auxilio mecánico 24/7 donde te encuentres",
      icon: FaCar,
      color: "from-red-500 to-red-600"
    },
    {
      nombre: "Mantenimiento",
      descripcion: "Servicios preventivos y correctivos",
      icon: FaTools,
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const response = await fetch('/api/servicios');
        if (response.ok) {
          const data = await response.json();
          
          // Combinar servicios de la API con los predeterminados
          const serviciosConIconos = data.map((servicio, index) => ({
            ...servicio,
            icon: serviciosDefault[index]?.icon || FaWrench,
            color: serviciosDefault[index]?.color || "from-primary to-orange-500"
          }));
          
          setServicios(serviciosConIconos);
        } else {
          // Si falla la API, usar servicios por defecto
          setServicios(serviciosDefault);
        }
      } catch (error) {
        console.error('Error fetching servicios:', error);
        setServicios(serviciosDefault);
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section id="servicios" className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-montserrat font-black text-3xl sm:text-4xl lg:text-5xl mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Nuestros
            </span>
            <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent ml-3">
              Servicios
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Ofrecemos una amplia gama de servicios automotrices profesionales para mantener tu vehículo en perfecto estado
          </p>
        </motion.div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-700 rounded-xl p-6 animate-pulse">
                <div className="w-12 h-12 bg-gray-600 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-600 rounded mb-3"></div>
                <div className="h-4 bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {servicios.map((servicio, index) => {
              const IconComponent = servicio.icon;
              return (
                <motion.div
                  key={servicio._id || index}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.3 } }}
                  className="group bg-gray-700 hover:bg-gray-600 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 border border-gray-600 hover:border-primary/30"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${servicio.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="text-white text-xl" />
                  </div>
                  
                  <h3 className="font-semibold text-xl text-white mb-3 group-hover:text-primary transition-colors">
                    {servicio.nombre}
                  </h3>
                  
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {servicio.descripcion || "Servicio profesional disponible 24/7"}
                  </p>
                  
                  {servicio.precioMin && (
                    <div className="mt-4 text-primary font-semibold">
                      Desde ${servicio.precioMin} MXN
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a href="/register/UserRegister" 
            className="inline-flex items-center bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25">
            Ver Todos los Servicios
          </a>
        </motion.div>
      </div>
    </section>
  );
}
