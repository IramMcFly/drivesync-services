import mongoose from 'mongoose';
// PUT: Editar un servicio existente
export async function PUT(request) {
  await connectDB();
  const body = await request.json();
  try {
    const { _id, ...updateData } = body;
    const servicio = await Servicio.findByIdAndUpdate(_id, updateData, { new: true });
    if (!servicio) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
    return NextResponse.json(servicio);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar servicio', details: error.message }, { status: 400 });
  }
}

// DELETE: Eliminar un servicio existente
export async function DELETE(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  try {
    const deleted = await Servicio.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
    return NextResponse.json({ message: 'Servicio eliminado' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar servicio', details: error.message }, { status: 400 });
  }
}
import { connectDB } from '@/lib/mongoose'
import Servicio from '@/models/Servicio'
import { NextResponse } from 'next/server'

// GET: Listar todos los servicios
export async function GET() {
  await connectDB()
  const servicios = await Servicio.find({ activo: true })
  return NextResponse.json(servicios)
}

// POST: Crear un nuevo servicio
export async function POST(request) {
  await connectDB()
  const body = await request.json()
  try {
    const nuevoServicio = await Servicio.create(body)
    return NextResponse.json(nuevoServicio, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear servicio', details: error.message }, { status: 400 })
  }
}
