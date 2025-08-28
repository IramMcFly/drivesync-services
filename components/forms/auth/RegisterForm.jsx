"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FaUserAlt, 
  FaLock, 
  FaEnvelope, 
  FaPhone, 
  FaImage, 
  FaEye, 
  FaEyeSlash,
  FaClock,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaHeadset,
  FaMoneyBillWave,
  FaStar,
  FaCar,
  FaCheckCircle,
  FaArrowLeft,
  FaTimes
} from 'react-icons/fa';
import Link from 'next/link';

export default function RegisterForm() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [foto, setFoto] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!/^\d{10}$/.test(telefono)) {
      setError('El teléfono debe tener 10 dígitos');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('email', email);
      formData.append('telefono', telefono);
      formData.append('password', password);
      if (foto) {
        formData.append('foto', foto);
      }
      formData.append('role', 'cliente');
      const res = await fetch('/api/users', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Usuario registrado exitosamente');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        console.error('Error del servidor:', data);
        let errorMessage = data.error || 'Error al registrar usuario';
        if (data.details && Array.isArray(data.details)) {
          errorMessage = data.details.join(', ');
        }
        setError(errorMessage);
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: FaClock,
      title: "Asistencia 24/7",
      description: "Servicio de emergencia disponible las 24 horas del día",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: FaMapMarkerAlt,
      title: "Servicio a Domicilio",
      description: "Llegamos hasta donde estés, sin necesidad de mover tu vehículo",
      color: "from-green-500 to-green-600"
    },
    {
      icon: FaShieldAlt,
      title: "Garantía Incluida",
      description: "Todos nuestros servicios incluyen garantía completa",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: FaMoneyBillWave,
      title: "Precios Transparentes",
      description: "Sin costos ocultos, conoce el precio antes del servicio",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: FaHeadset,
      title: "Soporte Premium",
      description: "Atención personalizada y seguimiento en tiempo real",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Benefits Section - Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 text-6xl text-primary">
            <FaCar />
          </div>
          <div className="absolute bottom-20 right-10 text-4xl text-primary">
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
                ¡Bienvenido a la mejor experiencia automotriz!
              </h2>
              <p className="text-xl text-gray-300">
                Únete a miles de conductores que ya confían en nosotros
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-6">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${benefit.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="text-white text-lg" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-12 grid grid-cols-3 gap-6"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">500+</div>
                <div className="text-gray-400 text-sm">Servicios</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">15min</div>
                <div className="text-gray-400 text-sm">Respuesta</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-2xl font-bold text-primary mr-1">4.9</span>
                  <FaStar className="text-yellow-400 text-sm" />
                </div>
                <div className="text-gray-400 text-sm">Rating</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      {/* Form Section - Right Side */}
      <div className="flex-1 lg:w-1/2 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors">
              <FaArrowLeft />
              <span>Volver</span>
            </Link>
            <div className="flex items-center space-x-2">
              <FaCar className="text-primary text-xl" />
              <span className="font-montserrat font-black text-xl text-white">DriveSync</span>
            </div>
          </div>
        </div>

        {/* Mobile Benefits - Show on mobile only */}
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
              <div className="text-white text-sm font-medium">Garantía</div>
              <div className="text-gray-400 text-xs">Incluida</div>
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
              <h2 className="text-3xl font-bold text-white mb-2">Crear cuenta</h2>
              <p className="text-gray-400">Únete a DriveSync y disfruta de la mejor asistencia automotriz</p>
            </div>

            {/* Mobile Title */}
            <div className="lg:hidden mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-100 mb-2">Crear cuenta</h2>
              <p className="text-gray-400">Completa tus datos para comenzar</p>
            </div>

            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-5">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre completo *
                </label>
                <div className="relative">
                  <FaUserAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full h-12 pl-12 pr-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Correo electrónico *
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full h-12 pl-12 pr-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              
              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Teléfono *
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                  <input
                    type="tel"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
                    placeholder="5512345678"
                    className="w-full h-12 pl-12 pr-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    required
                    autoComplete="tel"
                    maxLength={10}
                    pattern="\d{10}"
                  />
                </div>
              </div>
              
              {/* Foto */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Foto de perfil (opcional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setFoto(e.target.files[0])}
                    className="w-full h-12 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>
              
              {/* Contraseña */}
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
                    placeholder="Mínimo 6 caracteres"
                    className="w-full h-12 pl-12 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>
              
              {/* Confirmar contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar contraseña *
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="w-full h-12 pl-12 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>
              
              {/* Messages */}
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
              
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-900/20 border border-green-800 rounded-lg p-4"
                >
                  <div className="text-green-400 text-sm font-medium flex items-center">
                    <FaCheckCircle className="mr-2" />
                    {success}
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
                    Registrando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <FaCheckCircle className="mr-2" />
                    Crear Cuenta
                  </div>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-4">
              <div className="text-gray-400">
                ¿Ya tienes cuenta?{' '}
                <Link
                  href="/login"
                  className="text-primary font-semibold hover:text-primary-hover transition-colors"
                >
                  Inicia sesión
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}
