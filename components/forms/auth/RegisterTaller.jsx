"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { FaUserAlt, FaLock, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LeafletMap = dynamic(() => import('../../maps/LeafletMap'), { ssr: false });

const RegisterTaller = ({ onSuccess }) => {
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ubicacion, setUbicacion] = useState({ lat: null, lng: null, direccion: '' });
  const [userLocation, setUserLocation] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Servicios
  const [servicios, setServicios] = useState([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  // Obtener servicios al montar
  React.useEffect(() => {
    fetch('/api/servicios')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setServicios(data);
      });
  }, []);
  // Toggle de servicios
  const toggleServicio = (id) => {
    setServiciosSeleccionados(prev =>
      prev.includes(id)
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );
  };

  // Obtener ubicación actual al montar
  React.useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          // Si el usuario no da permiso, dejar el mapa en default
        }
      );
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!/^[\d]{10}$/.test(telefono)) {
      setError('El teléfono debe tener 10 dígitos');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      if (!ubicacion.lat || !ubicacion.lng) {
        setError('Selecciona la ubicación del taller en el mapa.');
        setLoading(false);
        return;
      }
      const data = {
        nombre,
        direccion,
        telefono,
        email,
        password,
        ubicacion: {
          lat: ubicacion.lat,
          lng: ubicacion.lng,
          direccion,
        },
        servicios: serviciosSeleccionados,
        calificacion: 0,
      };
      const res = await fetch('/api/talleres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok && result.message) {
        setMessage('Solicitud registrada exitosamente, DriveSync te contactará');
        setNombre('');
        setDireccion('');
        setTelefono('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setUbicacion({ lat: null, lng: null, direccion: '' });
        if (onSuccess) onSuccess();
      } else {
        setError(result.error || 'Error al registrar taller');
      }
    } catch (err) {
      setError('Error de red o del servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#181818',
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
          color: '#FF4500',
          letterSpacing: 2,
          textShadow: '0 2px 8px rgba(255,69,0,0.10)',
          textTransform: 'uppercase',
          display: 'block',
        }}>
          DriveSync Talleres
        </span>
      </div>
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#232323',
          color: '#fff',
          padding: '2rem',
          borderRadius: '18px',
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <h2 style={{
          color: '#FF4500',
          marginBottom: 8,
          textAlign: 'center',
          fontWeight: 800,
          letterSpacing: 1.2,
          fontSize: 28,
          fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
          textTransform: 'uppercase',
        }}>
          Registro de Taller
        </h2>
        {/* Selección de servicios */}
        <div style={{ marginBottom: 8 }}>
          <label style={{ color: '#FF4500', fontWeight: 700, marginBottom: 6, display: 'block' }}>Servicios que ofrece</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {servicios.length === 0 && <span style={{ color: '#bbb', fontSize: 14 }}>Cargando servicios...</span>}
            {servicios.map(servicio => (
              <button
                type="button"
                key={servicio._id}
                onClick={() => toggleServicio(servicio._id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 20,
                  border: '2px solid #FF4500',
                  background: serviciosSeleccionados.includes(servicio._id) ? '#FF4500' : 'transparent',
                  color: serviciosSeleccionados.includes(servicio._id) ? '#fff' : '#FF4500',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  marginBottom: 4,
                }}
              >
                {servicio.nombre}
              </button>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <FaUserAlt style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#4B2E19',
            fontSize: 18,
          }} />
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Nombre del taller"
            style={{
              width: '100%',
              padding: '0.85rem 0.85rem 0.85rem 2.5rem',
              marginBottom: 4,
              border: '1.5px solid #333',
              borderRadius: 8,
              background: '#333',
              color: '#fff',
              fontSize: 16,
              outline: 'none',
              transition: 'border 0.2s',
            }}
            required
            autoComplete="organization"
          />
        </div>
        <div style={{ position: 'relative' }}>
          <FaMapMarkerAlt style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#4B2E19',
            fontSize: 18,
          }} />
          <input
            type="text"
            value={direccion}
            onChange={e => setDireccion(e.target.value)}
            placeholder="Dirección del taller"
            style={{
              width: '100%',
              padding: '0.85rem 0.85rem 0.85rem 2.5rem',
              marginBottom: 4,
              border: '1.5px solid #333',
              borderRadius: 8,
              background: '#333',
              color: '#fff',
              fontSize: 16,
              outline: 'none',
              transition: 'border 0.2s',
            }}
            required
            autoComplete="street-address"
          />
        </div>
        <div style={{ width: '100%', height: 220, marginBottom: 8, borderRadius: 8, overflow: 'hidden', border: '1.5px solid #333', background: '#222' }}>
          <LeafletMap
            onSelect={([lat, lng]) => setUbicacion({ ...ubicacion, lat, lng })}
            markerLocation={ubicacion.lat && ubicacion.lng ? [ubicacion.lat, ubicacion.lng] : null}
            markerLabel={nombre ? nombre : 'Taller'}
            userLocation={userLocation}
          />
        </div>
        {ubicacion.lat && ubicacion.lng && (
          <div style={{ color: '#bbb', fontSize: 13, marginBottom: 2 }}>Coordenadas: {ubicacion.lat.toFixed(6)}, {ubicacion.lng.toFixed(6)}</div>
        )}
        <div style={{ position: 'relative' }}>
          <FaPhone style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#4B2E19',
            fontSize: 18,
          }} />
          <input
            type="tel"
            value={telefono}
            onChange={e => {
              const val = e.target.value.replace(/[^\d]/g, '');
              setTelefono(val);
            }}
            placeholder="Teléfono (10 dígitos)"
            style={{
              width: '100%',
              padding: '0.85rem 0.85rem 0.85rem 2.5rem',
              marginBottom: 4,
              border: '1.5px solid #333',
              borderRadius: 8,
              background: '#333',
              color: '#fff',
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
          <FaEnvelope style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#4B2E19',
            fontSize: 18,
          }} />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Correo del taller"
            style={{
              width: '100%',
              padding: '0.85rem 0.85rem 0.85rem 2.5rem',
              marginBottom: 4,
              border: '1.5px solid #333',
              borderRadius: 8,
              background: '#333',
              color: '#fff',
              fontSize: 16,
              outline: 'none',
              transition: 'border 0.2s',
            }}
            required
            autoComplete="email"
          />
        </div>
        <div style={{ position: 'relative' }}>
          <FaLock style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#4B2E19',
            fontSize: 18,
          }} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña (mínimo 6 caracteres)"
            style={{
              width: '100%',
              padding: '0.85rem 2.5rem 0.85rem 2.5rem',
              marginBottom: 4,
              border: '1.5px solid #333',
              borderRadius: 8,
              background: '#333',
              color: '#fff',
              fontSize: 16,
              outline: 'none',
              transition: 'border 0.2s',
            }}
            required
            minLength={6}
            autoComplete="new-password"
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
              color: '#4B2E19',
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
            color: '#4B2E19',
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
              border: '1.5px solid #333',
              borderRadius: 8,
              background: '#333',
              color: '#fff',
              fontSize: 16,
              outline: 'none',
              transition: 'border 0.2s',
            }}
            required
            minLength={6}
            autoComplete="new-password"
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
              color: '#4B2E19',
              cursor: 'pointer',
              fontSize: 18,
              padding: 0,
            }}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {error && <div style={{ color: '#FF6347', textAlign: 'center', fontWeight: 500, marginBottom: 4 }}>{error}</div>}
        {message && <div style={{ color: '#4ade80', textAlign: 'center', fontWeight: 600, marginBottom: 4 }}>{message}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.85rem',
            background: '#FF4500',
            color: '#fff',
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
          {loading ? 'Registrando...' : 'Registrar taller'}
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
    </div>
  );
};

export default RegisterTaller;
