
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FaUserAlt, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    let email = identifier;
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
    });
    if (result.error) {
      setError('Credenciales incorrectas');
    } else {
      router.push('/main/servicios-express');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="safe-area-top header-mobile px-6 py-4">
        <div className="text-center">
          <h1 className="font-montserrat font-black text-2xl text-primary">DriveSync</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Bienvenido de vuelta</p>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-sm mx-auto">
          <div className="card-mobile">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Iniciar Sesión</h2>
              <p className="text-gray-600 dark:text-gray-400">Ingresa tus credenciales para continuar</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email/Phone Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email o Teléfono
                </label>
                <div className="input-container">
                  <div className="input-icon-left">
                    <FaUserAlt className="text-gray-400 dark:text-gray-500" size={16} />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="tu@email.com o 5512345678"
                    className="input-mobile"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña
                </label>
                <div className="input-container">
                  <div className="input-icon-left">
                    <FaLock className="text-gray-400 dark:text-gray-500" size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    className="input-mobile"
                    required
                    autoComplete="current-password"
                  />
                  <div className="input-icon-right">
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <div className="text-red-600 dark:text-red-400 text-sm font-medium">
                    {error}
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
                    Ingresando...
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>
          </div>
          
          {/* Footer Links */}
          <div className="mt-8 text-center space-y-4">
            <div className="text-gray-600 dark:text-gray-400">
              ¿No tienes cuenta?{' '}
              <a
                href="/register/UserRegister"
                className="text-primary font-semibold hover:text-primary-hover transition-colors"
              >
                Regístrate aquí
              </a>
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              ¿Eres un taller?{' '}
              <a
                href="/register/TallerRegister"
                className="text-primary font-semibold hover:text-primary-hover transition-colors"
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
