"use client";

import Link from 'next/link';
import { FaArrowRight, FaCar, FaWrench, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Background Pattern - Adaptado para móvil */}
      <div className="absolute inset-0 opacity-5 sm:opacity-10">
        <div className="absolute top-16 sm:top-20 left-4 sm:left-10 text-4xl sm:text-6xl text-primary">
          <FaCar />
        </div>
        <div className="absolute top-32 sm:top-40 right-8 sm:right-20 text-3xl sm:text-4xl text-primary">
          <FaWrench />
        </div>
        <div className="absolute bottom-32 sm:bottom-40 left-8 sm:left-20 text-4xl sm:text-5xl text-primary">
          <FaClock />
        </div>
        <div className="absolute bottom-16 sm:bottom-20 right-4 sm:right-10 text-2xl sm:text-3xl text-primary">
          <FaCar />
        </div>
        {/* Elementos adicionales para móvil */}
        <div className="absolute top-1/2 left-2 text-2xl text-primary/30 sm:hidden">
          <FaWrench />
        </div>
        <div className="absolute top-1/3 right-2 text-2xl text-primary/30 sm:hidden">
          <FaClock />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center pt-8 sm:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          {/* Main Title - Optimizado para móvil */}
          <h1 className="font-montserrat font-black text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 sm:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent block">
              Tu Asistente
            </span>
            <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent block mt-1 sm:mt-0">
              Automotriz
            </span>
          </h1>

          {/* 24/7 Badge - Mejorado para móvil */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center bg-primary/20 border-2 border-primary/50 rounded-full px-4 py-2 sm:px-6 sm:py-3 mb-6 sm:mb-8 shadow-lg shadow-primary/25 relative"
          >
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
            <span className="text-primary font-bold text-base sm:text-lg md:text-xl relative z-10">24/7</span>
            <span className="text-primary/80 text-xs sm:text-sm ml-2 font-medium relative z-10">DISPONIBLE</span>
          </motion.div>

          {/* Subtitle - Optimizado para móvil */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-5xl mx-auto leading-relaxed px-2"
          >
            <span className="block sm:inline">Servicios de emergencia vehiculares, diagnóstico y más.</span>
            <br className="hidden sm:block" />
            <span className="block sm:inline mt-2 sm:mt-0">
              <span className="text-primary font-semibold text-lg sm:text-xl md:text-2xl">
                Llegamos donde estés, cuando lo necesites
              </span>
            </span>
          </motion.p>

          {/* CTA Buttons - Mejorados para móvil */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col gap-4 sm:gap-6 justify-center items-center px-4"
          >
            <Link href="/register/UserRegister" 
              className="group bg-primary hover:bg-primary-hover text-white px-6 py-4 sm:px-8 sm:py-5 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 flex items-center space-x-2 w-full max-w-xs sm:max-w-none sm:w-auto justify-center transform hover:scale-105">
              <span>Comenzar Ahora</span>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link href="/register/TallerRegister" 
              className="group border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-4 sm:px-8 sm:py-5 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 flex items-center space-x-2 w-full max-w-xs sm:max-w-none sm:w-auto justify-center">
              <FaWrench className="group-hover:rotate-12 transition-transform" />
              <span>Registra tu Taller</span>
            </Link>
          </motion.div>

          {/* Stats - Optimizados para móvil */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-4xl mx-auto px-4"
          >
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">500+</div>
              <div className="text-gray-400 text-xs sm:text-sm leading-tight">Servicios<br className="sm:hidden" /> Completados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">15min</div>
              <div className="text-gray-400 text-xs sm:text-sm leading-tight">Tiempo<br className="sm:hidden" /> Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">98%</div>
              <div className="text-gray-400 text-xs sm:text-sm leading-tight">Satisfacción</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator - Mejorado para móvil */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex flex-col items-center">
          <span className="text-gray-400 text-xs sm:text-sm mb-2 font-medium">Desliza hacia abajo</span>
          <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-2 sm:h-3 bg-gray-400 rounded-full mt-1 sm:mt-2 animate-bounce"></div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
