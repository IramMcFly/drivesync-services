import { connectDB } from '@/lib/mongoose'
import Taller from '@/models/Taller'
import { NextResponse } from 'next/server'


// GET: Listar todos los talleres
export async function GET() {
  await connectDB();
  const talleres = await Taller.find({});
  return NextResponse.json(talleres);
}

// POST: Crear un nuevo taller
export async function POST(req) {
  await connectDB();
  const data = await req.json();
  const nuevoTaller = new Taller(data);
  await nuevoTaller.save();
  return NextResponse.json(nuevoTaller);
}

// PUT: Actualizar un taller existente
export async function PUT(req) {
  await connectDB();
  const data = await req.json();
  if (!data._id) return new NextResponse('ID requerido', { status: 400 });
  const taller = await Taller.findByIdAndUpdate(data._id, data, { new: true });
  if (!taller) return new NextResponse('No encontrado', { status: 404 });
  return NextResponse.json(taller);
}

// DELETE: Eliminar un taller
export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return new NextResponse('ID requerido', { status: 400 });
  await Taller.findByIdAndDelete(id);
  return new NextResponse('Eliminado', { status: 200 });
}
