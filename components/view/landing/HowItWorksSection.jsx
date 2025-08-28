"use client";

import { motion } from 'framer-motion';
import { 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaUserTie, 
  FaCheckCircle,
  FaArrowRight
} from 'react-icons/fa';

export default function HowItWorksSection() {
  const steps = [
    {
      icon: FaPhoneAlt,
      title: "1. Solicita el Servicio",
      description: "Agenda tu servicio a través de nuestra plataforma web o contáctanos directamente",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: FaMapMarkerAlt,
      title: "2. Ubicación Confirmada",
      description: "Confirma tu ubicación y nosotros asignamos al técnico más cercano disponible",
      color: "from-green-500 to-green-600"
    },
    {
      icon: FaUserTie,
      title: "3. Técnico en Camino",
      description: "Recibe la información del técnico y rastrea su ubicación en tiempo real",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: FaCheckCircle,
      title: "4. Servicio Completado",
      description: "El técnico realiza el trabajo y recibes confirmación con garantía incluida",
      color: "from-primary to-orange-500"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8
      }
    }
  };

  return (
    <section id="como-funciona" className="py-20 bg-gray-800">
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
              ¿Cómo funciona
            </span>
            <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent ml-3">
              DriveSync?
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Nuestro proceso es simple, rápido y confiable. En solo 4 pasos tendrás la asistencia que necesitas.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8 lg:space-y-12"
        >
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isEven = index % 2 === 0;
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${
                  isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`flex-1 text-center lg:text-${isEven ? 'left' : 'right'}`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-block"
                  >
                    <h3 className="font-semibold text-2xl lg:text-3xl text-white mb-4 hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                      {step.description}
                    </p>
                  </motion.div>
                </div>

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className={`w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center shadow-xl`}
                >
                  <IconComponent className="text-white text-3xl lg:text-4xl" />
                </motion.div>

                {/* Arrow (only show on desktop and not for last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 mt-20">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="text-primary text-2xl"
                    >
                      <FaArrowRight className="transform rotate-90" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Timeline for mobile */}
        <div className="lg:hidden mt-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="flex items-center space-x-2">
              {steps.map((_, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  {index < steps.length - 1 && (
                    <div className="w-8 h-0.5 bg-gray-600 mx-2"></div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <a href="/register/UserRegister" 
            className="inline-flex items-center bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 space-x-2">
            <span>Solicitar Servicio Ahora</span>
            <FaArrowRight />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
