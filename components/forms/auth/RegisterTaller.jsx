"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserAlt, FaLock, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEye, FaEyeSlash, FaTools, FaCog } from 'react-icons/fa';

export default function RegisterTaller() {
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/servicios')
      .then(res => res.json())
      .then(data => setServicios(data))
      .catch(() => setServicios([]));
  }, []);

  const toggleServicio = (servicioId) => {
    setServiciosSeleccionados(prev =>
      prev.includes(servicioId)
        ? prev.filter(id => id !== servicioId)
        : [...prev, servicioId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!/^\d{10}$/.test(telefono)) {
      setError('El teléfono debe tener 10 dígitos');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (serviciosSeleccionados.length === 0) {
      setError('Selecciona al menos un servicio');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/talleres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          direccion,
          telefono,
          email,
          password,
          servicios: serviciosSeleccionados,
          activo: false, // Los talleres necesitan aprobación
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Solicitud enviada exitosamente. Esperando aprobación.');
        setTimeout(() => router.push('/'), 3000);
      } else {
        setError(data.error || 'Error al enviar solicitud');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
      {/* Header */}
      <div className="safe-area-top bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors">
        <div className="text-center">
          <h1 className="font-montserrat font-black text-2xl text-primary">DriveSync</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 transition-colors">Registro de taller</p>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-sm mx-auto">
          <div className="card-mobile">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">Registra tu taller</h2>
              <p className="text-gray-600 dark:text-gray-400 transition-colors">Únete a nuestra red de talleres</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Selección de servicios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors">
                  Servicios que ofreces
                </label>
                <div className="flex flex-wrap gap-2">
                  {servicios.length === 0 && (
                    <span className="text-gray-400 dark:text-gray-500 text-sm transition-colors">Cargando servicios...</span>
                  )}
                  {servicios.map(servicio => (
                    <button
                      type="button"
                      key={servicio._id}
                      onClick={() => toggleServicio(servicio._id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        serviciosSeleccionados.includes(servicio._id)
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary'
                      }`}
                    >
                      {servicio.nombre}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Nombre del taller */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Nombre del taller
                </label>
                <div className="relative">
                  <FaTools className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm transition-colors" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Taller Automotriz XYZ"
                    className="input-mobile pl-12"
                    required
                    autoComplete="organization"
                  />
                </div>
              </div>
              
              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Dirección completa
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm transition-colors" />
                  <input
                    type="text"
                    value={direccion}
                    onChange={e => setDireccion(e.target.value)}
                    placeholder="Calle, número, colonia, ciudad..."
                    className="input-mobile pl-12"
                    required
                  />
                </div>
              </div>
              
              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Teléfono del taller
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm transition-colors" />
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
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Correo electrónico
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="contacto@taller.com"
                    className="input-mobile pl-12"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              
              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Contraseña
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm transition-colors" />
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
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>
              
              {/* Confirmar contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm transition-colors" />
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
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>
              
              {/* Messages */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 transition-colors">
                  <div className="text-red-600 dark:text-red-400 text-sm font-medium transition-colors">
                    {error}
                  </div>
                </div>
              )}
              
              {message && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 transition-colors">
                  <div className="text-green-600 dark:text-green-400 text-sm font-medium transition-colors">
                    {message}
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
                  'Registrar taller'
                )}
              </button>
            </form>
          </div>
          
          {/* Footer Links */}
          <div className="mt-8 text-center space-y-4">
            <div className="text-gray-600 dark:text-gray-400 transition-colors">
              ¿Ya tienes cuenta?{' '}
              <a
                href="/"
                className="text-primary font-semibold hover:text-primary-hover transition-colors"
              >
                Inicia sesión
              </a>
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm transition-colors">
              ¿Eres usuario?{' '}
              <a
                href="/register/UserRegister"
                className="text-primary font-semibold hover:text-primary-hover transition-colors"
              >
                Regístrate como usuario
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
