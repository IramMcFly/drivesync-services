import { connectDB } from '@/lib/mongoose';
import Asistente from '@/models/Asistente';
import { NextResponse } from 'next/server';
import * as yup from 'yup';

// Esquema de validación para Asistente
const asistenteSchema = yup.object({
  user: yup.string().required('Usuario requerido'),
  taller: yup.string().required('Taller requerido'),
  activo: yup.boolean().default(true),
  placa: yup.string().required('Placa requerida'),
  vehiculo: yup.object({
    marca: yup.string().nullable().transform((value) => value === '' ? null : value),
    modelo: yup.string().nullable().transform((value) => value === '' ? null : value),
    año: yup.number().nullable().transform((value) => value === '' ? null : value).min(1990).max(new Date().getFullYear() + 1),
    color: yup.string().nullable().transform((value) => value === '' ? null : value)
  }).nullable(),
  licencia: yup.string().nullable().transform((value) => value === '' ? null : value),
  ubicacionActual: yup.object({
    lat: yup.number().nullable(),
    lng: yup.number().nullable()
  }).nullable()
});

// GET: Listar todos los asistentes o uno por ID
export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const userId = searchParams.get('userId');
  
  if (id) {
    const asistente = await Asistente.findById(id).populate('user').populate('taller');
    if (!asistente) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(asistente);
  } else if (userId) {
    const asistentes = await Asistente.find({ user: userId }).populate('user').populate('taller');
    return NextResponse.json(asistentes);
  } else {
    const asistentes = await Asistente.find({}).populate('user').populate('taller');
    return NextResponse.json(asistentes);
  }
}

// POST: Crear un nuevo asistente
export async function POST(request) {
  await connectDB();
  
  try {
    const data = await request.json();
    console.log('Datos recibidos para crear asistente:', data); // Para debug
    
    // Validar los datos
    try {
      await asistenteSchema.validate(data, { abortEarly: false });
    } catch (validationError) {
      console.error('Error de validación:', validationError.errors);
      return NextResponse.json({ 
        error: 'Datos inválidos', 
        details: validationError.errors 
      }, { status: 400 });
    }
    
    // Crear el asistente
    const nuevoAsistente = await Asistente.create(data);
    console.log('Asistente creado exitosamente:', nuevoAsistente._id);
    console.log('Datos completos del asistente guardado:', nuevoAsistente);
    
    return NextResponse.json(nuevoAsistente, { status: 201 });
  } catch (error) {
    console.error('Error al crear asistente:', error);
    return NextResponse.json({ 
      error: 'Error al crear asistente', 
      details: error.message 
    }, { status: 400 });
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
