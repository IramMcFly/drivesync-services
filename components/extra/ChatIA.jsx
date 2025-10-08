"use client";

import { useState, useEffect, useRef } from "react";
import { FiSend } from "react-icons/fi";
import Link from "next/link";


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
          model: "llama3-8b-8192",
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
            <p className="text-sm text-gray-400 mb-3">Ejemplos de problemas comunes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sugerenciasRapidas.map((sugerencia, index) => (
                <button
                  key={index}
                  onClick={() => usarSugerencia(sugerencia)}
                  className="text-left p-2 text-xs bg-input-bg hover:bg-primary/20 rounded-lg transition-colors border border-input-border"
                >
                  {sugerencia}
                </button>
              ))}
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
              {message.role === "assistant" &&
                detectarServicios(message.content, serviciosDisponibles).map((tipo) => {
                  const servicio = serviciosDisponibles.find((s) => (s.tipo || s.nombre?.toLowerCase() || s._id) === tipo);
                  if (!servicio) return null;
                  return (
                    <Link key={tipo} href={`/main/extra/serviceForm?tipo=${encodeURIComponent(tipo)}`}>
                      <button className="mt-2 mr-2 bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-lg text-xs transition-colors">
                        {servicio.label}
                      </button>
                    </Link>
                  );
                })}
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
    </div>
  );
}
