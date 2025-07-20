import { NextResponse } from "next/server";
import ServiceRequest from "@/models/ServiceRequest";
import { connectDB } from "@/lib/mongoose";

// GET: Listar todas las solicitudes de servicio
export async function GET() {
  await connectDB();
  try {
    const requests = await ServiceRequest.find()
      .populate("cliente", "_id nombre email")
      .populate("taller", "_id nombre")
      .populate("servicio", "_id nombre")
      .populate("asistente", "_id nombre");
    return NextResponse.json(requests);
  } catch (e) {
    return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 });
  }
}

// DELETE: Eliminar una solicitud por id (?id=...)
export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
  try {
    await ServiceRequest.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 });
  }
}

// PUT: Editar una solicitud (body: JSON con _id y campos a modificar)
export async function PUT(req) {
  await connectDB();
  const data = await req.json();
  if (!data._id) return NextResponse.json({ error: "Falta _id" }, { status: 400 });
  try {
    const updated = await ServiceRequest.findByIdAndUpdate(data._id, data, { new: true });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
  }
}
