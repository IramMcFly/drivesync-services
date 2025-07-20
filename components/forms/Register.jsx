"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('nombre', nombre);
      formData.append('telefono', telefono);
      if (foto) {
        formData.append('foto', foto);
      }
      const res = await fetch('/api/users', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.message) {
        // Login automático tras registro exitoso
        const loginResult = await signIn("credentials", {
          redirect: false,
          email,
          password
        });
        if (loginResult?.ok) {
          router.push("/view");
        } else {
          setMessage(data.message);
          setEmail('');
          setPassword('');
          setNombre('');
          setTelefono('');
          setFoto(null);
        }
      } else {
        setError(data.error || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error de red o del servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center py-12">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1E1E1E] border border-[#333] rounded-xl shadow-md w-full max-w-md p-8 space-y-6"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-orange-500">Registro de Usuario</h2>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            className="w-full bg-[#333] text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Nombre completo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="telefono">Teléfono</label>
          <input
            id="telefono"
            type="tel"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            required
            className="w-full bg-[#333] text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Ej: 5551234567"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-[#333] text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="correo@ejemplo.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">Contraseña</label>
          <input
            id="password"
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
          <label className="block text-sm font-medium mb-1" htmlFor="foto">Foto de perfil</label>
          <input
            id="foto"
            type="file"
            accept="image/*"
            onChange={e => setFoto(e.target.files[0])}
            className="w-full bg-[#333] text-white py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-md font-semibold transition-colors disabled:bg-gray-600"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
        {message && <div className="text-green-400 text-center mt-2">{message}</div>}
        {error && <div className="text-red-400 text-center mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default Register;