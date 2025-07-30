import { connectDB } from '@/lib/mongoose';
import ServiceRequest from '@/models/ServiceRequest';
import { NextResponse } from 'next/server';

// GET: Listar todas las solicitudes de servicio o una por ID
export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) {
    const solicitud = await ServiceRequest.findById(id)
      .populate('cliente')
      .populate('taller')
      .populate('servicio')
      .populate('asistente');
    if (!solicitud) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(solicitud);
  } else {
    const requests = await ServiceRequest.find({})
      .populate('cliente')
      .populate('taller')
      .populate('servicio')
      .populate('asistente');
    return NextResponse.json(requests);
  }
}

// POST: Crear una nueva solicitud de servicio
export async function POST(request) {
  await connectDB();
  const data = await request.json();
  try {
    const nuevaSolicitud = await ServiceRequest.create(data);
    return NextResponse.json({ 
      success: true, 
      serviceRequest: nuevaSolicitud 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear solicitud', details: error.message }, { status: 400 });
  }
}

// PUT: Actualizar una solicitud existente
export async function PUT(request) {
  await connectDB();
  const data = await request.json();
  if (!data._id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  try {
    const solicitud = await ServiceRequest.findByIdAndUpdate(data._id, data, { new: true });
    if (!solicitud) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(solicitud);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar solicitud', details: error.message }, { status: 400 });
  }
}

// DELETE: Eliminar una solicitud
export async function DELETE(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  try {
    await ServiceRequest.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Eliminado' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar solicitud', details: error.message }, { status: 400 });
  }
}
