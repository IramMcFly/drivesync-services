import { connectDB } from '@/lib/mongoose'
import Taller from '@/models/Taller'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt';


// GET: Listar todos los talleres
export async function GET() {
  await connectDB();
  const talleres = await Taller.find({});
  return NextResponse.json(talleres);
}

// POST: Crear un nuevo taller (acepta FormData o JSON)
export async function POST(req) {
  await connectDB();
  const contentType = req.headers.get('content-type') || '';
  let data = {};
  let logoBuffer;

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    data.nombre = formData.get('nombre');
    data.direccion = formData.get('direccion');
    data.telefono = formData.get('telefono');
    data.email = formData.get('email');
    data.password = formData.get('password');
    // Ubicación
    const ubicacionStr = formData.get('ubicacion');
    if (ubicacionStr) {
      try {
        data.ubicacion = JSON.parse(ubicacionStr);
      } catch (e) {
        data.ubicacion = undefined;
      }
    }
    const logo = formData.get('logo');
    if (logo && typeof logo.arrayBuffer === 'function') {
      const arrayBuffer = await logo.arrayBuffer();
      logoBuffer = Buffer.from(arrayBuffer);
      data.logo = logoBuffer;
    }
  } else {
    data = await req.json();
  }

  // Hash de contraseña si se envía
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  const nuevoTaller = new Taller(data);
  await nuevoTaller.save();
  return NextResponse.json({ message: 'Taller registrado exitosamente', taller: nuevoTaller });
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
