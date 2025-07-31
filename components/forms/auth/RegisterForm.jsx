"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserAlt, FaLock, FaEnvelope, FaPhone, FaImage } from 'react-icons/fa';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

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
      formData.append('role', 'cliente'); // Cambiado de 'user' a 'cliente'
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

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="safe-area-top bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="text-center">
          <h1 className="font-montserrat font-black text-2xl text-primary">DriveSync</h1>
          <p className="text-gray-400 text-sm mt-1">Crear cuenta nueva</p>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-sm mx-auto">
          <div className="card-mobile">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-100 mb-2">Registro</h2>
              <p className="text-gray-400">Completa tus datos para comenzar</p>
            </div>
            
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-5">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre completo
                </label>
                <div className="relative">
                  <FaUserAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="input-mobile pl-12"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="input-mobile pl-12"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              
              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                  <input
                    type="tel"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
                    placeholder="5512345678"
                    className="input-mobile pl-12"
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
                    className="w-full h-14 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-100 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
              
              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="input-mobile pl-12 pr-12"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
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
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="input-mobile pl-12 pr-12"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>
              
              {/* Messages */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <div className="text-red-600 dark:text-red-400 text-sm font-medium">
                    {error}
                  </div>
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <div className="text-green-600 dark:text-green-400 text-sm font-medium">
                    {success}
                  </div>
                </div>
              )}
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-mobile bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </div>
                ) : (
                  'Crear Cuenta'
                )}
              </button>
            </form>
          </div>
          
          {/* Footer Links */}
          <div className="mt-8 text-center space-y-4">
            <div className="text-gray-400">
              ¿Ya tienes cuenta?{' '}
              <a
                href="/"
                className="text-primary font-semibold hover:text-primary-hover"
              >
                Inicia sesión
              </a>
            </div>
            <div className="text-gray-400 text-sm">
              ¿Eres un taller?{' '}
              <a
                href="/register/TallerRegister"
                className="text-primary font-semibold hover:text-primary-hover"
              >
                Registra tu taller
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
