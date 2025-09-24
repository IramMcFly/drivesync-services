"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Modal } from "../../ui";
import { useModal } from "../../../hooks/useModal";
import { useGeolocation } from "../../../hooks/useGeolocation";

const ServiceForm = () => {
  const { modalState, showError, showSuccess, hideModal } = useModal();
  const [formData, setFormData] = useState({
    vehiculoSeleccionado: "",
    metodoPago: "",
    tallerServicio: "",
    subtipoServicio: "",
    // Mantener campos del vehículo para nuevo vehículo
    marca: "",
    modelo: "",
    año: "",
    tipoVehiculo: "",
  });

  const [price, setPrice] = useState(0);
  const [showMultiplicadorNote, setShowMultiplicadorNote] = useState(false);
  const [subtipos, setSubtipos] = useState([]);
  const [servicioDB, setServicioDB] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [showNuevoVehiculo, setShowNuevoVehiculo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  const tiposVehiculo = [
    { value: "sedan", label: "Sedán" },
    { value: "suv", label: "SUV" },
    { value: "pickup", label: "Pickup" },
    { value: "hatchback", label: "Hatchback" },
    { value: "minivan", label: "Minivan" },
    { value: "coupe", label: "Coupé" },
    { value: "convertible", label: "Convertible" },
    { value: "wagon", label: "Wagon" },
    { value: "motocicleta", label: "Motocicleta" },
    { value: "otro", label: "Otro" }
  ];
  const metodosPago = ["Tarjeta", "Efectivo"];
  const multiplicadoresTipoVehiculo = {
    "sedan": 1,
    "hatchback": 1,
    "suv": 1.1,
    "pickup": 1.2,
    "minivan": 1.2,
    "coupe": 1,
    "convertible": 1,
    "wagon": 1,
    "motocicleta": 0.8,
    "otro": 1,
  };
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Usar el hook de geolocalización
  const { 
    location: userLocation, 
    error: locationError, 
    loading: locationLoading, 
    requestLocation,
    isSupported 
  } = useGeolocation();

  // Obtener el tipo de servicio desde la URL
  const serviceType = searchParams.get("tipo") || "";

  // Función auxiliar para obtener talleres disponibles para el servicio actual
  const getTalleresDisponibles = () => {
    if (!servicioDB?._id || talleres.length === 0) return [];
    
    return talleres.filter(t => {
      if (!Array.isArray(t.servicios)) return false;
      return t.servicios.some(servicio => {
        const servicioId = servicio._id || servicio;
        return servicioId.toString() === servicioDB._id.toString();
      });
    });
  };

  // Manejar errores de ubicación
  useEffect(() => {
    if (locationError) {
      setShowLocationModal(true);
    }
  }, [locationError]);

  // Función para manejar la solicitud de ubicación
  const handleLocationRequest = () => {
    if (locationError?.code === 'PERMISSION_DENIED') {
      showError(
        "Para continuar, necesitas permitir el acceso a la ubicación. Ve a la configuración de tu navegador y permite la ubicación para este sitio.",
        "Permisos de ubicación requeridos",
        () => {
          hideModal();
          // Intentar nuevamente después de que el usuario haya dado permisos
          setTimeout(() => {
            requestLocation();
          }, 1000);
        }
      );
    } else if (locationError?.code === 'NOT_SUPPORTED') {
      showError(
        "Tu dispositivo no soporta geolocalización. No puedes continuar con la solicitud del servicio.",
        "Funcionalidad no disponible",
        () => {
          hideModal();
          router.back();
        }
      );
    } else {
      // Otros errores, permitir reintentar
      requestLocation();
    }
    setShowLocationModal(false);
  };

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

    // Cargar vehículos del usuario
    const fetchVehiculos = async () => {
      if (session?.user?.id) {
        try {
          const res = await fetch(`/api/vehicles?userId=${session.user.id}`);
          if (res.ok) {
            const data = await res.json();
            setVehiculos(data);
            // Seleccionar automáticamente el vehículo principal si existe
            const principal = data.find(v => v.esPrincipal);
            if (principal && !formData.vehiculoSeleccionado) {
              setFormData(prev => ({ ...prev, vehiculoSeleccionado: principal._id }));
            }
          }
        } catch (error) {
          console.error('Error cargando vehículos:', error);
        }
      }
    };

    fetchTalleres();
    fetchServicios();
    fetchVehiculos();
  }, [serviceType, session?.user?.id, formData.vehiculoSeleccionado]);

  const generarAnios = () => {
    const anios = [];
    const anioActual = new Date().getFullYear();
    for (let anio = anioActual; anio >= 1990; anio--) {
      anios.push(anio);
    }
    return anios;
  };
  const aniosVehiculos = generarAnios();

  // Validación: vehículo (seleccionado o nuevo), subtipo de servicio y método de pago
  const isFormValid = () => {
    let vehiculoValido = false;
    
    // Verificar si hay vehículo seleccionado o datos completos para vehículo nuevo
    if (formData.vehiculoSeleccionado) {
      vehiculoValido = true;
    } else if (showNuevoVehiculo || vehiculos.length === 0) {
      // Si está agregando vehículo nuevo o no tiene vehículos registrados
      vehiculoValido = formData.marca && formData.modelo && formData.año && 
                     formData.tipoVehiculo && formData.color && formData.placa;
    }
    
    const hasRequiredFields = vehiculoValido && formData.subtipoServicio && formData.metodoPago;
    
    // Si no hay talleres disponibles para el servicio, el formulario no es válido
    const talleresDisponibles = getTalleresDisponibles();
    
    if (servicioDB?._id && talleresDisponibles.length === 0) {
      return false;
    }
    
    if (servicioDB?._id && talleresDisponibles.length > 0) {
      return hasRequiredFields && formData.tallerServicio;
    }
    
    return hasRequiredFields;
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
    
    // Obtener tipo de vehículo del vehículo seleccionado o del formulario de nuevo vehículo
    const vehiculoSeleccionado = vehiculos.find(v => v._id === formData.vehiculoSeleccionado);
    const tipoVehiculo = vehiculoSeleccionado?.tipo || formData.tipoVehiculo;
    
    if (tipoVehiculo && multiplicadoresTipoVehiculo[tipoVehiculo]) {
      total = total * multiplicadoresTipoVehiculo[tipoVehiculo];
      if (multiplicadoresTipoVehiculo[tipoVehiculo] > 1) setShowMultiplicadorNote(true);
    }
    setPrice(total);
  }, [formData.subtipoServicio, formData.vehiculoSeleccionado, formData.tipoVehiculo, vehiculos, servicioDB?._id, subtipos.map(s => s.nombre)]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar que tenemos ubicación antes de continuar
    if (!userLocation) {
      showError(
        "Necesitamos tu ubicación para procesar la solicitud. Por favor, permite el acceso a la ubicación.",
        "Ubicación requerida",
        () => {
          hideModal();
          requestLocation();
        }
      );
      return;
    }
    
    if (!isFormValid()) {
      // Dar mensajes específicos según el problema
      const talleresDisponibles = getTalleresDisponibles();
      
      if (servicioDB?._id && talleresDisponibles.length === 0) {
        showError(
          `No hay talleres disponibles que ofrezcan el servicio "${servicioDB.nombre}" en este momento. Por favor, intenta más tarde o selecciona otro servicio.`,
          "Talleres no disponibles"
        );
      } else if (servicioDB?._id && talleresDisponibles.length > 0 && !formData.tallerServicio) {
        showError("Por favor, selecciona un taller para continuar.", "Taller requerido");
      } else {
        showError("Por favor, completa todos los campos obligatorios correctamente.", "Campos incompletos");
      }
      return;
    }
    
    setIsLoading(true);
    
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
    // Manejar vehículo (existente o nuevo)
    let vehiculoId = formData.vehiculoSeleccionado;
    let vehiculoSeleccionado = vehiculos.find(v => v._id === formData.vehiculoSeleccionado);
    
    // Si no hay vehículo seleccionado pero hay datos para uno nuevo, crearlo primero
    if (!vehiculoId && (showNuevoVehiculo || vehiculos.length === 0)) {
      try {
        const nuevoVehiculo = {
          userId: userId, // Agregar el ID del usuario
          marca: formData.marca,
          modelo: formData.modelo,
          año: formData.año,
          tipoVehiculo: formData.tipoVehiculo, // Cambiar de 'tipo' a 'tipoVehiculo'
          color: formData.color,
          placa: formData.placa,
          esPrincipal: vehiculos.length === 0, // Primer vehículo es principal automáticamente
        };
        
        const vehiculoRes = await fetch("/api/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoVehiculo),
        });
        
        if (vehiculoRes.ok) {
          const vehiculoCreado = await vehiculoRes.json();
          vehiculoId = vehiculoCreado.vehicle._id;
          vehiculoSeleccionado = vehiculoCreado.vehicle;
        } else {
          const errorData = await vehiculoRes.json();
          showError(errorData.message || "Error al registrar el vehículo");
          setIsLoading(false);
          return;
        }
      } catch (error) {
        showError("Error de red al registrar el vehículo");
        setIsLoading(false);
        return;
      }
    }
    
    // Construir el request para la API
    const requestBody = {
      cliente: userId,
      taller: tallerId,
      servicio: servicioDB?._id,
      subtipo: subtipo?.nombre || null,
      vehiculo: vehiculoId, // Referencia al vehículo
      detallesVehiculo: vehiculoSeleccionado ? {
        marca: vehiculoSeleccionado.marca,
        modelo: vehiculoSeleccionado.modelo,
        año: vehiculoSeleccionado.año,
        color: vehiculoSeleccionado.color,
        placa: vehiculoSeleccionado.placa,
        tipoVehiculo: vehiculoSeleccionado.tipo,
      } : null,
      ubicacion: userLocation, // Ahora incluimos la ubicación real
      precio: price,
      contacto: {
        nombre: session?.user?.nombre || session?.user?.name || "Usuario Anónimo",
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
        const data = await res.json();
        // Redirigir a la página de estado del servicio
        router.push(`/main/service-status/${data.serviceRequest._id}`);
      } else {
        showError("No se pudo enviar la solicitud");
        setIsLoading(false);
      }
    } catch {
      showError("Error de red al enviar la solicitud");
      setIsLoading(false);
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
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 py-4 sm:py-8 pb-20 transition-colors" suppressHydrationWarning>
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md mx-auto shadow-md border border-gray-200 dark:border-gray-700 transition-colors mx-4" suppressHydrationWarning>
        
        {/* Estado de ubicación */}
        {(locationLoading || locationError) && (
          <div className="mb-4 p-3 rounded-lg border">
            {locationLoading && (
              <div className="flex items-center text-blue-600 dark:text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm">Obteniendo ubicación...</span>
              </div>
            )}
            {locationError && (
              <div className="text-red-600 dark:text-red-400">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Error de ubicación</span>
                </div>
                <p className="text-xs mb-2">{locationError.message}</p>
                {locationError.canRetry && (
                  <button
                    onClick={requestLocation}
                    className="text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-800 dark:text-red-200 px-2 py-1 rounded"
                  >
                    Intentar nuevamente
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Indicador de ubicación obtenida */}
        {userLocation && (
          <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center text-green-700 dark:text-green-300">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Ubicación obtenida correctamente</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h2 className="text-gray-900 dark:text-gray-100 text-lg sm:text-xl font-bold mb-4 sm:mb-6 transition-colors">
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
                className="w-full bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 py-2 sm:py-3 px-3 sm:px-4 rounded-md appearance-none transition-colors focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base"
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
                className="w-full bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 py-2 sm:py-3 px-3 sm:px-4 rounded-md appearance-none transition-colors focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base"
                required
              >
                <option value="">Elige un taller</option>
                {getTalleresDisponibles()
                  .sort((a, b) => (b.calificacion || 0) - (a.calificacion || 0))
                  .map((t, i) => (
                    <option key={i} value={t.nombre}>
                      {t.nombre} {typeof t.calificacion === 'number' ? `(${t.calificacion.toFixed(1)}★)` : ''}
                    </option>
                  ))}
              </select>
            </div>
          )}
          
          {/* Mensaje informativo cuando no hay talleres disponibles para el servicio */}
          {talleres.length > 0 && servicioDB?._id && getTalleresDisponibles().length === 0 && (
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-md">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                No hay talleres disponibles que ofrezcan el servicio "{servicioDB.nombre}" en este momento. 
                Por favor, intenta más tarde o selecciona otro servicio.
              </p>
            </div>
          )}
          
          {/* Selector de Vehículo */}
          <div className="mb-4">
            <label className="text-gray-900 dark:text-gray-100 text-sm mb-1 block transition-colors">Vehículo</label>
            
            {vehiculos.length > 0 && !showNuevoVehiculo ? (
              <div className="space-y-3">
                <select
                  name="vehiculoSeleccionado"
                  value={formData.vehiculoSeleccionado}
                  onChange={handleChange}
                  className="w-full bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 py-2 sm:py-3 px-3 sm:px-4 rounded-md appearance-none transition-colors focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base"
                  required
                >
                  <option value="">Selecciona un vehículo</option>
                  {vehiculos.map((vehiculo) => (
                    <option key={vehiculo._id} value={vehiculo._id}>
                      {vehiculo.marca} {vehiculo.modelo} {vehiculo.año} - {vehiculo.placa}
                      {vehiculo.esPrincipal ? ' (Principal)' : ''}
                    </option>
                  ))}
                </select>
                
                <button
                  type="button"
                  onClick={() => setShowNuevoVehiculo(true)}
                  className="w-full text-sm text-primary hover:text-primary-hover border border-primary hover:border-primary-hover py-2 px-3 rounded-md transition-colors"
                >
                  + Agregar nuevo vehículo
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Formulario para nuevo vehículo */}
                <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    {vehiculos.length > 0 ? 'Agregar nuevo vehículo' : 'Registra tu primer vehículo'}
                  </h4>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Marca (ej: Toyota, Honda)"
                      value={formData.marca || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                      className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 py-2 px-3 rounded-md transition-colors focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                      required={showNuevoVehiculo || vehiculos.length === 0}
                    />
                    
                    <input
                      type="text"
                      placeholder="Modelo (ej: Corolla, Civic)"
                      value={formData.modelo || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                      className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 py-2 px-3 rounded-md transition-colors focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                      required={showNuevoVehiculo || vehiculos.length === 0}
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={formData.año || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, año: parseInt(e.target.value) }))}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 py-2 px-3 rounded-md transition-colors focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        required={showNuevoVehiculo || vehiculos.length === 0}
                      >
                        <option value="">Año</option>
                        {aniosVehiculos.map(año => (
                          <option key={año} value={año}>{año}</option>
                        ))}
                      </select>
                      
                      <select
                        value={formData.tipoVehiculo || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, tipoVehiculo: e.target.value }))}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 py-2 px-3 rounded-md transition-colors focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        required={showNuevoVehiculo || vehiculos.length === 0}
                      >
                        <option value="">Tipo</option>
                        {tiposVehiculo.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Color"
                        value={formData.color || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 py-2 px-3 rounded-md transition-colors focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        required={showNuevoVehiculo || vehiculos.length === 0}
                      />
                      
                      <input
                        type="text"
                        placeholder="Placa"
                        value={formData.placa || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 py-2 px-3 rounded-md transition-colors focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        required={showNuevoVehiculo || vehiculos.length === 0}
                      />
                    </div>
                  </div>
                  
                  {vehiculos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowNuevoVehiculo(false);
                        setFormData(prev => ({ 
                          ...prev, 
                          marca: '', 
                          modelo: '', 
                          año: '', 
                          color: '', 
                          placa: '', 
                          tipoVehiculo: '' 
                        }));
                      }}
                      className="mt-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      ← Seleccionar vehículo existente
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Campos generales */}
          <div className="mb-4">
            <label className="text-gray-900 dark:text-gray-100 text-sm mb-1 block transition-colors">Método de Pago</label>
            <select
              name="metodoPago"
              value={formData.metodoPago}
              onChange={handleChange}
              className="w-full bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 py-2 sm:py-3 px-3 sm:px-4 rounded-md appearance-none transition-colors focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base"
              required
            >
              <option value="">Elige método</option>
              {metodosPago.map((m, i) => (
                <option key={i} value={m}>{m}</option>
              ))}
            </select>
          </div>
          {/* Mostrar precio destacado justo antes del botón */}
          {((formData.vehiculoSeleccionado && vehiculos.find(v => v._id === formData.vehiculoSeleccionado)) || formData.tipoVehiculo) && formData.subtipoServicio && price > 0 && (
            <div className="mb-4 text-center">
              <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-1 transition-colors">Precio estimado:</p>
              <p className="text-gray-900 dark:text-gray-100 text-xl sm:text-2xl font-bold transition-colors">${price.toFixed(2)} MXN</p>
              {showMultiplicadorNote && (
                <p className="text-xs text-yellow-500 dark:text-yellow-400 mt-2 transition-colors">Incluye ajuste por tipo de vehículo (SUV, Pickup o Minivan).</p>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={!isFormValid() || isLoading || !userLocation}
            className={`mt-2 py-2 sm:py-3 px-4 rounded-md transition-colors w-full font-semibold text-sm sm:text-base ${isFormValid() && !isLoading && userLocation
              ? "bg-primary hover:bg-primary-hover text-white"
              : "bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-400 cursor-not-allowed"
              }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                Procesando...
              </div>
            ) : !userLocation ? (
              'Esperando ubicación...'
            ) : (
              'Solicitar Servicio'
            )}
          </button>
        </form>
      </div>

      {/* Modal para permisos de ubicación */}
      {showLocationModal && locationError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Permisos de ubicación necesarios
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {locationError.code === 'PERMISSION_DENIED' 
                  ? "Has denegado el acceso a la ubicación. Para continuar, necesitas permitir el acceso en tu navegador."
                  : locationError.message
                }
              </p>
              
              {locationError.code === 'PERMISSION_DENIED' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    ¿Cómo permitir el acceso?
                  </h4>
                  <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>1. Busca el ícono de ubicación 📍 en la barra de direcciones</li>
                    <li>2. Haz clic en "Permitir" o "Allow"</li>
                    <li>3. Recarga la página si es necesario</li>
                  </ol>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              {locationError.canRetry && (
                <button
                  onClick={handleLocationRequest}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-lg font-medium"
                >
                  Intentar nuevamente
                </button>
              )}
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  router.back();
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        showCancel={modalState.showCancel}
      />
    </div>
  );
};

export default ServiceForm;
