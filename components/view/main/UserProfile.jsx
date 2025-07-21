
"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { FaUserAlt, FaEnvelope, FaPhone, FaImage, FaLock, FaSave, FaEdit, FaCheck, FaTimes } from "react-icons/fa";

const COLORS = {
  primary: '#FF4500',
  secondary: '#4B2E19',
  background: '#181818',
  text: '#fff',
  error: '#FF6347',
  inputBg: '#232323',
  inputBorder: '#333',
};

export default function UserProfile() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [editField, setEditField] = useState(null); // 'nombre', 'telefono', 'foto', 'password'
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
          // Si la respuesta es JSON, parsea normalmente
          const data = await res.json();
          setUser(data);
          setNombre(data.nombre || "");
          setTelefono(data.telefono || "");
          // Si hay foto binaria, conviértela a Blob URL
          if (data.foto && data.foto.data) {
            try {
              // data.foto.data es un array de bytes
              const byteArray = new Uint8Array(data.foto.data);
              const blob = new Blob([byteArray], { type: 'image/png' });
              const url = URL.createObjectURL(blob);
              setFotoPreview(url);
              // Limpia el objeto URL cuando cambie el usuario
              return () => URL.revokeObjectURL(url);
            } catch {}
          } else {
            setFotoPreview(null);
          }
        });
    }
  }, [session]);

  // Preview de la foto
  useEffect(() => {
    if (foto) {
      const url = URL.createObjectURL(foto);
      setFotoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [foto]);

  if (status === "loading") {
    return <div style={{ color: COLORS.text, textAlign: 'center', marginTop: 40 }}>Cargando perfil...</div>;
  }
  if (!session) {
    return <div style={{ color: COLORS.text, textAlign: 'center', marginTop: 40 }}>Debes iniciar sesión para ver tu perfil.</div>;
  }
  if (!user) {
    return <div style={{ color: COLORS.text, textAlign: 'center', marginTop: 40 }}>Cargando datos de usuario...</div>;
  }

  const handleCancel = () => {
    setEditField(null);
    setNombre(user.nombre || "");
    setTelefono(user.telefono || "");
    setFoto(null);
    if (user.foto && user.foto.data) {
      const byteArray = new Uint8Array(user.foto.data);
      const blob = new Blob([byteArray], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      setFotoPreview(url);
    } else {
      setFotoPreview(null);
    }
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setError("");
    setSuccess("");
    setShowPasswordModal(false);
  };

  // Guardar campo individual
  const handleSaveField = async (field) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("_id", user._id);
      formData.append("email", user.email);
      // Siempre enviar los campos requeridos
      formData.append("nombre", nombre);
      formData.append("telefono", telefono);
      if (field === "foto" && foto) formData.append("foto", foto);
      if (field === "password" && password) formData.append("password", password);

      const res = await fetch("/api/users", {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al actualizar perfil");
        setLoading(false);
        return;
      }
      setSuccess("Perfil actualizado correctamente");
      setUser({ ...user, nombre, telefono, foto: foto ? true : user.foto });
      setEditField(null);
      setPassword("");
      setFoto(null);
      if (foto) setFotoPreview(URL.createObjectURL(foto));
    } catch (err) {
      setError("Error de conexión");
    }
    setLoading(false);
  };

  // Modal para cambio de contraseña
  const handlePasswordModalSave = () => {
    setPasswordError("");
    if (!newPassword || !confirmPassword) {
      setPasswordError("Debes ingresar y confirmar la nueva contraseña.");
      return;
    }
    if (newPassword.length < 6) {
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
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: COLORS.background,
      padding: '2vw',
    }}>
      <div style={{
        marginBottom: 18,
        textAlign: 'center',
      }}>
        <span style={{
          fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
          fontWeight: 900,
          fontSize: 36,
          color: COLORS.primary,
          letterSpacing: 2,
          textShadow: '0 2px 8px rgba(255,69,0,0.10)',
          textTransform: 'uppercase',
          display: 'block',
        }}>
          Mi Perfil
        </span>
      </div>
      <form
        style={{
          background: COLORS.inputBg,
          color: COLORS.text,
          padding: '2rem',
          borderRadius: '18px',
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
        encType="multipart/form-data"
        onSubmit={e => e.preventDefault()}
      >
        {/* Foto de perfil */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', width: 110, height: 110 }}>
            <img
              src={fotoPreview || "/window.svg"}
              alt="Foto de perfil"
              style={{
                width: 110,
                height: 110,
                objectFit: 'cover',
                borderRadius: '50%',
                border: `3px solid ${COLORS.primary}`,
                background: COLORS.inputBg,
                cursor: 'pointer',
              }}
              onClick={() => setEditField('foto') || fileInputRef.current?.click()}
            />
            <button
              type="button"
              onClick={() => setEditField('foto') || fileInputRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: COLORS.primary,
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: COLORS.text,
                cursor: 'pointer',
                boxShadow: '0 2px 8px 0 rgba(255,69,0,0.10)',
              }}
              title="Cambiar foto"
            >
              <FaEdit />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={e => {
                if (e.target.files[0]) {
                  setFoto(e.target.files[0]);
                  handleSaveField('foto');
                }
              }}
              disabled={loading}
            />
          </div>
        </div>
        {/* Nombre */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <FaUserAlt style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: COLORS.secondary, fontSize: 18 }} />
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Nombre completo"
            style={{
              width: '100%',
              padding: '0.85rem 0.85rem 0.85rem 2.5rem',
              marginBottom: 4,
              border: `1.5px solid ${COLORS.inputBorder}`,
              borderRadius: 8,
              background: COLORS.inputBg,
              color: COLORS.text,
              fontSize: 16,
              outline: 'none',
              transition: 'border 0.2s',
              opacity: editField === 'nombre' ? 1 : 0.7,
            }}
            required
            autoComplete="name"
            disabled={editField !== 'nombre' || loading}
          />
          {editField === 'nombre' ? (
            <>
              <button
                type="button"
                onClick={() => handleSaveField('nombre')}
                disabled={loading}
                style={{ marginLeft: 8, background: 'none', border: 'none', color: COLORS.primary, fontSize: 22, cursor: 'pointer' }}
                title="Guardar"
              >
                <FaCheck />
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                style={{ marginLeft: 2, background: 'none', border: 'none', color: COLORS.error, fontSize: 22, cursor: 'pointer' }}
                title="Cancelar"
              >
                <FaTimes />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditField('nombre')}
              style={{ marginLeft: 8, background: 'none', border: 'none', color: COLORS.primary, fontSize: 22, cursor: 'pointer' }}
              title="Editar nombre"
            >
              <FaEdit />
            </button>
          )}
        </div>
        {/* Email (solo lectura) */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <FaEnvelope style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: COLORS.secondary, fontSize: 18 }} />
          <input
            type="email"
            value={user.email}
            readOnly
            placeholder="Correo electrónico"
            style={{
              width: '100%',
              padding: '0.85rem 0.85rem 0.85rem 2.5rem',
              marginBottom: 4,
              border: `1.5px solid ${COLORS.inputBorder}`,
              borderRadius: 8,
              background: COLORS.inputBg,
              color: COLORS.text,
              fontSize: 16,
              outline: 'none',
              transition: 'border 0.2s',
              opacity: 0.7,
            }}
            autoComplete="email"
            disabled
          />
        </div>
        {/* Teléfono */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <FaPhone style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: COLORS.secondary, fontSize: 18 }} />
          <input
            type="tel"
            value={telefono}
            onChange={e => setTelefono(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="Teléfono (10 dígitos)"
            style={{
              width: '100%',
              padding: '0.85rem 0.85rem 0.85rem 2.5rem',
              marginBottom: 4,
              border: `1.5px solid ${COLORS.inputBorder}`,
              borderRadius: 8,
              background: COLORS.inputBg,
              color: COLORS.text,
              fontSize: 16,
              outline: 'none',
              transition: 'border 0.2s',
              opacity: editField === 'telefono' ? 1 : 0.7,
            }}
            required
            autoComplete="tel"
            maxLength={10}
            pattern="\d{10}"
            disabled={editField !== 'telefono' || loading}
          />
          {editField === 'telefono' ? (
            <>
              <button
                type="button"
                onClick={() => handleSaveField('telefono')}
                disabled={loading}
                style={{ marginLeft: 8, background: 'none', border: 'none', color: COLORS.primary, fontSize: 22, cursor: 'pointer' }}
                title="Guardar"
              >
                <FaCheck />
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                style={{ marginLeft: 2, background: 'none', border: 'none', color: COLORS.error, fontSize: 22, cursor: 'pointer' }}
                title="Cancelar"
              >
                <FaTimes />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditField('telefono')}
              style={{ marginLeft: 8, background: 'none', border: 'none', color: COLORS.primary, fontSize: 22, cursor: 'pointer' }}
              title="Editar teléfono"
            >
              <FaEdit />
            </button>
          )}
        </div>
        {/* Contraseña */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <FaLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: COLORS.secondary, fontSize: 18 }} />
          <input
            type="password"
            value={password ? '********' : ''}
            placeholder="Nueva contraseña (opcional)"
            style={{
              width: '100%',
              padding: '0.85rem 0.85rem 0.85rem 2.5rem',
              marginBottom: 4,
              border: `1.5px solid ${COLORS.inputBorder}`,
              borderRadius: 8,
              background: COLORS.inputBg,
              color: COLORS.text,
              fontSize: 16,
              outline: 'none',
              transition: 'border 0.2s',
              opacity: 0.7,
            }}
            minLength={6}
            autoComplete="new-password"
            disabled
          />
          <button
            type="button"
            onClick={() => { setShowPasswordModal(true); setEditField('password'); }}
            style={{ marginLeft: 8, background: 'none', border: 'none', color: COLORS.primary, fontSize: 22, cursor: 'pointer' }}
            title="Editar contraseña"
          >
            <FaEdit />
          </button>
        </div>
        {/* Modal para cambio de contraseña */}
        {showPasswordModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              background: COLORS.inputBg,
              padding: 32,
              borderRadius: 16,
              minWidth: 320,
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              alignItems: 'center',
            }}>
              <h3 style={{ color: COLORS.primary, marginBottom: 8 }}>Cambiar contraseña</h3>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  border: `1.5px solid ${COLORS.inputBorder}`,
                  borderRadius: 8,
                  background: COLORS.background,
                  color: COLORS.text,
                  fontSize: 16,
                  outline: 'none',
                  marginBottom: 8,
                }}
                minLength={6}
                autoComplete="new-password"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirmar contraseña"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  border: `1.5px solid ${COLORS.inputBorder}`,
                  borderRadius: 8,
                  background: COLORS.background,
                  color: COLORS.text,
                  fontSize: 16,
                  outline: 'none',
                  marginBottom: 8,
                }}
                minLength={6}
                autoComplete="new-password"
              />
              {passwordError && <div style={{ color: COLORS.error, marginBottom: 4, textAlign: 'center', fontWeight: 500 }}>{passwordError}</div>}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={handlePasswordModalSave}
                  style={{
                    flex: 1,
                    padding: '0.85rem',
                    background: COLORS.primary,
                    color: COLORS.text,
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 18,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px 0 rgba(255,69,0,0.10)',
                    letterSpacing: 1.1,
                    transition: 'background 0.2s',
                  }}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    flex: 1,
                    padding: '0.85rem',
                    background: COLORS.inputBorder,
                    color: COLORS.text,
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 18,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                    letterSpacing: 1.1,
                    transition: 'background 0.2s',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Rol oculto */}
        {error && <div style={{ color: COLORS.error, marginBottom: 4, textAlign: 'center', fontWeight: 500 }}>{error}</div>}
        {success && <div style={{ color: COLORS.primary, marginBottom: 4, textAlign: 'center', fontWeight: 600 }}>{success}</div>}
      </form>
    </div>
  );
}
