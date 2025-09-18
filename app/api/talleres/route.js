import { connectDB } from '@/lib/mongoose'
import Taller from '@/models/Taller'
import { NextResponse } from 'next/server'
import * as yup from 'yup'
import bcrypt from 'bcrypt'

// Esquema de validación para Taller
const tallerSchema = yup.object({
  nombre: yup.string().required('Nombre requerido'),
  direccion: yup.string().required('Dirección requerida'),
  telefono: yup.string().required('Teléfono requerido'),
  email: yup.string().required('Email requerido'),
  password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('Contraseña requerida'),
  ubicacion: yup.object({
    lat: yup.number().required('Latitud requerida'),
    lng: yup.number().required('Longitud requerida'),
  }).required('Ubicación requerida'),
  calificacion: yup.number().min(0).max(5).default(0), // Agregado campo calificacion
  servicios: yup.array().of(yup.string()), // Agregado campo servicios
  // Eliminado campo horario
});


// GET: Listar todos los talleres o uno por ID
export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) {
    const taller = await Taller.findById(id).populate('servicios');
    if (!taller) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(taller);
  } else {
    const talleres = await Taller.find({}).populate('servicios');
    return NextResponse.json(talleres);
  }
}

// POST: Crear un nuevo taller (acepta FormData o JSON)
export async function POST(req) {
  await connectDB();
  const data = await req.json();
  
  // Agregar la dirección a la ubicación si no está presente
  if (data.ubicacion && !data.ubicacion.direccion) {
    data.ubicacion.direccion = data.direccion;
  }
  
  try {
    await tallerSchema.validate(data, { abortEarly: false });
  } catch (validationError) {
    return NextResponse.json({ error: 'Datos inválidos', details: validationError.errors }, { status: 400 });
  }
  
  // Hashear la contraseña antes de guardar
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 12);
  }
  
  // Forzar que la calificación siempre sea 0 al registrar un taller
  data.calificacion = 0;
  
  const nuevoTaller = new Taller(data);
  await nuevoTaller.save();
  return NextResponse.json({ message: 'Solicitud registrada exitosamente, DriveSync te contactará', taller: nuevoTaller });
}

// PUT: Actualizar un taller existente
export async function PUT(req) {
  await connectDB();
  const data = await req.json();
  if (!data._id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  
  // Crear una copia de los datos sin el ID para la validación
  const { _id, ...updateData } = data;
  
  // Si no hay contraseña, no la validamos (edición sin cambio de contraseña)
  let validationSchema = tallerSchema;
  if (!updateData.password) {
    validationSchema = tallerSchema.omit(['password']);
  }
  
  try {
    await validationSchema.validate(updateData, { abortEarly: false });
  } catch (validationError) {
    return NextResponse.json({ error: 'Datos inválidos', details: validationError.errors }, { status: 400 });
  }
  
  // Hashear la contraseña solo si se proporcionó una nueva
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 12);
  }
  
  // Agregar la dirección a la ubicación si no está presente
  if (updateData.ubicacion && !updateData.ubicacion.direccion) {
    updateData.ubicacion.direccion = updateData.direccion;
  }
  
  try {
    const taller = await Taller.findByIdAndUpdate(_id, updateData, { new: true }).populate('servicios');
    if (!taller) return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 });
    return NextResponse.json({ message: 'Taller actualizado exitosamente', taller });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar taller', details: error.message }, { status: 400 });
  }
}

// DELETE: Eliminar un taller
export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  
  try {
    const deleted = await Taller.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 });
    return NextResponse.json({ message: 'Taller eliminado exitosamente' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar taller', details: error.message }, { status: 400 });
  }
}
