
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserAlt, FaLock, FaEnvelope, FaPhone, FaImage } from 'react-icons/fa';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const COLORS = {
  primary: '#FF4500',
  secondary: '#4B2E19',
  background: '#181818',
  text: '#fff',
  error: '#FF6347',
  inputBg: '#232323',
  inputBorder: '#333',
};

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
      if (foto) formData.append('foto', foto);

      const res = await fetch('/api/users', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al registrar usuario');
        setLoading(false);
        return;
      }
      setSuccess('¡Registro exitoso! Redirigiendo...');
      setTimeout(() => router.push('/'), 1800);
    } catch (err) {
      setError('Error de conexión');
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
          DriveSync
        </span>
      </div>
      <form
        onSubmit={handleSubmit}
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
        <h2 style={{
          color: COLORS.primary,
          marginBottom: 8,
          textAlign: 'center',
          fontWeight: 800,
          letterSpacing: 1.2,
          fontSize: 28,
          fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
          textTransform: 'uppercase',
        }}>
          Registro
        </h2>
        <div style={{ position: 'relative' }}>
          <FaUserAlt style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: COLORS.secondary,
            fontSize: 18,
          }} />
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
          />
        </div>
        <div style={{ position: 'relative' }}>
          <FaEnvelope style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: COLORS.secondary,
            fontSize: 18,
          }} />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
            }}
            required
            autoComplete="email"
          />
        </div>
        <div style={{ position: 'relative' }}>
          <FaPhone style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: COLORS.secondary,
            fontSize: 18,
          }} />
          <input
            type="tel"
            value={telefono}
            onChange={e => {
              // Solo permitir números
              const val = e.target.value.replace(/[^\d]/g, '');
              setTelefono(val);
            }}
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
          />
        </div>
        <div style={{ position: 'relative' }}>
          <FaLock style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: COLORS.secondary,
            fontSize: 18,
          }} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña"
            style={{
              width: '100%',
              padding: '0.85rem 2.5rem 0.85rem 2.5rem',
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
            autoComplete="new-password"
            minLength={6}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setShowPassword(v => !v)}
            style={{
              position: 'absolute',
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: COLORS.secondary,
              cursor: 'pointer',
              fontSize: 18,
              padding: 0,
            }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <FaLock style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: COLORS.secondary,
            fontSize: 18,
          }} />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Repite la contraseña"
            style={{
              width: '100%',
              padding: '0.85rem 2.5rem 0.85rem 2.5rem',
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
            autoComplete="new-password"
            minLength={6}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setShowConfirmPassword(v => !v)}
            style={{
              position: 'absolute',
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: COLORS.secondary,
              cursor: 'pointer',
              fontSize: 18,
              padding: 0,
            }}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <FaImage style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: COLORS.secondary,
            fontSize: 18,
          }} />
          <input
            type="file"
            accept="image/*"
            onChange={e => setFoto(e.target.files[0])}
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
          />
        </div>
        {error && <div style={{ color: COLORS.error, marginBottom: 4, textAlign: 'center', fontWeight: 500 }}>{error}</div>}
        {success && <div style={{ color: COLORS.primary, marginBottom: 4, textAlign: 'center', fontWeight: 600 }}>{success}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
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
            marginTop: 8,
            letterSpacing: 1.1,
            transition: 'background 0.2s',
          }}
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
        <style jsx>{`
          @media (max-width: 600px) {
            form {
              padding: 1.2rem !important;
              max-width: 98vw !important;
              border-radius: 10px !important;
            }
            h2 {
              font-size: 22px !important;
            }
            button {
              font-size: 16px !important;
            }
          }
        `}</style>
      </form>
      <div style={{
        marginTop: 18,
        textAlign: 'center',
        color: COLORS.text,
        fontSize: 15,
        fontFamily: 'Segoe UI, Arial, sans-serif',
      }}>
        ¿Ya tienes cuenta?{' '}
        <a
          href="/"
          style={{
            color: COLORS.primary,
            fontWeight: 700,
            textDecoration: 'underline',
            cursor: 'pointer',
            fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
          }}
        >
          Inicia sesión
        </a>
        <br />
        <span style={{ color: COLORS.secondary, marginTop: 10, display: 'inline-block' }}>
          ¿Eres un taller?{' '}
          <a
            href="/register/TallerRegister"
            style={{
              color: COLORS.primary,
              fontWeight: 700,
              textDecoration: 'underline',
              cursor: 'pointer',
              fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
            }}
          >
            Regístrate aquí
          </a>
        </span>
      </div>
    </div>
  );
}
