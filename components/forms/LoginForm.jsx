
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FaUserAlt, FaLock } from 'react-icons/fa';

const COLORS = {
  primary: '#FF4500',
  secondary: '#4B2E19',
  background: '#181818',
  text: '#fff',
  error: '#FF6347',
  inputBg: '#232323',
  inputBorder: '#333',
};

export default function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      router.push('/main/userProfile');
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
          maxWidth: 380,
          width: '100%',
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
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
          Iniciar sesión
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
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            placeholder="Correo electrónico o teléfono"
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
            autoComplete="username"
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
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña"
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
            autoComplete="current-password"
          />
        </div>
        {error && <div style={{ color: COLORS.error, marginBottom: 4, textAlign: 'center', fontWeight: 500 }}>{error}</div>}
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
          {loading ? 'Ingresando...' : 'Ingresar'}
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
        ¿No tienes cuenta?{' '}
        <a
          href="/register"
          style={{
            color: COLORS.primary,
            fontWeight: 700,
            textDecoration: 'underline',
            cursor: 'pointer',
            fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
          }}
        >
          Regístrate
        </a>
      </div>
    </div>
  );
}
