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
      llantas_reparacion: ["despinchado", "reparar llanta", "parche", "arreglar ponchadura", "reparación de llanta"],
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
    },
    llantas: {
      comprar: ["comprar llanta", "llanta nueva", "cambiar llanta", "necesito llanta", "quiero llanta nueva"],
      ponchadura: ["ponchadura", "ponchó", "pinchazo", "llanta pinchada", "llanta desinflada", "llanta ponchada"]
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
  const [modalDiagnostico, setModalDiagnostico] = useState(false);
  const [tallerSeleccionado, setTallerSeleccionado] = useState("");
  const [reporteGenerado, setReporteGenerado] = useState(null);
  const bottomRef = useRef(null);

  // Sugerencias rápidas para problemas comunes con diagnóstico específico
  const sugerenciasRapidas = [
    "Mi carro no enciende y no hace ningún ruido",
    "Escucho un chirrido cuando freno",
    "Se prendió la luz del check engine", 
    "Mi auto se está sobrecalentando",
    "Perdí las llaves dentro del carro",
    "Tuve un accidente y no puedo manejar",
    "Se me ponchó una llanta en carretera",
    "Mi carro vibra mucho al acelerar"
  ];

  const usarSugerencia = (sugerencia) => {
    setUserMessage(sugerencia);
    setShowSuggestions(false);
  };

  // Función para anonimizar datos sensibles
  const anonimizarDatos = (texto) => {
    let textoAnonimo = texto;
    
    // Anonimizar números de teléfono
    textoAnonimo = textoAnonimo.replace(/(\d{3})\d{3}(\d{4})/g, '$1***$2');
    
    // Anonimizar placas de vehículos (formato mexicano)
    textoAnonimo = textoAnonimo.replace(/[A-Z]{3}-?\d{3}-?[A-Z]/g, '***-***-*');
    
    // Anonimizar números de serie/VIN parciales
    textoAnonimo = textoAnonimo.replace(/[A-Z0-9]{10,}/g, (match) => 
      match.substring(0, 3) + '*'.repeat(match.length - 6) + match.substring(match.length - 3)
    );
    
    // No anonimizar información técnica necesaria para diagnóstico
    return textoAnonimo;
  };

  // Función para generar reporte de diagnóstico
  const generarReporteDiagnostico = () => {
    const serviciosDetectados = [];
    const sintomas = [];
    const recomendaciones = [];
    
    // Analizar el chat para extraer información
    chat.forEach(message => {
      if (message.role === "user") {
        sintomas.push(anonimizarDatos(message.content)); // Anonimizar datos del usuario
      } else if (message.role === "assistant") {
        // Detectar servicios mencionados
        const content = message.content.toLowerCase();
        if (content.includes("asistencia vehicular")) serviciosDetectados.push("Asistencia Vehicular");
        if (content.includes("tienda de llantas")) serviciosDetectados.push("Tienda de Llantas");
        if (content.includes("grúa")) serviciosDetectados.push("Servicio de Grúa");
        if (content.includes("diagnóstico")) serviciosDetectados.push("Diagnóstico Especializado");
        if (content.includes("cerrajería")) serviciosDetectados.push("Cerrajería Automotriz");
        if (content.includes("limpieza")) serviciosDetectados.push("Limpieza Vehicular");
        
        recomendaciones.push(message.content);
      }
    });

    const reporte = {
      id: `DIAG-${Date.now()}`,
      fecha: new Date().toLocaleString('es-MX'),
      sintomas: [...new Set(sintomas)],
      serviciosDetectados: [...new Set(serviciosDetectados)],
      recomendaciones: recomendaciones.slice(-2), // Últimas 2 recomendaciones
      confianza: serviciosDetectados.length > 0 ? "Alta" : "Media",
      prioridad: determinarPrioridad(sintomas.join(' ')),
      chatCompleto: chat
    };

    setReporteGenerado(reporte);
    setModalDiagnostico(true);
  };

  // Función para determinar prioridad
  const determinarPrioridad = (texto) => {
    const textoLower = texto.toLowerCase();
    if (textoLower.includes("accidente") || textoLower.includes("no enciende") || textoLower.includes("humo")) {
      return "Urgente";
    } else if (textoLower.includes("ruido") || textoLower.includes("ponch") || textoLower.includes("batería")) {
      return "Media";
    }
    return "Baja";
  };

  // Función para enviar diagnóstico al taller
  const enviarDiagnosticoATaller = () => {
    if (!tallerSeleccionado || !reporteGenerado) return;

    // Simular envío
    alert(`📨 Diagnóstico enviado exitosamente a:\n\n🏪 ${tallerSeleccionado}\n📋 Código: ${reporteGenerado.id}\n⏰ ${reporteGenerado.fecha}\n\nEl taller recibirá:\n• Historial completo del chat\n• Síntomas identificados\n• Recomendaciones de la IA\n• Nivel de prioridad: ${reporteGenerado.prioridad}\n\n✅ Te notificaremos cuando el técnico revise el diagnóstico.`);
    
    setModalDiagnostico(false);
    setTallerSeleccionado("");
    
    // Agregar mensaje de confirmación al chat
    const confirmacion = {
      id: Date.now(),
      role: "assistant",
      content: `✅ **Diagnóstico enviado al taller**\n\n📋 **Código:** ${reporteGenerado.id}\n🏪 **Taller:** ${tallerSeleccionado}\n⏰ **Enviado:** ${reporteGenerado.fecha}\n🔔 **Estado:** En revisión\n\nEl técnico revisará tu diagnóstico y te contactará pronto. Recibirás una notificación cuando haya una actualización.`,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setChat(prev => [...prev, confirmacion]);
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
        asistencia: "Asistencia vehicular (problemas de batería, motor, combustible, reparación de llantas, refrigeración, sistema eléctrico)",
        grua: "Servicio de grúa (accidentes, vehículo varado, motor dañado, remolque al taller)",
        diagnostico: "Diagnóstico vehicular (ruidos extraños, luces de alerta, comportamiento anómalo, códigos de error)",
        limpieza: "Limpieza vehicular (lavado, detallado, encerado, limpieza interior)",
        cerrajeria: "Cerrajería automotriz (llaves perdidas, vehículo cerrado, problemas de cerradura)",
        llantas: "Tienda de llantas (venta de llantas nuevas, diferentes marcas y medidas)"
      };

      const serviciosDetectados = serviciosRelevantes.map(srv => serviciosInfo[srv]).filter(Boolean);
      const contextoProblemática = serviciosDetectados.length > 0 
        ? `\n\nBasado en el mensaje del usuario, los servicios más relevantes son: ${serviciosDetectados.join(", ")}. Enfócate SOLO en recomendar estos servicios específicos.`
        : "\n\nSi no puedes identificar un problema específico, pregunta más detalles antes de recomendar servicios.";

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `Eres DriveSync Assistant, un EXPERTO MECÁNICO AUTOMOTRIZ con 20 años de experiencia. Tu trabajo es diagnosticar problemas vehiculares y recomendar el servicio más adecuado.

SERVICIOS DISPONIBLES:
- Asistencia vehicular: Problemas mecánicos menores, batería, motor, combustible, reparación de llantas, refrigeración, sistema eléctrico
- Servicio de grúa: Accidentes, vehículos varados, motor completamente dañado, remolque al taller
- Diagnóstico vehicular: Ruidos extraños, luces de alerta, comportamientos anómalos, códigos de error, revisiones especializadas
- Limpieza vehicular: Lavado, detallado, encerado, limpieza interior
- Cerrajería automotriz: Llaves perdidas, vehículo cerrado, problemas de cerradura
- Tienda de llantas: Venta de llantas nuevas, diferentes marcas y medidas

CASOS ESPECIALES - LLANTAS:
Si el usuario menciona ponchadura, llanta pinchada, llanta desinflada o problemas de llanta:
1. PREGUNTA específicamente: "¿Prefieres reparar la llanta ponchada (servicio de despinchado) o comprar una llanta nueva?"
2. Si dice REPARAR → Recomienda ASISTENCIA VEHICULAR (servicio de despinchado)
3. Si dice COMPRAR → Recomienda TIENDA DE LLANTAS (llantas nuevas)
4. Si no especifica → Ofrece ambas opciones claramente

METODOLOGÍA DE DIAGNÓSTICO:
1. ESCUCHA activamente los síntomas descritos
2. HAZ preguntas específicas para confirmar el diagnóstico
3. IDENTIFICA la causa más probable
4. RECOMIENDA el servicio específico que resuelve el problema
5. EXPLICA brevemente por qué ese servicio es el adecuado

EJEMPLOS DE DIAGNÓSTICO INTELIGENTE:

SÍNTOMA: "Mi carro no enciende"
DIAGNÓSTICO: Pregunta específica sobre qué pasa exactamente (¿hace algún ruido? ¿prenden las luces? ¿cuándo fue la última vez que funcionó?)
- Si no hace ruido ni prenden luces → ASISTENCIA (problema de batería)
- Si hace ruido pero no arranca → ASISTENCIA (problema de motor/combustible)
- Si está completamente muerto → GRÚA (problema grave)

SÍNTOMA: "Se me ponchó una llanta"
DIAGNÓSTICO: → "¿Prefieres reparar la llanta ponchada o comprar una llanta nueva? La reparación es más económica, pero una llanta nueva te dará mayor seguridad."

SÍNTOMA: "Hace ruidos raros"
DIAGNÓSTICO: Pregunta sobre tipo de ruido y cuándo ocurre
- Chirrido al frenar → ASISTENCIA (frenos)
- Golpeteo en motor → DIAGNÓSTICO (revisión especializada)
- Ruido en llantas → ASISTENCIA (llantas/suspensión)

SÍNTOMA: "Se prende una luz"
DIAGNÓSTICO: Pregunta qué luz específicamente
- Check Engine → DIAGNÓSTICO (scanner/códigos de error)
- Luz de batería → ASISTENCIA (sistema eléctrico)
- Luz de temperatura → ASISTENCIA (refrigeración)

INSTRUCCIONES:
1. Responde en máximo 3-4 líneas
2. Sé ESPECÍFICO en tu diagnóstico
3. HAZ preguntas inteligentes si necesitas más información
4. RECOMIENDA solo UN servicio (el más apropiado)
5. EXPLICA brevemente por qué ese servicio resuelve el problema
6. Usa un tono profesional pero cercano
7. Para problemas de llantas, SIEMPRE pregunta sobre reparar vs comprar nueva
8. Cuando recomiendes un servicio, usa EXACTAMENTE estos términos:
   - "Te recomiendo el servicio de **Asistencia Vehicular**" (para reparaciones)
   - "Te recomiendo la **Tienda de Llantas**" (para comprar llantas nuevas)
   - "Te recomiendo el servicio de **Grúa**" (para remolque)
   - "Te recomiendo el **Diagnóstico**" (para análisis)
   - "Te recomiendo el servicio de **Limpieza**" (para lavado)
   - "Te recomiendo el servicio de **Cerrajería**" (para llaves)

${contextoProblemática}`,
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
      console.error("Error sending message:", error);
      
      // Respuesta inteligente de emergencia basada en el mensaje del usuario
      let emergencyResponse = "Estoy experimentando problemas técnicos temporales, pero puedo ayudarte:";
      
      const userInput = userMessage.toLowerCase();
      if (userInput.includes("ponch") || userInput.includes("llanta")) {
        emergencyResponse = "¿Prefieres reparar la llanta ponchada o comprar una llanta nueva? La reparación es más económica, pero una llanta nueva te dará mayor seguridad.";
      } else if (userInput.includes("no enciende") || userInput.includes("no arranca") || userInput.includes("no prende")) {
        emergencyResponse = "Para problemas de encendido, te recomiendo el servicio de **Asistencia Vehicular**. ¿El auto hace algún ruido cuando intentas encenderlo?";
      } else if (userInput.includes("batería") || userInput.includes("bateria")) {
        emergencyResponse = "Te recomiendo el servicio de **Asistencia Vehicular** para problemas de batería. Podemos hacer carga de batería o reemplazo si es necesario.";
      } else if (userInput.includes("ruido") || userInput.includes("sonido")) {
        emergencyResponse = "Te recomiendo el **Diagnóstico** vehicular para identificar el origen del ruido. ¿Cuándo ocurre el ruido?";
      } else if (userInput.includes("accidente") || userInput.includes("choque")) {
        emergencyResponse = "Te recomiendo el servicio de **Grúa** para casos de accidente. ¿El auto se puede mover por sí mismo?";
      } else if (userInput.includes("llaves") || userInput.includes("llave")) {
        emergencyResponse = "Te recomiendo el servicio de **Cerrajería** automotriz. Podemos abrir el vehículo y hacer duplicado de llaves.";
      }
      
      setChat((prev) => [...prev, { role: "assistant", content: emergencyResponse }]);
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
                const iconos = ["�", "�", "⚠️", "🌡️", "�", "💥", "🛞", "⚡"];
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
              
              {/* Botones de acción específicos cuando la IA recomienda un servicio */}
              {message.role === "assistant" && (() => {
                const content = message.content.toLowerCase();
                
                // Detectar recomendaciones específicas de servicios
                const recomendaciones = [];
                
                if (content.includes("asistencia vehicular") || content.includes("servicio de asistencia") || 
                    (content.includes("despinchado") && content.includes("técnicos"))) {
                  recomendaciones.push({
                    tipo: "asistencia",
                    label: "🚗 Solicitar Asistencia Vehicular",
                    descripcion: "Despinchado y reparación de llantas",
                    color: "bg-blue-600 hover:bg-blue-700"
                  });
                }
                
                if (content.includes("tienda de llantas") || content.includes("llanta nueva") || content.includes("comprar llanta")) {
                  recomendaciones.push({
                    tipo: "llantas",
                    label: "🛞 Ver Tienda de Llantas",
                    descripcion: "Llantas nuevas de diferentes marcas",
                    color: "bg-orange-600 hover:bg-orange-700"
                  });
                }
                
                if (content.includes("servicio de grúa") || content.includes("grúa")) {
                  recomendaciones.push({
                    tipo: "grua",
                    label: "🚛 Solicitar Grúa",
                    descripcion: "Remolque y traslado al taller",
                    color: "bg-red-600 hover:bg-red-700"
                  });
                }
                
                if (content.includes("diagnóstico") || content.includes("diagnostico") || content.includes("scanner")) {
                  recomendaciones.push({
                    tipo: "diagnostico",
                    label: "🔧 Solicitar Diagnóstico",
                    descripcion: "Análisis especializado del problema",
                    color: "bg-purple-600 hover:bg-purple-700"
                  });
                }
                
                if (content.includes("limpieza") || content.includes("lavado")) {
                  recomendaciones.push({
                    tipo: "limpieza",
                    label: "🧽 Solicitar Limpieza",
                    descripcion: "Lavado y detallado vehicular",
                    color: "bg-green-600 hover:bg-green-700"
                  });
                }
                
                if (content.includes("cerrajería") || content.includes("llaves perdidas")) {
                  recomendaciones.push({
                    tipo: "cerrajeria",
                    label: "🔑 Solicitar Cerrajería",
                    descripcion: "Apertura y duplicado de llaves",
                    color: "bg-yellow-600 hover:bg-yellow-700"
                  });
                }
                
                // Detectar si pregunta por ubicación para asistencia
                if (content.includes("¿en qué punto") || content.includes("ubicación") || content.includes("dónde te encuentras")) {
                  if (!recomendaciones.some(r => r.tipo === "asistencia")) {
                    recomendaciones.push({
                      tipo: "asistencia",
                      label: "🚗 Solicitar Asistencia Vehicular",
                      descripcion: "Despinchado y reparación en tu ubicación",
                      color: "bg-blue-600 hover:bg-blue-700"
                    });
                  }
                }
                
                // Solo mostrar botones si hay recomendaciones específicas
                if (recomendaciones.length > 0) {
                  return (
                    <div className="mt-3 space-y-2">
                      {recomendaciones.map((rec, index) => (
                        <div key={index} className="border border-input-border rounded-lg p-3 bg-card-bg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-sm">{rec.label}</h4>
                              <p className="text-xs text-gray-400">{rec.descripcion}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link 
                              href={rec.tipo === "llantas" ? "/tienda-llantas" : `/main/extra/serviceForm?tipo=${rec.tipo}`}
                              className="flex-1"
                            >
                              <button className={`w-full ${rec.color} text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2`}>
                                {rec.tipo === "llantas" ? "� Ver Tienda" : "�📱 Solicitar Ahora"}
                              </button>
                            </Link>
                            <button 
                              onClick={() => setUserMessage(`Cuéntame más sobre el servicio de ${rec.tipo}`)}
                              className="px-3 py-2 border border-input-border rounded-lg text-sm hover:bg-input-bg transition-colors"
                            >
                              ℹ️
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Botón para enviar diagnóstico al técnico */}
                      {chat.length >= 4 && ( // Mostrar después de al menos 2 intercambios
                        <div className="border border-primary/30 rounded-lg p-3 bg-primary/10">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-sm text-foreground">📨 Enviar Diagnóstico al Técnico</h4>
                              <p className="text-xs text-text-muted">Comparte este diagnóstico con un especialista para confirmación</p>
                            </div>
                          </div>
                          <button 
                            onClick={generarReporteDiagnostico}
                            className="w-full bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors hover:bg-primary-hover"
                          >
                            📋 Generar Reporte para Técnico
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                // Mostrar solo el botón de diagnóstico si no hay recomendaciones específicas pero hay conversación
                if (chat.length >= 4) {
                  return (
                    <div className="mt-3">
                      <div className="border border-primary/30 rounded-lg p-3 bg-primary/10">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-sm text-foreground">📨 Enviar Diagnóstico al Técnico</h4>
                            <p className="text-xs text-text-muted">Comparte este diagnóstico con un especialista</p>
                          </div>
                        </div>
                        <button 
                          onClick={generarReporteDiagnostico}
                          className="w-full bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors hover:bg-primary-hover"
                        >
                          📋 Generar Reporte para Técnico
                        </button>
                      </div>
                    </div>
                  );
                }
                
                return null;
              })()}
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

      {/* Modal de Diagnóstico */}
      {modalDiagnostico && reporteGenerado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-bg border border-input-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-foreground">📋 Reporte de Diagnóstico</h2>
                <button 
                  onClick={() => setModalDiagnostico(false)}
                  className="text-text-muted hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              {/* Resumen del reporte */}
              <div className="space-y-4 mb-6">
                <div className="bg-input-bg border border-input-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">📊 Resumen del Diagnóstico</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-text-secondary">Código:</span>
                      <span className="text-foreground font-mono ml-2">{reporteGenerado.id}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Fecha:</span>
                      <span className="text-foreground ml-2">{reporteGenerado.fecha}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Confianza:</span>
                      <span className={`ml-2 font-semibold ${
                        reporteGenerado.confianza === 'Alta' ? 'text-success' : 'text-warning'
                      }`}>{reporteGenerado.confianza}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Prioridad:</span>
                      <span className={`ml-2 font-semibold ${
                        reporteGenerado.prioridad === 'Urgente' ? 'text-error' : 
                        reporteGenerado.prioridad === 'Media' ? 'text-warning' : 'text-success'
                      }`}>{reporteGenerado.prioridad}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-input-bg border border-input-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">🔍 Síntomas Reportados</h4>
                  <ul className="space-y-1">
                    {reporteGenerado.sintomas.map((sintoma, index) => (
                      <li key={index} className="text-text-secondary text-sm flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {sintoma}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-input-bg border border-input-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">🛠️ Servicios Detectados</h4>
                  <div className="flex flex-wrap gap-2">
                    {reporteGenerado.serviciosDetectados.map((servicio, index) => (
                      <span key={index} className="bg-primary/20 text-primary px-2 py-1 rounded text-sm">
                        {servicio}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-input-bg border border-input-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">💡 Recomendaciones IA</h4>
                  <div className="space-y-2">
                    {reporteGenerado.recomendaciones.map((rec, index) => (
                      <div key={index} className="text-text-secondary text-sm bg-card-bg border border-input-border rounded p-2">
                        {rec.length > 100 ? rec.substring(0, 100) + '...' : rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selección de taller */}
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3">🏪 Seleccionar Taller</h3>
                <select 
                  value={tallerSeleccionado}
                  onChange={(e) => setTallerSeleccionado(e.target.value)}
                  className="w-full bg-input-bg border border-input-border rounded px-3 py-2 text-foreground"
                >
                  <option value="">Selecciona un taller...</option>
                  <option value="AutoServicio López - Zona Centro (2.1 km)">🔧 AutoServicio López - Zona Centro (2.1 km) ⭐ 4.8</option>
                  <option value="Taller Mecánico Rodríguez - Col. Doctores (3.5 km)">🛠️ Taller Mecánico Rodríguez - Col. Doctores (3.5 km) ⭐ 4.6</option>
                  <option value="Servicio Automotriz Elite - Zona Rosa (4.2 km)">🏆 Servicio Automotriz Elite - Zona Rosa (4.2 km) ⭐ 4.9</option>
                  <option value="Mecánica Rápida 24h - Col. Roma (5.0 km)">⚡ Mecánica Rápida 24h - Col. Roma (5.0 km) ⭐ 4.7</option>
                  <option value="Especialistas Automotrices - Polanco (6.8 km)">🎯 Especialistas Automotrices - Polanco (6.8 km) ⭐ 4.9</option>
                </select>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setModalDiagnostico(false)}
                  className="flex-1 border border-input-border text-text-secondary py-2 px-4 rounded hover:bg-input-bg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={enviarDiagnosticoATaller}
                  disabled={!tallerSeleccionado}
                  className="flex-1 bg-primary text-white py-2 px-4 rounded hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📨 Enviar Diagnóstico
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
