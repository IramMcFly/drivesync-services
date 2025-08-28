
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  FaUserAlt, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaTools, 
  FaUser,
  FaClock,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaHeadset,
  FaMoneyBillWave,
  FaStar,
  FaCar,
  FaSignInAlt,
  FaArrowLeft,
  FaTimes,
  FaCheckCircle,
  FaWrench
} from 'react-icons/fa';
import Link from 'next/link';

export default function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('usuario'); // 'usuario' o 'taller'
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    let email = identifier;
    
    if (userType === 'taller') {
      // Para talleres, buscar por email directamente
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(identifier)) {
        setError('Para talleres, ingresa un email válido');
        setLoading(false);
        return;
      }
      
      const result = await signIn('credentials', {
        redirect: false,
        email: identifier,
        password,
        userType: 'taller'
      });
      
      if (result?.error) {
        setError('Credenciales incorrectas');
      } else if (result?.ok) {
        // Esperar a que NextAuth actualice la sesión y luego redirigir
        await new Promise(resolve => setTimeout(resolve, 500));
        window.location.href = '/taller/dashboard';
      } else {
        setError('Error en el inicio de sesión');
      }
    } else {
      // Lógica original para usuarios
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(identifier)) {
        try {
          const res = await fetch('/api/users?id=' + encodeURIComponent(identifier));
          if (res.ok) {
            const user = await res.json();
            email = user.email;
          } else {
            setError('Usuario no encontrado');
            setLoading(false);
            return;
          }
        } catch {
          setError('Error de conexión');
          setLoading(false);
          return;
        }
      }
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        userType: 'usuario'
      });
      
      if (result?.error) {
        setError('Credenciales incorrectas');
      } else if (result?.ok) {
        // Esperar a que NextAuth actualice la sesión
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          const sessionRes = await fetch('/api/auth/session');
          const sessionData = await sessionRes.json();
          
          // Redirigir según el rol del usuario
          if (sessionData?.user?.role === 'asistente') {
            window.location.href = '/asistente';
          } else if (sessionData?.user?.role === 'admin') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/main/servicios-express';
          }
        } catch (error) {
          console.error('Error obteniendo sesión:', error);
          // Fallback a la página principal
          window.location.href = '/main/servicios-express';
        }
      } else {
        setError('Error en el inicio de sesión');
      }
    }
    
    setLoading(false);
  };

  const features = [
    {
      icon: FaClock,
      title: "Disponible 24/7",
      description: "Asistencia automotriz cuando la necesites",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: FaMapMarkerAlt,
      title: "Servicio a Domicilio",
      description: "Llegamos hasta donde te encuentres",
      color: "from-green-500 to-green-600"
    },
    {
      icon: FaShieldAlt,
      title: "Técnicos Certificados",
      description: "Personal profesional y confiable",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: FaMoneyBillWave,
      title: "Precios Justos",
      description: "Tarifas transparentes sin sorpresas",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: FaHeadset,
      title: "Soporte Premium",
      description: "Atención personalizada y seguimiento",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Welcome Section - Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 text-6xl text-primary">
            <FaCar />
          </div>
          <div className="absolute top-40 right-20 text-4xl text-primary">
            <FaWrench />
          </div>
          <div className="absolute bottom-40 left-20 text-5xl text-primary">
            <FaClock />
          </div>
          <div className="absolute bottom-20 right-10 text-3xl text-primary">
            <FaCar />
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <FaCar className="text-primary text-3xl" />
                <span className="font-montserrat font-black text-3xl text-white">
                  DriveSync
                </span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                ¡Bienvenido de vuelta!
              </h2>
              <p className="text-xl text-gray-300">
                Tu asistente automotriz te está esperando
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="text-white text-lg" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-12 p-6 bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-xl border border-primary/30"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">500+</div>
                  <div className="text-gray-400 text-sm">Clientes Activos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">15min</div>
                  <div className="text-gray-400 text-sm">Tiempo Respuesta</div>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <span className="text-2xl font-bold text-primary mr-1">4.9</span>
                    <FaStar className="text-yellow-400 text-sm" />
                  </div>
                  <div className="text-gray-400 text-sm">Calificación</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      {/* Login Form Section - Right Side */}
      <div className="flex-1 lg:w-1/2 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors">
              <FaArrowLeft />
              <span>Inicio</span>
            </Link>
            <div className="flex items-center space-x-2">
              <FaCar className="text-primary text-xl" />
              <span className="font-montserrat font-black text-xl text-white">DriveSync</span>
            </div>
          </div>
        </div>

        {/* Mobile Features - Show on mobile only */}
        <div className="lg:hidden px-6 py-6 bg-gray-800 border-b border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <FaClock className="text-primary text-2xl mx-auto mb-2" />
              <div className="text-white text-sm font-medium">24/7</div>
              <div className="text-gray-400 text-xs">Disponible</div>
            </div>
            <div className="text-center">
              <FaMapMarkerAlt className="text-primary text-2xl mx-auto mb-2" />
              <div className="text-white text-sm font-medium">A Domicilio</div>
              <div className="text-gray-400 text-xs">Donde estés</div>
            </div>
            <div className="text-center">
              <FaShieldAlt className="text-primary text-2xl mx-auto mb-2" />
              <div className="text-white text-sm font-medium">Certificados</div>
              <div className="text-gray-400 text-xs">Profesionales</div>
            </div>
            <div className="text-center">
              <FaStar className="text-primary text-2xl mx-auto mb-2" />
              <div className="text-white text-sm font-medium">4.9★</div>
              <div className="text-gray-400 text-xs">Rating</div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-12 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md"
          >
            {/* Desktop Header */}
            <div className="hidden lg:block mb-8">
              <Link href="/" className="inline-flex items-center space-x-2 text-gray-400 hover:text-primary transition-colors mb-6">
                <FaArrowLeft />
                <span>Volver al inicio</span>
              </Link>
              <h2 className="text-3xl font-bold text-white mb-2">Iniciar Sesión</h2>
              <p className="text-gray-400">Accede a tu cuenta y gestiona tus servicios automotrices</p>
            </div>

            {/* Mobile Title */}
            <div className="lg:hidden mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-100 mb-2">Bienvenido de vuelta</h2>
              <p className="text-gray-400">Ingresa tus credenciales para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selector de tipo de usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Tipo de cuenta
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType('usuario')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      userType === 'usuario'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <FaUser size={24} />
                    <span className="text-sm font-medium">Usuario</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('taller')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      userType === 'taller'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <FaTools size={24} />
                    <span className="text-sm font-medium">Taller</span>
                  </button>
                </div>
              </div>

              {/* Email/Phone Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {userType === 'taller' ? 'Email del Taller *' : 'Email o Teléfono *'}
                </label>
                <div className="relative">
                  <FaUserAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder={userType === 'taller' ? 'taller@email.com' : 'tu@email.com o 5512345678'}
                    className="w-full h-12 pl-12 pr-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    className="w-full h-12 pl-12 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>
              
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-900/20 border border-red-800 rounded-lg p-4"
                >
                  <div className="text-red-400 text-sm font-medium flex items-center">
                    <FaTimes className="mr-2" />
                    {error}
                  </div>
                </motion.div>
              )}
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 transform hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Ingresando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <FaSignInAlt className="mr-2" />
                    Iniciar Sesión
                  </div>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-4">
              <div className="text-gray-400">
                ¿No tienes cuenta?{' '}
                <Link
                  href="/register/UserRegister"
                  className="text-primary font-semibold hover:text-primary-hover transition-colors"
                >
                  Regístrate aquí
                </Link>
              </div>
              <div className="text-gray-400 text-sm">
                ¿Eres un taller?{' '}
                <Link
                  href="/register/TallerRegister"
                  className="text-primary font-semibold hover:text-primary-hover transition-colors"
                >
                  Registra tu taller
                </Link>
              </div>
            </div>

            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-full px-4 py-2 space-x-2">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, index) => (
                    <FaStar key={index} className="w-3 h-3 text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-300 text-xs">Confianza de +500 usuarios</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
