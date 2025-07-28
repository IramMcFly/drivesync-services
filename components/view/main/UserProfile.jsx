"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { FaUserAlt, FaEnvelope, FaPhone, FaImage, FaLock, FaSave, FaEdit, FaCheck, FaTimes } from "react-icons/fa";

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
  const fileInputRef = useRef();

  // Cargar datos del usuario autenticado
  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/users?id=${encodeURIComponent(session.user.email)}`)
        .then(async res => {
          const data = await res.json();
          setUser(data);
          setNombre(data.nombre || "");
          setTelefono(data.telefono || "");
          
          if (data.foto && data.foto.data) {
            try {
              const byteArray = new Uint8Array(data.foto.data);
              const blob = new Blob([byteArray], { type: 'image/png' });
              const url = URL.createObjectURL(blob);
              setFotoPreview(url);
            } catch (error) {
              console.error('Error al procesar la foto:', error);
            }
          }
        })
        .catch(error => {
          console.error('Error al cargar el usuario:', error);
          setError('Error al cargar los datos del usuario');
        });
    }
  }, [session]);

  // Manejar cambio de foto
  useEffect(() => {
    if (foto) {
      const url = URL.createObjectURL(foto);
      setFotoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [foto]);

  const handleSaveField = async (field) => {
    if (!user) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append('id', user._id);

      if (field === 'nombre') {
        formData.append('nombre', nombre);
      } else if (field === 'telefono') {
        if (!/^\d{10}$/.test(telefono)) {
          setError('El teléfono debe tener 10 dígitos');
          setLoading(false);
          return;
        }
        formData.append('telefono', telefono);
      } else if (field === 'foto' && foto) {
        formData.append('foto', foto);
      } else if (field === 'password') {
        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
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
        setSuccess('Datos actualizados correctamente');
        setEditField(null);
        setPassword("");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Error al actualizar');
      }
    } catch (err) {
      setError('Error de conexión');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center text-gray-900 dark:text-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center text-gray-900 dark:text-gray-100">
          <p className="text-red-500 dark:text-red-400">No estás autenticado</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center text-gray-900 dark:text-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
      {/* Header */}
      <div className="safe-area-top bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors">
        <div className="text-center">
          <h1 className="font-montserrat font-black text-2xl text-primary">Mi Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 transition-colors">Gestiona tu información personal</p>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-sm mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            {/* Foto de perfil */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <img
                  src={fotoPreview || "/window.svg"}
                  alt="Foto de perfil"
                  className="w-24 h-24 object-cover rounded-full border-4 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 shadow-lg transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setEditField('foto') || fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-primary text-white w-10 h-10 rounded-full shadow-lg hover:bg-primary-hover transition-colors flex items-center justify-center"
                  title="Cambiar foto"
                >
                  <FaEdit size={14} />
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-4 transition-colors">{user.nombre}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors">{user.email}</p>
            </div>

            <div className="space-y-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Nombre completo
                </label>
                <div className="relative">
                  <FaUserAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm transition-colors" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Tu nombre completo"
                    className={`w-full h-14 pl-12 pr-12 rounded-xl border-2 transition-all outline-none ${
                      editField === 'nombre' 
                        ? 'border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
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
                        className="text-green-600 hover:text-green-700 transition-colors"
                        title="Guardar"
                      >
                        <FaCheck size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Cancelar"
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditField('nombre')}
                      disabled={loading}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="Editar nombre"
                    >
                      <FaEdit size={16} />
                    </button>
                  )}
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
                    value={user.email}
                    className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors cursor-not-allowed"
                    disabled
                    autoComplete="email"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">El email no se puede modificar</p>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Teléfono
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm transition-colors" />
                  <input
                    type="tel"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
                    placeholder="Tu número de teléfono"
                    className={`w-full h-14 pl-12 pr-12 rounded-xl border-2 transition-all outline-none ${
                      editField === 'telefono' 
                        ? 'border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
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
                        className="text-green-600 hover:text-green-700 transition-colors"
                        title="Guardar"
                      >
                        <FaCheck size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Cancelar"
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditField('telefono')}
                      disabled={loading}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="Editar teléfono"
                    >
                      <FaEdit size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Cambiar contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full text-left"
                >
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm transition-colors" />
                    <div className="w-full h-14 pl-12 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-pointer flex items-center transition-colors">
                      ••••••••
                    </div>
                    <FaEdit className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors" size={16} />
                  </div>
                </button>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 transition-colors">
                <div className="text-red-600 dark:text-red-400 text-sm font-medium transition-colors">
                  {error}
                </div>
              </div>
            )}
            
            {success && (
              <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 transition-colors">
                <div className="text-green-600 dark:text-green-400 text-sm font-medium transition-colors">
                  {success}
                </div>
              </div>
            )}

            {/* Cerrar sesión */}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full mt-8 bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {/* Modal cambiar contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl transition-colors">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center transition-colors">Cambiar contraseña</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full h-14 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors outline-none focus:border-primary"
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    className="w-full h-14 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors outline-none focus:border-primary"
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                
                {passwordError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 transition-colors">
                    <div className="text-red-600 dark:text-red-400 text-sm font-medium transition-colors">
                      {passwordError}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handlePasswordModalSave}
                  className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
