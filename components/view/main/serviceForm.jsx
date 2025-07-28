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
    "SUV": 1.1,
    "Pickup": 1.2,
    "Minivan": 1.2,
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
          // Buscar el servicio actual con manejo de espacios y mayúsculas/minúsculas
          const sDB = data.find(s => s.nombre?.trim().toLowerCase() === serviceType.trim().toLowerCase());
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

  // Validación: tipo de vehículo, subtipo de servicio y método de pago
  const isFormValid = () => {
    return formData.tipoVehiculo && formData.subtipoServicio && formData.metodoPago;
  };

  // Calcular precio según subtipo y tipo de vehículo
  useEffect(() => {
    // Ajustar el cálculo del precio para que se actualice correctamente al seleccionar un tipo de servicio
    if (!servicioDB) {
      setPrice(0);
      return;
    }
    let base = 0;
    if (formData.subtipoServicio) {
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
  }, [formData.subtipoServicio, formData.tipoVehiculo, servicioDB?._id, subtipos.map(s => s.nombre)]);

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
        nombre: session?.user?.name || "Usuario Anónimo",
        email: userEmail,
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

  // Mostrar en consola los datos seleccionados para depuración
  useEffect(() => {
    console.log("formData:", formData);
    console.log("servicioDB:", servicioDB);
    console.log("subtipos:", subtipos);
    console.log("Precio calculado:", price);
  }, [formData, servicioDB, subtipos, price]);

  // Mostrar precio destacado en grande y en blanco antes del botón de solicitar servicio
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 py-8 pb-20 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto shadow-md border border-gray-200 dark:border-gray-700 transition-colors">
        <form onSubmit={handleSubmit}>
          <h2 className="text-gray-900 dark:text-gray-100 text-xl font-bold mb-6 transition-colors">
            {servicioDB?.nombre || "Servicio"}
          </h2>
          {servicioDB?.descripcion && (
            <div className="mb-4 text-gray-600 dark:text-gray-400 text-sm transition-colors">{servicioDB.descripcion}</div>
          )}
          {subtipos.length > 0 && (
            <div className="mb-4">
              <label className="text-gray-900 dark:text-gray-100 text-sm mb-1 block transition-colors">Tipo de servicio</label>
              <select
                name="subtipoServicio"
                value={formData.subtipoServicio}
                onChange={handleChange}
                className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 py-3 px-4 rounded-md appearance-none transition-colors focus:ring-2 focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Elige un tipo</option>
                {subtipos.map((s, i) => (
                  <option key={i} value={s.nombre}>{s.nombre}</option>
                ))}
              </select>
            </div>
          )}
          {/* Selector de Taller (solo los que ofrecen el servicio seleccionado) */}
          {talleres.length > 0 && servicioDB?._id && (
            <div className="mb-4">
              <label className="text-gray-900 dark:text-gray-100 text-sm mb-1 block transition-colors">Taller</label>
              <select
                name="tallerServicio"
                value={formData.tallerServicio}
                onChange={handleChange}
                className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 py-3 px-4 rounded-md appearance-none transition-colors focus:ring-2 focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Elige un taller</option>
                {talleres
                  .filter(t => Array.isArray(t.servicios) && t.servicios.some(sid => sid == servicioDB._id))
                  .sort((a, b) => (b.calificacion || 0) - (a.calificacion || 0))
                  .map((t, i) => (
                    <option key={i} value={t.nombre}>
                      {t.nombre} {typeof t.calificacion === 'number' ? `(${t.calificacion.toFixed(1)}★)` : ''}
                    </option>
                  ))}
              </select>
            </div>
          )}
          {/* Selector de Tipo de Vehículo para todos los servicios */}
          <div className="mb-4">
            <label className="text-gray-900 dark:text-gray-100 text-sm mb-1 block transition-colors">Tipo de Vehículo</label>
            <select
              name="tipoVehiculo"
              value={formData.tipoVehiculo}
              onChange={handleChange}
              className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 py-3 px-4 rounded-md appearance-none transition-colors focus:ring-2 focus:ring-primary focus:border-primary"
              required
            >
              <option value="">Elige tipo</option>
              {tiposVehiculo.map((t, i) => (
                <option key={i} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {/* Campos generales */}
          <div className="mb-4">
            <label className="text-gray-900 dark:text-gray-100 text-sm mb-1 block transition-colors">Método de Pago</label>
            <select
              name="metodoPago"
              value={formData.metodoPago}
              onChange={handleChange}
              className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 py-3 px-4 rounded-md appearance-none transition-colors focus:ring-2 focus:ring-primary focus:border-primary"
              required
            >
              <option value="">Elige método</option>
              {metodosPago.map((m, i) => (
                <option key={i} value={m}>{m}</option>
              ))}
            </select>
          </div>
          {/* Mostrar precio destacado justo antes del botón */}
          {formData.tipoVehiculo && formData.subtipoServicio && price > 0 && (
            <div className="mb-4 text-center">
              <p className="text-gray-900 dark:text-gray-100 text-base mb-1 transition-colors">Precio estimado:</p>
              <p className="text-gray-900 dark:text-gray-100 text-2xl font-bold transition-colors">${price.toFixed(2)} MXN</p>
              {showMultiplicadorNote && (
                <p className="text-xs text-yellow-500 dark:text-yellow-400 mt-2 transition-colors">Incluye ajuste por tipo de vehículo (SUV, Pickup o Minivan).</p>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={!isFormValid()}
            className={`mt-2 py-2 px-4 rounded-md transition-colors w-full font-semibold ${isFormValid()
              ? "bg-primary hover:bg-primary-hover text-white"
              : "bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-400 cursor-not-allowed"
              }`}
          >
            Solicitar Servicio
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
