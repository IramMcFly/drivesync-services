import { connectDB } from '@/lib/mongoose';
import Asistente from '@/models/Asistente';
import { NextResponse } from 'next/server';

// GET: Obtener solo la ubicación actual de un asistente
export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const asistenteId = searchParams.get('asistenteId');
  const userId = searchParams.get('userId');

  if (!asistenteId && !userId) {
    return NextResponse.json({ 
      error: 'asistenteId o userId requerido' 
    }, { status: 400 });
  }

  try {
    let asistente;
    
    if (asistenteId) {
      // Buscar por ID del asistente
      asistente = await Asistente.findById(asistenteId);
    } else {
      // Buscar por ID del usuario
      asistente = await Asistente.findOne({ user: userId });
    }

    if (!asistente) {
      return NextResponse.json({ 
        error: 'Asistente no encontrado' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      asistente: {
        id: asistente._id,
        ubicacionActual: asistente.ubicacionActual,
        activo: asistente.activo,
        ultimaActualizacion: asistente.updatedAt
      }
    });

  } catch (error) {
    console.error('Error al obtener ubicación del asistente:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error.message 
    }, { status: 500 });
  }
}
