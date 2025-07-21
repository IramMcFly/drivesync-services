
"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { FaUserAlt, FaEnvelope, FaPhone, FaImage, FaLock, FaSave, FaEdit } from "react-icons/fa";

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
  const [editMode, setEditMode] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [password, setPassword] = useState("");
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

  const handleEdit = () => {
    setEditMode(true);
    setSuccess("");
    setError("");
  };

  const handleCancel = () => {
    setEditMode(false);
    setNombre(user.nombre || "");
    setTelefono(user.telefono || "");
    setFoto(null);
    // Si hay foto binaria, vuelve a crear el preview
    if (user.foto && user.foto.data) {
      const byteArray = new Uint8Array(user.foto.data);
      const blob = new Blob([byteArray], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      setFotoPreview(url);
    } else {
      setFotoPreview(null);
    }
    setPassword("");
    setError("");
    setSuccess("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("_id", user._id);
      formData.append("nombre", nombre);
      formData.append("telefono", telefono);
      formData.append("email", user.email);
      if (foto) formData.append("foto", foto);
      if (password) formData.append("password", password);

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
      setEditMode(false);
      setPassword("");
      setFoto(null);
      // Si cambió la foto, recargar preview
      if (foto) setFotoPreview(URL.createObjectURL(foto));
    } catch (err) {
      setError("Error de conexión");
    }
    setLoading(false);
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
        onSubmit={handleSave}
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
      >
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
              }}
              onClick={() => editMode && fileInputRef.current?.click()}
            />
            {editMode && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
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
                <FaImage />
              </button>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={e => {
                if (e.target.files[0]) setFoto(e.target.files[0]);
              }}
              disabled={!editMode}
            />
          </div>
        </div>
        <div style={{ position: 'relative' }}>
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
            }}
            required
            autoComplete="name"
            disabled={!editMode}
          />
        </div>
        <div style={{ position: 'relative' }}>
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
        <div style={{ position: 'relative' }}>
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
            }}
            required
            autoComplete="tel"
            maxLength={10}
            pattern="\d{10}"
            disabled={!editMode}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <FaLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: COLORS.secondary, fontSize: 18 }} />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
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
            }}
            minLength={6}
            autoComplete="new-password"
            disabled={!editMode}
          />
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          {!editMode ? (
            <button
              type="button"
              onClick={handleEdit}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <FaEdit /> Editar
            </button>
          ) : (
            <>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  background: COLORS.primary,
                  color: COLORS.text,
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 2px 8px 0 rgba(255,69,0,0.10)',
                  letterSpacing: 1.1,
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <FaSave /> {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  background: COLORS.inputBorder,
                  color: COLORS.text,
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                  letterSpacing: 1.1,
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                Cancelar
              </button>
            </>
          )}
        </div>
        <div style={{ color: COLORS.text, marginTop: 8, fontSize: 15 }}>
          <b>Rol:</b> {user.role || 'cliente'}
        </div>
        {error && <div style={{ color: COLORS.error, marginBottom: 4, textAlign: 'center', fontWeight: 500 }}>{error}</div>}
        {success && <div style={{ color: COLORS.primary, marginBottom: 4, textAlign: 'center', fontWeight: 600 }}>{success}</div>}
      </form>
    </div>
  );
}
