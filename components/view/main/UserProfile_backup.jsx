"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { FaUserAlt, FaEnvelope, FaPhone, FaImage, FaLock, FaSave, FaEdit, FaCheck, FaTimes, FaCar, FaTools, FaSignOutAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { Modal } from "../../ui";
import { useModal } from "../../../hooks/useModal";
import VehicleManager from "./VehicleManager";

export default function UserProfile() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [editField, setEditField] = useState(null);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef();
  const { modalState, showSuccess, showError, showWarning, hideModal } = useModal();

  // Verificar autenticación con delay
  useEffect(() => {
    if (status === "unauthenticated") {
      const timer = setTimeout(() => {
        setShowUnauthorized(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === "authenticated") {
      setShowUnauthorized(false);
    }
  }, [status]);

  // Cargar datos del usuario autenticado
  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/users?id=${encodeURIComponent(session.user.email)}`)
        .then(async res => {
          const data = await res.json();
          setUser(data);
          setNombre(data.nombre || "");
          setTelefono(data.telefono || "");
          
          if (data.foto) {
            setFotoPreview(data.foto);
          }
        })
        .catch(err => {
          console.error('Error al cargar usuario:', err);
          setError('Error al cargar los datos del usuario');
        });
    }
  }, [session]);

  // Función para guardar cambios de un campo específico
  const handleSaveField = async (field) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      
      if (field === 'nombre') {
        if (!nombre.trim()) {
          showError('El nombre es requerido');
          setLoading(false);
          return;
        }
        formData.append('nombre', nombre.trim());
      }
      
      if (field === 'telefono') {
        if (!telefono.trim()) {
          showError('El teléfono es requerido');
          setLoading(false);
          return;
        }
        if (telefono.length !== 10) {
          showError('El teléfono debe tener exactamente 10 dígitos');
          setLoading(false);
          return;
        }
        formData.append('telefono', telefono);
      }
      
      if (field === 'foto') {
        if (foto) {
          formData.append('foto', foto);
        }
      }

      if (field === 'password') {
        if (!password) {
          showError('La contraseña es requerida');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          showError('La contraseña debe tener al menos 6 caracteres');
          setLoading(false);
          return;
        }
        formData.append('password', password);
      }

      const res = await fetch('/api/users', {
        method: 'PUT',
        body: formData,
      });

      if (res.ok) {
        showSuccess('Datos actualizados correctamente');
        setEditField(null);
        setPassword("");
        
        // Recargar datos del usuario
        const userData = await fetch(`/api/users?id=${encodeURIComponent(session.user.email)}`);
        const updatedUser = await userData.json();
        setUser(updatedUser);
        
        if (field === 'foto' && updatedUser.foto) {
          setFotoPreview(updatedUser.foto);
        }
      } else {
        const data = await res.json();
        showError(data.error || 'Error al actualizar');
      }
    } catch (err) {
      showError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditField(null);
    setNombre(user?.nombre || "");
    setTelefono(user?.telefono || "");
    setFoto(null);
    setPassword("");
    setError("");
    setSuccess("");
    setShowPasswordModal(false);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const handlePasswordModalSave = () => {
    setPasswordError("");
    if (!newPassword || newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }
    setPassword(newPassword);
    setShowPasswordModal(false);
    handleSaveField("password");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center text-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" && showUnauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center text-gray-100">
          <p className="text-red-400 text-lg">No estás autenticado</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" && !showUnauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center text-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center text-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header con diseño mejorado */}
      <div className="safe-area-top relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-600/10 to-purple-600/20"></div>
        <div className="relative bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 px-6 py-6">
          <div className="text-center">
            <h1 className="font-montserrat font-black text-3xl bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Mi Perfil
            </h1>
            <p className="text-gray-300 text-sm mt-2 font-medium">Gestiona tu información personal y preferencias</p>
          </div>
        </div>
      </div>
      
      {/* Content con nuevo layout */}
      <div className="flex-1 px-4 sm:px-6 py-8 sm:py-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Card de Perfil Principal */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 p-6 lg:p-8 h-fit">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-full animate-pulse"></div>
                    <img
                      src={fotoPreview || "/window.svg"}
                      alt="Foto de perfil"
                      className="relative w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-full border-4 border-gray-800 bg-gray-700 shadow-2xl"
                    />
                    <button
                      type="button"
                      onClick={() => setEditField('foto') || fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 bg-gradient-to-r from-primary to-blue-500 text-white w-12 h-12 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center group"
                      title="Cambiar foto"
                    >
                      <FaEdit size={16} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={e => {
                        if (e.target.files[0]) {
                          setFoto(e.target.files[0]);
                          handleSaveField('foto');
                        }
                      }}
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-3 w-full">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                      {user.nombre}
                    </h2>
                    <p className="text-gray-400 flex items-center gap-2 justify-center">
                      <FaEnvelope className="text-primary" />
                      <span className="truncate">{user.email}</span>
                    </p>
                    
                    {/* Estadísticas rápidas */}
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-700/50 mt-6">
                      <div className="text-center p-4 bg-gray-700/30 rounded-2xl">
                        <FaCar className="text-2xl text-primary mx-auto mb-2" />
                        <div className="text-xl font-bold text-gray-100">{vehicleCount}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Vehículos</div>
                      </div>
                      <div className="text-center p-4 bg-gray-700/30 rounded-2xl">
                        <FaTools className="text-2xl text-green-400 mx-auto mb-2" />
                        <div className="text-xl font-bold text-gray-100">12</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Servicios</div>
                      </div>
                    </div>
                    
                    {/* Botón de cerrar sesión */}
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="w-full mt-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <FaSignOutAlt />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards de Información */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Card de Información Personal */}
              <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-500 rounded-xl flex items-center justify-center">
                    <FaUserAlt className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-100">Información Personal</h3>
                    <p className="text-gray-400 text-sm">Gestiona tus datos personales</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Campo de Nombre */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <FaUserAlt className="text-primary" />
                      Nombre completo
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        placeholder="Tu nombre completo"
                        className={`w-full h-14 px-4 pr-16 rounded-2xl border-2 transition-all duration-200 outline-none text-base font-medium ${
                          editField === 'nombre' 
                            ? 'border-primary bg-gray-700/80 text-gray-100 shadow-lg shadow-primary/20' 
                            : 'border-gray-600/50 bg-gray-700/50 text-gray-100 hover:border-gray-500'
                        } ${editField !== 'nombre' ? 'cursor-default' : ''}`}
                        required
                        autoComplete="name"
                        disabled={editField !== 'nombre' || loading}
                      />
                      {editField === 'nombre' ? (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleSaveField('nombre')}
                            disabled={loading}
                            className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
                            title="Guardar"
                          >
                            <FaCheck size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
                            title="Cancelar"
                          >
                            <FaTimes size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditField('nombre')}
                          disabled={loading}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-600 hover:bg-primary text-white rounded-full flex items-center justify-center transition-all hover:scale-110 group-hover:bg-primary"
                          title="Editar nombre"
                        >
                          <FaEdit size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Campo de Email */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <FaEnvelope className="text-primary" />
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user.email}
                        className="w-full h-14 px-4 pr-12 rounded-2xl border-2 border-gray-600/50 bg-gray-700/30 text-gray-400 cursor-not-allowed font-medium"
                        disabled
                        autoComplete="email"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <FaLock className="text-gray-500" size={14} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <FaLock className="text-gray-500" size={10} />
                      El email no se puede modificar por seguridad
                    </p>
                  </div>

                  {/* Campo de Teléfono */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <FaPhone className="text-primary" />
                      Teléfono
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={telefono}
                        onChange={e => setTelefono(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
                        placeholder="Tu número de teléfono"
                        className={`w-full h-14 px-4 pr-16 rounded-2xl border-2 transition-all duration-200 outline-none text-base font-medium ${
                          editField === 'telefono' 
                            ? 'border-primary bg-gray-700/80 text-gray-100 shadow-lg shadow-primary/20' 
                            : 'border-gray-600/50 bg-gray-700/50 text-gray-100 hover:border-gray-500'
                        } ${editField !== 'telefono' ? 'cursor-default' : ''}`}
                        required
                        autoComplete="tel"
                        maxLength={10}
                        pattern="\d{10}"
                        disabled={editField !== 'telefono' || loading}
                      />
                      {editField === 'telefono' ? (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleSaveField('telefono')}
                            disabled={loading}
                            className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
                            title="Guardar"
                          >
                            <FaCheck size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
                            title="Cancelar"
                          >
                            <FaTimes size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditField('telefono')}
                          disabled={loading}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-600 hover:bg-primary text-white rounded-full flex items-center justify-center transition-all hover:scale-110 group-hover:bg-primary"
                          title="Editar teléfono"
                        >
                          <FaEdit size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card de Seguridad */}
              <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <FaLock className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-100">Seguridad</h3>
                    <p className="text-gray-400 text-sm">Gestiona tu contraseña y privacidad</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Cambiar Contraseña */}
                  <div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border-2 border-red-500/50 hover:border-red-400 text-gray-100 py-4 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-3"
                    >
                      <FaLock className="text-red-400" />
                      Cambiar Contraseña
                    </button>
                  </div>
                </div>
              </div>

              {/* Card de Vehículos */}
              <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <FaCar className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-100">Mis Vehículos</h3>
                    <p className="text-gray-400 text-sm">Gestiona tus vehículos registrados</p>
                  </div>
                </div>
                
                <VehicleManager onVehicleCountChange={setVehicleCount} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de cambio de contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLock className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-2">Cambiar Contraseña</h3>
              <p className="text-gray-400">Introduce tu nueva contraseña</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Introduce tu nueva contraseña"
                    className="w-full h-14 px-4 pr-12 rounded-2xl border-2 border-gray-600 bg-gray-700 text-gray-100 outline-none focus:border-primary transition-all"
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Confirmar contraseña
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full h-14 px-4 rounded-2xl border-2 border-gray-600 bg-gray-700 text-gray-100 outline-none focus:border-primary transition-all"
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              
              {passwordError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                  <div className="text-red-600 dark:text-red-400 text-sm font-medium">
                    {passwordError}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-8">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-2xl font-semibold transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePasswordModalSave}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600 text-white rounded-2xl font-semibold transition-all shadow-lg"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        showCancel={modalState.showCancel}
      />
    </div>
  );
}