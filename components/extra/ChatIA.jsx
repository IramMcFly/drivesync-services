"use client";

import { useState, useEffect, useRef } from "react";
import { FiSend } from "react-icons/fi";
import Link from "next/link";
import SuperEmergencyButton from "../ui/SuperEmergencyButton";


// Detecta servicios mencionados en el texto usando un sistema de detección inteligente
function detectarServicios(texto, serviciosDisponibles) {
  if (!Array.isArray(serviciosDisponibles)) return [];
  const textoLower = texto.toLowerCase();
  
  // Sistema de palabras clave más específico y completo
  const keywordsByService = {
    asistencia: {
      bateria: ["batería", "bateria", "descargada", "descargó", "no enciende", "no prende", "muerta", "agotada", "cables", "puente"],
      motor: ["motor", "no arranca", "no enciende", "no prende", "se apagó", "se paró", "humo", "sobrecalentamiento", "temperatura"],
      combustible: ["gasolina", "combustible", "se quedó sin", "tanque vacío", "sin gas", "diesel"],
      llantas: ["llanta", "ponchadura", "ponchazo", "inflada", "desinflada", "presión", "aire"],
      refrigeracion: ["calentó", "calor", "temperatura alta", "refrigerante", "anticongelante", "radiador", "vapor"],
      electrico: ["luces", "eléctrico", "fusible", "alternador", "arranque", "marcha"]
    },
    grua: {
      accidente: ["accidente", "choque", "chocué", "golpe", "dañado", "destruido"],
      varado: ["varado", "no se mueve", "atascado", "atorado", "hundido", "arena", "lodo"],
      motor_grave: ["motor fundido", "motor dañado", "no arranca para nada", "totalmente dañado"],
      remolque: ["remolcar", "arrastrar", "llevar al taller", "transportar", "mover el carro"]
    },
    diagnostico: {
      ruidos: ["ruido", "sonido raro", "rechina", "chirría", "golpeteo", "vibración"],
      luces: ["luz encendida", "testigo", "check engine", "alerta", "warning", "indicador"],
      comportamiento: ["se siente raro", "comportamiento extraño", "no responde bien", "falla intermitente"],
      revision: ["revisar", "checar", "diagnosticar", "scanner", "computadora", "códigos"]
    },
    limpieza: {
      lavado: ["lavar", "lavado", "sucio", "manchado", "polvo", "tierra", "lodo"],
      detallado: ["detallado", "encerado", "pulido", "brillar", "aspirado", "interior"],
      mantenimiento: ["limpieza profunda", "desinfección", "tapicería", "vestiduras"]
    },
    cerrajeria: {
      llaves: ["llaves", "llave", "perdí", "se me perdieron", "no tengo", "dejé adentro"],
      cerrado: ["cerré", "cerrado", "no puedo abrir", "trabado", "atascado", "no abre"],
      cerradura: ["cerradura", "chapa", "cilindro", "no gira", "rota", "dañada"]
    }
  };

  // Función para calcular relevancia de un servicio
  const calcularRelevancia = (tipoServicio, subcategorias) => {
    let puntuacion = 0;
    let coincidencias = [];

    for (const [subcategoria, palabras] of Object.entries(subcategorias)) {
      const coincidenciasSubcat = palabras.filter(palabra => textoLower.includes(palabra));
      if (coincidenciasSubcat.length > 0) {
        puntuacion += coincidenciasSubcat.length * 10; // Más peso por múltiples coincidencias
        coincidencias.push({
          subcategoria,
          palabras: coincidenciasSubcat,
          peso: coincidenciasSubcat.length
        });
      }
    }

    return { puntuacion, coincidencias, tipo: tipoServicio };
  };

  // Calcular relevancia para cada tipo de servicio
  const analisisServicios = Object.entries(keywordsByService).map(([tipo, subcategorias]) => 
    calcularRelevancia(tipo, subcategorias)
  ).filter(resultado => resultado.puntuacion > 0);

  // Ordenar por relevancia (mayor puntuación primero)
  analisisServicios.sort((a, b) => b.puntuacion - a.puntuacion);

  // Si no hay coincidencias específicas, buscar palabras generales
  if (analisisServicios.length === 0) {
    const palabrasGenerales = {
      "problema": ["asistencia", "diagnostico"],
      "ayuda": ["asistencia"],
      "emergencia": ["asistencia", "grua"],
      "taller": ["grua", "diagnostico"],
      "reparar": ["asistencia", "diagnostico"]
    };

    for (const [palabra, servicios] of Object.entries(palabrasGenerales)) {
      if (textoLower.includes(palabra)) {
        return servicios;
      }
    }
    
    // Si no encuentra nada específico, ofrecer solo asistencia como default
    return ["asistencia"];
  }

  // Retornar solo los servicios más relevantes (top 2)
  return analisisServicios.slice(0, 2).map(resultado => resultado.tipo);
}

export default function AsistenteEspecializado() {
  const [userMessage, setUserMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [serviciosCargando, setServiciosCargando] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showServiceConfirm, setShowServiceConfirm] = useState(null);
  const bottomRef = useRef(null);

  // Sugerencias rápidas para problemas comunes
  const sugerenciasRapidas = [
    "Se me ponchó una llanta",
    "Mi carro no enciende",
    "Se me calentó el motor", 
    "Perdí las llaves de mi auto",
    "Mi carro está haciendo ruidos raros",
    "Tuve un accidente",
    "Se me acabó la gasolina",
    "Necesito lavar mi auto"
  ];

  const usarSugerencia = (sugerencia) => {
    setUserMessage(sugerencia);
    setShowSuggestions(false);
  };

  const confirmarServicio = (tipo, info) => {
    setShowServiceConfirm({ tipo, info });
  };

  const procederConServicio = () => {
    if (showServiceConfirm) {
      window.location.href = `/main/extra/serviceForm?tipo=${encodeURIComponent(showServiceConfirm.tipo)}`;
    }
  };

  const handleSend = async () => {
    if (!userMessage.trim()) return;
    
    // Ocultar sugerencias cuando el usuario empiece a chatear
    setShowSuggestions(false);
    
    // Detectar servicios relevantes antes de enviar
    const serviciosRelevantes = detectarServicios(userMessage, serviciosDisponibles);
    
    const newChat = [...chat, { role: "user", content: userMessage }];
    setChat(newChat);
    setUserMessage("");
    setLoading(true);

    try {
      // Crear contexto inteligente basado en servicios detectados
      const serviciosInfo = {
        asistencia: "Asistencia vehicular (problemas de batería, motor, combustible, llantas, refrigeración, sistema eléctrico)",
        grua: "Servicio de grúa (accidentes, vehículo varado, motor dañado, remolque al taller)",
        diagnostico: "Diagnóstico vehicular (ruidos extraños, luces de alerta, comportamiento anómalo, códigos de error)",
        limpieza: "Limpieza vehicular (lavado, detallado, encerado, limpieza interior)",
        cerrajeria: "Cerrajería automotriz (llaves perdidas, vehículo cerrado, problemas de cerradura)"
      };

      const serviciosDetectados = serviciosRelevantes.map(srv => serviciosInfo[srv]).filter(Boolean);
      const contextoProblemática = serviciosDetectados.length > 0 
        ? `\n\nBasado en el mensaje del usuario, los servicios más relevantes son: ${serviciosDetectados.join(", ")}. Enfócate SOLO en recomendar estos servicios específicos.`
        : "\n\nSi no puedes identificar un problema específico, pregunta más detalles antes de recomendar servicios.";

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "mistralai/mistral-small-3.2-24b-instruct:free",
          messages: [
            {
              role: "system",
              content: `Eres DriveSync Assistant, un asistente automotriz especializado. 

SERVICIOS DISPONIBLES:
- Asistencia vehicular: Para problemas mecánicos, eléctricos, batería, motor, combustible
- Servicio de grúa: Para accidentes, vehículos varados, remolque
- Diagnóstico vehicular: Para ruidos, luces de alerta, comportamientos extraños
- Limpieza vehicular: Para lavado, detallado, mantenimiento estético
- Cerrajería automotriz: Para problemas con llaves y cerraduras

INSTRUCCIONES:
1. Da respuestas de máximo 3-4 líneas
2. Sé empático y profesional
3. SOLO recomienda servicios que sean RELEVANTES al problema específico mencionado
4. Si mencionan "ponchadura" o "llanta", recomienda ASISTENCIA, NO cerrajería
5. Si mencionan "accidente" o "varado", recomienda GRÚA
6. Si mencionan "ruidos" o "luces", recomienda DIAGNÓSTICO
7. Si mencionan "sucio" o "lavado", recomienda LIMPIEZA
8. Si mencionan "llaves perdidas" o "cerrado", recomienda CERRAJERÍA
9. NO ofrezcas todos los servicios, solo los pertinentes${contextoProblemática}`,
            },
            ...newChat,
          ],
        }),
      });

      const data = await response.json();

      if (data.error) {
        setChat((prev) => [...prev, { role: "assistant", content: "No se pudo procesar tu mensaje. Verifica la conexión o intenta más tarde." }]);
      } else {
        const aiResponse = data.choices?.[0]?.message?.content || "No pude procesar tu solicitud, intenta de nuevo.";
        setChat((prev) => [...prev, { role: "assistant", content: aiResponse }]);
      }
    } catch (error) {
      setChat((prev) => [...prev, { role: "assistant", content: "Hubo un error. Por favor intenta más tarde." }]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar servicios desde el endpoint al montar
  useEffect(() => {
    async function fetchServicios() {
      setServiciosCargando(true);
      try {
        const res = await fetch("/api/servicios");
        const data = await res.json();
        // Usar los datos tal cual, pero asegurando que tengan tipo, nombre, descripcion y label
        const normalizados = Array.isArray(data)
          ? data.map(s => ({
              tipo: s.tipo || s.nombre?.toLowerCase() || s._id,
              nombre: s.nombre || s.tipo || "Servicio",
              descripcion: s.descripcion || "",
              label: s.nombre || s.tipo || "Servicio",
              _id: s._id
            }))
          : [];
        setServiciosDisponibles(normalizados);
      } catch {
        setServiciosDisponibles([]);
      } finally {
        setServiciosCargando(false);
      }
    }
    fetchServicios();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (serviciosCargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-foreground flex flex-col">
      <div className="flex flex-col flex-1 max-w-2xl w-full mx-auto bg-card-bg rounded-lg shadow-md border border-input-border overflow-hidden">
        <div className="p-4 border-b border-input-border text-center">
          <h1 className="text-2xl font-bold">Asistente Especializado</h1>
          <p className="text-gray-400 text-sm mt-1">Consulta rápida para emergencias automotrices</p>
        </div>

        {/* Sugerencias rápidas */}
        {showSuggestions && chat.length === 0 && (
          <div className="p-4 border-b border-input-border">
            <p className="text-sm text-gray-400 mb-3">🚗 Problemas comunes - Selecciona uno:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sugerenciasRapidas.map((sugerencia, index) => {
                const iconos = ["🛞", "🔋", "🌡️", "🔑", "🔊", "💥", "⛽", "🧽"];
                return (
                  <button
                    key={index}
                    onClick={() => usarSugerencia(sugerencia)}
                    className="text-left p-3 text-sm bg-input-bg hover:bg-primary/20 rounded-lg transition-colors border border-input-border flex items-center gap-2 hover:scale-105 transform"
                  >
                    <span className="text-lg">{iconos[index]}</span>
                    <span>{sugerencia}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-400 mb-2">💡 Consejo: Describe tu problema con detalles para obtener la mejor ayuda</p>
              <div className="flex gap-2">
                <Link href="/main/extra/serviceForm" className="flex-1">
                  <button className="w-full bg-primary hover:bg-primary-hover text-white py-2 px-3 rounded text-sm">
                    📋 Ir directo al formulario
                  </button>
                </Link>
                <Link href="/main/asistencia" className="flex-1">
                  <button className="w-full border border-primary text-primary hover:bg-primary/10 py-2 px-3 rounded text-sm">
                    🏠 Ver servicios
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
          {chat.map((message, index) => (
            <div key={index}>
              <div
                className={`p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary/30 self-end text-right"
                    : "bg-input-bg self-start text-left"
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
              </div>
              
              {/* Botones de acción rápida después de respuestas del asistente */}
              {message.role === "assistant" && (
                <div className="mt-3 space-y-2">
                  {(() => {
                    const serviciosDetectados = detectarServicios(message.content, serviciosDisponibles);
                    const serviciosInfo = {
                      asistencia: { 
                        label: "🚗 Solicitar Asistencia Vehicular", 
                        color: "bg-blue-600 hover:bg-blue-700",
                        descripcion: "Problemas mecánicos, batería, motor"
                      },
                      grua: { 
                        label: "🚛 Solicitar Servicio de Grúa", 
                        color: "bg-red-600 hover:bg-red-700",
                        descripcion: "Remolque, accidentes, vehículo varado"
                      },
                      diagnostico: { 
                        label: "🔧 Solicitar Diagnóstico", 
                        color: "bg-purple-600 hover:bg-purple-700",
                        descripcion: "Análisis de fallas y problemas"
                      },
                      limpieza: { 
                        label: "🧽 Solicitar Limpieza", 
                        color: "bg-green-600 hover:bg-green-700",
                        descripcion: "Lavado y detallado vehicular"
                      },
                      cerrajeria: { 
                        label: "🔑 Solicitar Cerrajería", 
                        color: "bg-yellow-600 hover:bg-yellow-700",
                        descripcion: "Llaves perdidas, vehículo cerrado"
                      }
                    };

                    return serviciosDetectados.map((tipo) => {
                      const info = serviciosInfo[tipo];
                      if (!info) return null;
                      
                      return (
                        <div key={tipo} className="border border-input-border rounded-lg p-3 bg-card-bg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-sm">{info.label}</h4>
                              <p className="text-xs text-gray-400">{info.descripcion}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => confirmarServicio(tipo, info)}
                              className={`flex-1 ${info.color} text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2`}
                            >
                              📱 Solicitar Ahora
                            </button>
                            <button 
                              onClick={() => setUserMessage(`Necesito más información sobre ${tipo}`)}
                              className="px-3 py-2 border border-input-border rounded-lg text-sm hover:bg-input-bg transition-colors"
                            >
                              ℹ️
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                  
                  {/* Botón de Super Emergencia */}
                  <div className="border border-red-500/30 rounded-lg p-4 bg-red-500/10">
                    <div className="text-center mb-3">
                      <h4 className="font-semibold text-sm text-red-400 mb-1">🚨 ¿Estás en peligro real?</h4>
                      <p className="text-xs text-gray-400 mb-3">
                        Sistema de monitoreo con autoridades • Cámaras • GPS • Grabación en vivo
                      </p>
                    </div>
                    <SuperEmergencyButton className="w-full" />
                    
                    <div className="mt-3 pt-3 border-t border-red-500/20">
                      <p className="text-xs text-gray-500 text-center">
                        Para emergencias vehiculares normales, usa los botones de arriba
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="p-3 rounded-lg bg-input-bg text-left animate-pulse">
              <p className="text-sm text-gray-400">El asistente está escribiendo...</p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div
          className={`p-4 flex items-center gap-2 bg-background ${
            isMobile ? "fixed bottom-16 left-0 right-0 max-w-2xl mx-auto" : "border-t border-input-border"
          }`}
        >
          <input
            type="text"
            placeholder="Describe tu problema..."
            className="flex-1 bg-input-bg text-foreground py-2 px-4 rounded-md border border-input-border focus:outline-none focus:border-primary transition-colors"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!userMessage.trim()}
            className="bg-primary hover:bg-primary-hover text-white p-2 rounded-full disabled:bg-gray-600 transition-colors"
          >
            <FiSend size={20} />
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showServiceConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-bg rounded-lg border border-input-border max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">🚗 Confirmar Solicitud de Servicio</h3>
            <div className="mb-4">
              <h4 className="font-semibold text-primary mb-2">{showServiceConfirm.info.label}</h4>
              <p className="text-sm text-gray-400 mb-3">{showServiceConfirm.info.descripcion}</p>
              <div className="bg-input-bg rounded-lg p-3 border border-input-border">
                <p className="text-xs text-gray-400 mb-2">📝 Al continuar serás redirigido al formulario para:</p>
                <ul className="text-xs space-y-1">
                  <li>• Proporcionar detalles del problema</li>
                  <li>• Confirmar tu ubicación</li>
                  <li>• Seleccionar horario preferido</li>
                  <li>• Recibir cotización instantánea</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowServiceConfirm(null)}
                className="flex-1 border border-input-border text-foreground py-2 px-4 rounded-lg text-sm hover:bg-input-bg transition-colors"
              >
                ❌ Cancelar
              </button>
              <button
                onClick={procederConServicio}
                className={`flex-1 ${showServiceConfirm.info.color} text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors`}
              >
                ✅ Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
