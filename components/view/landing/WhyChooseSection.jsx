"use client";

import { motion } from 'framer-motion';
import { 
  FaClock, 
  FaMapMarkerAlt, 
  FaShieldAlt, 
  FaUserTie, 
  FaMoneyBillWave, 
  FaStar,
  FaPhoneAlt,
  FaTools
} from 'react-icons/fa';

export default function WhyChooseSection() {
  const features = [
    {
      icon: FaClock,
      title: "Disponibilidad 24/7",
      description: "Servicio de emergencia las 24 horas del día, los 7 días de la semana",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: FaMapMarkerAlt,
      title: "Servicio a Domicilio",
      description: "Llegamos hasta donde estés, no necesitas mover tu vehículo",
      color: "from-green-500 to-green-600"
    },
    {
      icon: FaUserTie,
      title: "Técnicos Certificados",
      description: "Personal altamente capacitado y con certificaciones profesionales",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: FaShieldAlt,
      title: "Garantía Asegurada",
      description: "Todos nuestros servicios incluyen garantía y seguro de responsabilidad",
      color: "from-red-500 to-red-600"
    },
    {
      icon: FaMoneyBillWave,
      title: "Precios Transparentes",
      description: "Sin costos ocultos, conoce el precio exacto antes del servicio",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: FaPhoneAlt,
      title: "Seguimiento en Tiempo Real",
      description: "Rastrea a tu técnico y mantente informado del progreso",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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
    <section className="py-20 bg-gray-900">
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
              ¿Por qué elegir
            </span>
            <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent ml-3">
              DriveSync?
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Somos más que un servicio automotriz, somos tu compañero confiable en la carretera. 
            Descubre lo que nos hace únicos.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="group bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 border border-gray-700 hover:border-primary/30"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="text-white text-2xl" />
                </div>
                
                <h3 className="font-semibold text-xl text-white mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-2xl p-8 border border-primary/30"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-gray-300 font-medium">Servicios Completados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-gray-300 font-medium">Técnicos Certificados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">15min</div>
              <div className="text-gray-300 font-medium">Tiempo de Respuesta</div>
            </div>
            <div className="flex items-center justify-center">
              <div>
                <div className="flex items-center justify-center mb-2">
                  <span className="text-4xl font-bold text-primary mr-2">4.9</span>
                  <FaStar className="text-yellow-400 text-2xl" />
                </div>
                <div className="text-gray-300 font-medium">Calificación Promedio</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
