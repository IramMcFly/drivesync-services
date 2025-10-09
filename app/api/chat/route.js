// /app/api/chat/route.js
import { NextResponse } from "next/server";

// Respuestas predefinidas inteligentes como respaldo
function getSmartResponse(userMessage) {
  const message = userMessage.toLowerCase();
  
  // Casos específicos de llantas
  if (message.includes("ponch") || message.includes("llanta")) {
    return "¿Prefieres reparar la llanta ponchada o comprar una llanta nueva? La reparación es más económica, pero una llanta nueva te dará mayor seguridad.";
  }
  
  if (message.includes("reparar") && (message.includes("llanta") || message.includes("ponch"))) {
    return "Te recomiendo el servicio de **Asistencia Vehicular** para reparar la llanta ponchada. Nuestros técnicos pueden realizar el despinchado y reparación de la llanta de manera rápida y segura, para que puedas continuar tu viaje con tranquilidad. ¿En qué punto de la carretera te encuentras?";
  }
  
  if (message.includes("comprar") && message.includes("llanta")) {
    return "Te recomiendo la **Tienda de Llantas** para comprar una llanta nueva. Tenemos diferentes marcas y medidas disponibles con instalación incluida.";
  }
  
  // Problemas de motor/arranque
  if (message.includes("no enciende") || message.includes("no arranca") || message.includes("no prende")) {
    return "Para diagnosticar correctamente: ¿El auto hace algún ruido cuando intentas encenderlo? ¿Se encienden las luces del tablero? Esta información me ayudará a recomendarte el servicio adecuado.";
  }
  
  // Problemas de batería
  if (message.includes("batería") || message.includes("bateria") || (message.includes("no enciende") && message.includes("luces"))) {
    return "Te recomiendo el servicio de **Asistencia Vehicular** para problemas de batería. Podemos hacer carga de batería o reemplazo si es necesario.";
  }
  
  // Ruidos extraños
  if (message.includes("ruido") || message.includes("sonido") || message.includes("chirr")) {
    return "Te recomiendo el **Diagnóstico** vehicular para identificar el origen del ruido. ¿Cuándo ocurre el ruido? ¿Al frenar, acelerar, o en todo momento?";
  }
  
  // Luces de alerta
  if (message.includes("luz") && (message.includes("encendida") || message.includes("testigo") || message.includes("check"))) {
    return "Te recomiendo el **Diagnóstico** con scanner para identificar el código de error. ¿Qué luz específicamente se encendió?";
  }
  
  // Accidentes
  if (message.includes("accidente") || message.includes("choque")) {
    return "Te recomiendo el servicio de **Grúa** para casos de accidente. Es importante mover el vehículo de manera segura. ¿El auto se puede mover por sí mismo?";
  }
  
  // Llaves perdidas
  if (message.includes("llaves") || message.includes("llave") || message.includes("perdí")) {
    return "Te recomiendo el servicio de **Cerrajería** automotriz. Podemos abrir el vehículo y hacer duplicado de llaves si es necesario.";
  }
  
  // Limpieza
  if (message.includes("sucio") || message.includes("lavar") || message.includes("limpieza")) {
    return "Te recomiendo el servicio de **Limpieza** vehicular. Ofrecemos lavado completo, encerado y limpieza interior.";
  }
  
  // Saludo general
  if (message.includes("hola") || message.includes("ayuda") || message.includes("puedes ayudar")) {
    return "¡Hola! Soy tu asistente de DriveSync, experto en diagnósticos y soluciones vehiculares. ¿En qué puedo ayudarte hoy con tu vehículo?";
  }
  
  // Respuesta por defecto
  return "Como experto automotriz, necesito más detalles para ayudarte mejor. ¿Podrías describir específicamente qué problema tienes con tu vehículo?";
}

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Verificar que tenemos la API key
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("❌ OPENROUTER_API_KEY no está configurada");
      // Usar respuesta inteligente como respaldo
      const userMessage = body.messages?.[body.messages.length - 1]?.content || "";
      const smartResponse = getSmartResponse(userMessage);
      
      return NextResponse.json({
        choices: [
          {
            message: {
              content: smartResponse
            }
          }
        ]
      });
    }

    console.log("🔑 Usando OpenRouter API Key:", process.env.OPENROUTER_API_KEY?.slice(0, 15) + "...");

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "DriveSync Assistant",
      },
      body: JSON.stringify({
        model: body.model || "openai/gpt-3.5-turbo",
        messages: body.messages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: false,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Error de OpenRouter API:", res.status, errorText);
      
      // Usar respuesta inteligente como respaldo
      const userMessage = body.messages?.[body.messages.length - 1]?.content || "";
      const smartResponse = getSmartResponse(userMessage);
      
      return NextResponse.json({
        choices: [
          {
            message: {
              content: smartResponse
            }
          }
        ]
      });
    }

    const data = await res.json();
    console.log("✅ Respuesta exitosa de OpenRouter");

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error al conectar con OpenRouter:", error);
    
    // Usar respuesta inteligente como respaldo
    const userMessage = body.messages?.[body.messages.length - 1]?.content || "";
    const smartResponse = getSmartResponse(userMessage);
    
    return NextResponse.json({
      choices: [
        {
          message: {
            content: smartResponse
          }
        }
      ]
    });
  }
}