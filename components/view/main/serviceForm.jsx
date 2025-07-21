"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

const ServiceForm = () => {
  const [formData, setFormData] = useState({
    marca: "",
    modelo: "",
    año: "",
    metodoPago: "",
    tallerServicio: "",
    tipoVehiculo: "",
    subtipoServicio: "",
    nombreCliente: "",
    telefono: "",
    email: "",
  });

  const [price, setPrice] = useState(0);
  const [showMultiplicadorNote, setShowMultiplicadorNote] = useState(false);
  const [subtipos, setSubtipos] = useState([]);
  const [servicioDB, setServicioDB] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const tiposVehiculo = ["Sedán", "SUV", "Pickup", "Hatchback", "Minivan"];
  const metodosPago = ["Tarjeta", "Efectivo"];
  const multiplicadoresTipoVehiculo = {
    "Sedán": 1,
    "Hatchback": 1,
    "SUV": 1.2,
    "Pickup": 1.3,
    "Minivan": 1.25,
  };
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Obtener el tipo de servicio desde la URL
  const serviceType = searchParams.get("tipo") || "";

  useEffect(() => {
    // Cargar talleres y servicios desde la API
    const fetchTalleres = async () => {
      try {
        const res = await fetch("/api/talleres");
        if (res.ok) {
          const data = await res.json();
          setTalleres(data);
        }
      } catch {}
    };
    const fetchServicios = async () => {
      try {
        const res = await fetch("/api/servicios");
        if (res.ok) {
          const data = await res.json();
          setServicios(data);
          // Buscar el servicio actual
          const sDB = data.find(s => s.nombre?.toLowerCase() === (serviceType || '').toLowerCase());
          setServicioDB(sDB);
          setSubtipos(sDB?.subtipos || []);
        }
      } catch {}
    };
    fetchTalleres();
    fetchServicios();
  }, [serviceType]);

  const generarAnios = () => {
    const anios = [];
    const anioActual = new Date().getFullYear();
    for (let anio = anioActual; anio >= 1990; anio--) {
      anios.push(anio);
    }
    return anios;
  };
  const aniosVehiculos = generarAnios();

  // Validación de campos requeridos
  const isFormValid = () => {
    if (!servicioDB) return false;
    // Si el servicio tiene subtipos, debe elegir uno
    if (subtipos.length > 0 && !formData.subtipoServicio) return false;
    // Validar campos básicos
    if (!formData.nombreCliente || !formData.telefono || !formData.metodoPago) return false;
    return true;
  };

  // Calcular precio según subtipo y tipo de vehículo
  useEffect(() => {
    if (!servicioDB) {
      setPrice(0);
      return;
    }
    let base = 0;
    if (subtipos.length > 0) {
      const sub = subtipos.find(s => s.nombre === formData.subtipoServicio);
      base = sub?.precio || 0;
    } else {
      base = servicioDB.precioMin || 0;
    }
    let total = base;
    setShowMultiplicadorNote(false);
    if (formData.tipoVehiculo && multiplicadoresTipoVehiculo[formData.tipoVehiculo]) {
      total = total * multiplicadoresTipoVehiculo[formData.tipoVehiculo];
      if (multiplicadoresTipoVehiculo[formData.tipoVehiculo] > 1) setShowMultiplicadorNote(true);
    }
    setPrice(total);
  }, [formData, servicioDB, subtipos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert("Por favor, completa todos los campos obligatorios correctamente.");
      return;
    }
    // Obtener usuario autenticado
    let userId = null;
    let userEmail = null;
    if (session?.user) {
      userId = session.user.id || session.user._id || null;
      userEmail = session.user.email;
    }
    // Buscar taller seleccionado (si aplica)
    let tallerId = null;
    if (formData.tallerServicio && talleres.length > 0) {
      const t = talleres.find(t => t.nombre === formData.tallerServicio);
      tallerId = t?._id;
    }
    // Buscar subtipo seleccionado
    let subtipo = null;
    if (subtipos.length > 0 && formData.subtipoServicio) {
      subtipo = subtipos.find(s => s.nombre === formData.subtipoServicio);
    }
    // Construir el request para la API
    const requestBody = {
      cliente: userId,
      taller: tallerId,
      servicio: servicioDB?._id,
      subtipo: subtipo?.nombre || null,
      detallesVehiculo: {
        marca: formData.marca,
        modelo: formData.modelo,
        año: formData.año,
        tipoVehiculo: formData.tipoVehiculo,
      },
      ubicacion: null, // Se puede agregar geolocalización si se requiere
      precio: price,
      contacto: {
        nombre: formData.nombreCliente,
        telefono: formData.telefono,
        email: formData.email,
      },
      metodoPago: formData.metodoPago,
    };
    try {
      const res = await fetch("/api/servicerequests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (res.ok) {
        alert("Solicitud enviada correctamente");
        router.push("/");
      } else {
        alert("No se pudo enviar la solicitud");
      }
    } catch {
      alert("Error de red al enviar la solicitud");
    }
  };

  return (
    <div className="bg-[#1a1a1a] min-h-screen text-white py-8 pb-20">
      <div className="bg-[#1E1E1E] rounded-lg p-6 max-w-md mx-auto shadow-md border border-[#333]">
        <form onSubmit={handleSubmit}>
          <h2 className="text-white text-xl font-bold mb-6">
            {servicioDB?.nombre || "Servicio"}
          </h2>
          {servicioDB?.descripcion && (
            <div className="mb-4 text-gray-300 text-sm">{servicioDB.descripcion}</div>
          )}
          {subtipos.length > 0 && (
            <div className="mb-4">
              <label className="text-white text-sm mb-1 block">Tipo de servicio</label>
              <select
                name="subtipoServicio"
                value={formData.subtipoServicio}
                onChange={handleChange}
                className="w-full bg-[#333333] text-white py-3 px-4 rounded-md appearance-none"
                required
              >
                <option value="">Elige un subtipo</option>
                {subtipos.map((s, i) => (
                  <option key={i} value={s.nombre}>{s.nombre} (${s.precio})</option>
                ))}
              </select>
            </div>
          )}
          {/* Campos dinámicos según el servicio */}
          {servicioDB?.nombre?.toLowerCase() === "limpieza" && (
            <>
              <div className="mb-4">
                <label className="text-white text-sm mb-1 block">Tipo de Vehículo</label>
                <select
                  name="tipoVehiculo"
                  value={formData.tipoVehiculo}
                  onChange={handleChange}
                  className="w-full bg-[#333333] text-white py-3 px-4 rounded-md appearance-none"
                  required
                >
                  <option value="">Elige tipo</option>
                  {tiposVehiculo.map((t, i) => (
                    <option key={i} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          {/* Campos generales */}
          <div className="mb-4">
            <label className="text-white text-sm mb-1 block">Nombre</label>
            <input
              name="nombreCliente"
              value={formData.nombreCliente}
              onChange={handleChange}
              className="w-full bg-[#333333] text-white py-3 px-4 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="text-white text-sm mb-1 block">Teléfono</label>
            <input
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full bg-[#333333] text-white py-3 px-4 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="text-white text-sm mb-1 block">Correo electrónico</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#333333] text-white py-3 px-4 rounded-md"
              type="email"
            />
          </div>
          <div className="mb-4">
            <label className="text-white text-sm mb-1 block">Método de Pago</label>
            <select
              name="metodoPago"
              value={formData.metodoPago}
              onChange={handleChange}
              className="w-full bg-[#333333] text-white py-3 px-4 rounded-md appearance-none"
              required
            >
              <option value="">Elige método</option>
              {metodosPago.map((m, i) => (
                <option key={i} value={m}>{m}</option>
              ))}
            </select>
          </div>
          {isFormValid() && price > 0 && (
            <div className="mb-4 mt-4">
              <p className="text-white text-sm mb-1">Total estimado:</p>
              <p className="text-white text-2xl font-bold">${price.toFixed(2)} <span className="text-sm text-gray-400">MXN</span></p>
              {showMultiplicadorNote && (
                <p className="text-xs text-yellow-400 mt-2">Incluye ajuste por tipo de vehículo (SUV, Pickup o Minivan).</p>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={!isFormValid()}
            className={`py-2 px-4 rounded-md transition-colors w-full font-semibold ${isFormValid()
              ? "bg-[#E85D04] hover:bg-[#F48C06] text-white"
              : "bg-gray-600 text-gray-300 cursor-not-allowed"
              }`}
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
