import { connectDB } from '@/lib/mongoose';
import Asistente from '@/models/Asistente';
import { NextResponse } from 'next/server';
import * as yup from 'yup';

// Esquema de validación para Asistente
const asistenteSchema = yup.object({
  user: yup.string().required('Usuario requerido'),
  taller: yup.string().required('Taller requerido'),
  // Agrega aquí otros campos requeridos según tu modelo
});

// GET: Listar todos los asistentes o uno por ID
export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) {
    const asistente = await Asistente.findById(id).populate('user').populate('taller');
    if (!asistente) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(asistente);
  } else {
    const asistentes = await Asistente.find({}).populate('user').populate('taller');
    return NextResponse.json(asistentes);
  }
}

// POST: Crear un nuevo asistente
export async function POST(request) {
  await connectDB();
  const data = await request.json();
  try {
    await asistenteSchema.validate(data, { abortEarly: false });
  } catch (validationError) {
    return NextResponse.json({ error: 'Datos inválidos', details: validationError.errors }, { status: 400 });
  }
  try {
    const nuevoAsistente = await Asistente.create(data);
    return NextResponse.json(nuevoAsistente, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear asistente', details: error.message }, { status: 400 });
  }
}

// PUT: Actualizar un asistente existente
export async function PUT(request) {
  await connectDB();
  const data = await request.json();
  if (!data._id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  try {
    await asistenteSchema.validate(data, { abortEarly: false });
  } catch (validationError) {
    return NextResponse.json({ error: 'Datos inválidos', details: validationError.errors }, { status: 400 });
  }
  try {
    const asistente = await Asistente.findByIdAndUpdate(data._id, data, { new: true });
    if (!asistente) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(asistente);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar asistente', details: error.message }, { status: 400 });
  }
}

// DELETE: Eliminar un asistente
export async function DELETE(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  try {
    await Asistente.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Eliminado' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar asistente', details: error.message }, { status: 400 });
  }
}
