"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowRight, FaUserPlus, FaSignInAlt, FaCar, FaWrench } from 'react-icons/fa';

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-primary/10 to-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-6xl text-primary">
          <FaCar />
        </div>
        <div className="absolute top-32 right-20 text-4xl text-primary">
          <FaWrench />
        </div>
        <div className="absolute bottom-32 left-1/4 text-5xl text-primary">
          <FaCar />
        </div>
        <div className="absolute bottom-10 right-10 text-3xl text-primary">
          <FaWrench />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="font-montserrat font-black text-3xl sm:text-4xl lg:text-6xl mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              ¿Listo para experimentar
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
              la mejor asistencia automotriz?
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Únete a miles de conductores que ya confían en DriveSync para mantener sus vehículos en perfecto estado. 
            Tu tranquilidad en la carretera está a un clic de distancia.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
        >
          <Link href="/register/UserRegister" 
            className="group bg-primary hover:bg-primary-hover text-white px-8 py-5 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 flex items-center space-x-3 min-w-[250px] justify-center transform hover:scale-105">
            <FaUserPlus className="group-hover:scale-110 transition-transform" />
            <span>Registrarse</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link href="/login" 
            className="group border-2 border-gray-500 hover:border-primary text-gray-300 hover:text-primary px-8 py-5 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center space-x-3 min-w-[250px] justify-center hover:bg-primary/10">
            <FaSignInAlt className="group-hover:scale-110 transition-transform" />
            <span>Ya tengo cuenta</span>
          </Link>
        </motion.div>

        {/* Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCar className="text-white text-2xl" />
            </div>
            <h3 className="font-semibold text-white mb-2">Servicio Inmediato</h3>
            <p className="text-gray-400 text-sm">Asistencia en menos de 15 minutos</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaWrench className="text-white text-2xl" />
            </div>
            <h3 className="font-semibold text-white mb-2">Técnicos Expertos</h3>
            <p className="text-gray-400 text-sm">Personal certificado y experimentado</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaArrowRight className="text-white text-2xl" />
            </div>
            <h3 className="font-semibold text-white mb-2">Proceso Simple</h3>
            <p className="text-gray-400 text-sm">Solo 4 pasos para recibir ayuda</p>
          </div>
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          viewport={{ once: true }}
          className="mt-12 inline-flex items-center bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-full px-6 py-3 space-x-3"
        >
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="w-4 h-4 bg-yellow-400 rounded-full"></div>
            ))}
          </div>
          <span className="text-gray-300 text-sm">+500 clientes satisfechos</span>
        </motion.div>
      </div>
    </section>
  );
}
