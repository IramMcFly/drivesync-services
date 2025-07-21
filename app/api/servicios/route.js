
import { connectDB } from '@/lib/mongoose';
import Servicio from '@/models/Servicio';
import { NextResponse } from 'next/server';

// PUT: Editar un servicio existente
export async function PUT(request) {
  await connectDB();
  const contentType = request.headers.get('content-type') || '';
  let updateData = {};
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    updateData._id = formData.get('_id');
    updateData.nombre = formData.get('nombre');
    updateData.descripcion = formData.get('descripcion');
    updateData.precioMin = Number(formData.get('precioMin'));
    updateData.precioMax = Number(formData.get('precioMax'));
    const subtipos = formData.get('subtipos');
    if (subtipos) {
      try {
        updateData.subtipos = JSON.parse(subtipos);
      } catch {
        updateData.subtipos = [];
      }
    }
    const imagen = formData.get('imagen');
    if (imagen && typeof imagen.arrayBuffer === 'function') {
      const arrayBuffer = await imagen.arrayBuffer();
      updateData.imagen = Buffer.from(arrayBuffer);
    }
  } else {
    updateData = await request.json();
    // Si la imagen viene como objeto { data, type, name }
    if (updateData.imagen && updateData.imagen.data) {
      updateData.imagen = Buffer.from(updateData.imagen.data);
    }
  }
  try {
    const { _id, ...rest } = updateData;
    const servicio = await Servicio.findByIdAndUpdate(_id, rest, { new: true });
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

// GET: Listar todos los servicios o uno por ID
export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) {
    const servicio = await Servicio.findById(id);
    if (!servicio) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(servicio);
  } else {
    const servicios = await Servicio.find({});
    return NextResponse.json(servicios);
  }
}

// POST: Crear un nuevo servicio
export async function POST(request) {
  await connectDB();
  const contentType = request.headers.get('content-type') || '';
  let data = {};
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    data.nombre = formData.get('nombre');
    data.descripcion = formData.get('descripcion');
    data.precioMin = Number(formData.get('precioMin'));
    data.precioMax = Number(formData.get('precioMax'));
    // Subtipos como JSON string
    const subtipos = formData.get('subtipos');
    if (subtipos) {
      try {
        data.subtipos = JSON.parse(subtipos);
      } catch {
        data.subtipos = [];
      }
    }
    const imagen = formData.get('imagen');
    if (imagen && typeof imagen.arrayBuffer === 'function') {
      const arrayBuffer = await imagen.arrayBuffer();
      data.imagen = Buffer.from(arrayBuffer);
    }
  } else {
    data = await request.json();
    // Si la imagen viene como objeto { data, type, name }
    if (data.imagen && data.imagen.data) {
      data.imagen = Buffer.from(data.imagen.data);
    }
  }
  try {
    const nuevoServicio = await Servicio.create(data);
    return NextResponse.json(nuevoServicio, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear servicio', details: error.message }, { status: 400 });
  }
}
