import { connectDB } from '@/lib/mongoose'
import Taller from '@/models/Taller'
import { NextResponse } from 'next/server'
import * as yup from 'yup'

// Esquema de validación para Taller
const tallerSchema = yup.object({
  nombre: yup.string().required('Nombre requerido'),
  direccion: yup.string().required('Dirección requerida'),
  // Agrega aquí otros campos requeridos según tu modelo
});


// GET: Listar todos los talleres o uno por ID
export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) {
    const taller = await Taller.findById(id);
    if (!taller) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(taller);
  } else {
    const talleres = await Taller.find({});
    return NextResponse.json(talleres);
  }
}

// POST: Crear un nuevo taller
export async function POST(req) {
  await connectDB();
  const data = await req.json();
  try {
    await tallerSchema.validate(data, { abortEarly: false });
  } catch (validationError) {
    return NextResponse.json({ error: 'Datos inválidos', details: validationError.errors }, { status: 400 });
  }
  const nuevoTaller = new Taller(data);
  await nuevoTaller.save();
  return NextResponse.json(nuevoTaller);
}

// PUT: Actualizar un taller existente
export async function PUT(req) {
  await connectDB();
  const data = await req.json();
  if (!data._id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  try {
    await tallerSchema.validate(data, { abortEarly: false });
  } catch (validationError) {
    return NextResponse.json({ error: 'Datos inválidos', details: validationError.errors }, { status: 400 });
  }
  const taller = await Taller.findByIdAndUpdate(data._id, data, { new: true });
  if (!taller) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(taller);
}

// DELETE: Eliminar un taller
export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  await Taller.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Eliminado' }, { status: 200 });
}
