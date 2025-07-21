"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('../../maps/LeafletMap'), { ssr: false });

const RegisterTaller = ({ onSuccess }) => {
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logo, setLogo] = useState(null);
  const [ubicacion, setUbicacion] = useState({ lat: null, lng: null, direccion: '' });
  const [userLocation, setUserLocation] = useState(null);

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
    setLoading(true);
    setMessage('');
    setError('');
    try {
      if (!ubicacion.lat || !ubicacion.lng) {
        setError('Selecciona la ubicación del taller en el mapa.');
        setLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('direccion', direccion);
      formData.append('telefono', telefono);
      formData.append('email', email);
      formData.append('password', password);
      if (logo) {
        formData.append('logo', logo);
      }
      formData.append('ubicacion', JSON.stringify(ubicacion));
      const res = await fetch('/api/talleres', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setMessage('Taller registrado exitosamente');
        setNombre('');
        setDireccion('');
        setTelefono('');
        setEmail('');
        setPassword('');
        setLogo(null);
        setUbicacion({ lat: null, lng: null, direccion: '' });
        if (onSuccess) onSuccess();
      } else {
        setError(data.error || 'Error al registrar taller');
      }
    } catch (err) {
      setError('Error de red o del servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1E1E1E] border border-[#333] rounded-xl shadow-md w-full max-w-md p-8 space-y-6">
      <h2 className="text-3xl font-bold text-center mb-6 text-orange-500">Registro de Taller</h2>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="nombreTaller">Nombre del Taller</label>
        <input
          id="nombreTaller"
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
          className="w-full bg-[#333] text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Nombre del taller"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="direccion">Dirección</label>
        <input
          id="direccion"
          type="text"
          value={direccion}
          onChange={e => setDireccion(e.target.value)}
          required
          className="w-full bg-[#333] text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Dirección del taller"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Ubicación en el mapa <span className="text-orange-400">*</span></label>
        <div className="w-full h-64 mb-2">
          <LeafletMap
            onSelect={([lat, lng]) => setUbicacion({ ...ubicacion, lat, lng })}
            markerLocation={ubicacion.lat && ubicacion.lng ? [ubicacion.lat, ubicacion.lng] : null}
            markerLabel={nombre ? nombre : 'Taller'}
            userLocation={userLocation}
          />
        </div>
        {ubicacion.lat && ubicacion.lng && (
          <div className="text-xs text-zinc-400 mt-1">Coordenadas: {ubicacion.lat.toFixed(6)}, {ubicacion.lng.toFixed(6)}</div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="telefonoTaller">Teléfono</label>
        <input
          id="telefonoTaller"
          type="tel"
          value={telefono}
          onChange={e => setTelefono(e.target.value)}
          required
          className="w-full bg-[#333] text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Ej: 5551234567"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="emailTaller">Email</label>
        <input
          id="emailTaller"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full bg-[#333] text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="correo@taller.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="passwordTaller">Contraseña</label>
        <input
          id="passwordTaller"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full bg-[#333] text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Mínimo 6 caracteres"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="logo">Logo del taller</label>
        <input
          id="logo"
          type="file"
          accept="image/*"
          onChange={e => setLogo(e.target.files[0])}
          className="w-full bg-[#333] text-white py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-md font-semibold transition-colors disabled:bg-gray-600"
      >
        {loading ? 'Registrando...' : 'Registrar taller'}
      </button>
      {message && <div className="text-green-400 text-center mt-2">{message}</div>}
      {error && <div className="text-red-400 text-center mt-2">{error}</div>}
    </form>
  );
};

export default RegisterTaller;
