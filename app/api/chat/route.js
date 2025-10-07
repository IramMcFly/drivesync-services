// /app/api/chat/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: body.model || "mistralai/mistral-small-3.2-24b-instruct:free",
        messages: body.messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error al conectar con Groq:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}