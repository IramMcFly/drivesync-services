// app/api/ratings/route.js
import { connectDB } from '../../../lib/mongoose';
import Rating from '../../../models/Rating';
import Taller from '../../../models/Taller';
import ServiceRequest from '../../../models/ServiceRequest';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const { tallerId, serviceRequestId, rating, comentario } = await request.json();

    // Validaciones
    if (!tallerId || !serviceRequestId || !rating) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' }, 
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'La calificación debe estar entre 1 y 5' }, 
        { status: 400 }
      );
    }

    // Verificar que el servicio existe y pertenece al usuario
    const serviceRequest = await ServiceRequest.findById(serviceRequestId);
    if (!serviceRequest) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' }, 
        { status: 404 }
      );
    }

    if (serviceRequest.cliente.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para calificar este servicio' }, 
        { status: 403 }
      );
    }

    if (serviceRequest.estado !== 'finalizado') {
      return NextResponse.json(
        { error: 'Solo puedes calificar servicios finalizados' }, 
        { status: 400 }
      );
    }

    if (serviceRequest.isRated) {
      return NextResponse.json(
        { error: 'Este servicio ya ha sido calificado' }, 
        { status: 400 }
      );
    }

    // Verificar que el taller existe
    const taller = await Taller.findById(tallerId);
    if (!taller) {
      return NextResponse.json(
        { error: 'Taller no encontrado' }, 
        { status: 404 }
      );
    }

    // Crear la calificación
    const newRating = new Rating({
      usuario: session.user.id,
      taller: tallerId,
      serviceRequest: serviceRequestId,
      rating,
      comentario: comentario || ''
    });

    await newRating.save();

    // Marcar el servicio como calificado
    await ServiceRequest.findByIdAndUpdate(serviceRequestId, { isRated: true });

    // Recalcular el rating promedio del taller
    const ratings = await Rating.find({ taller: tallerId });
    const totalRatings = ratings.length;
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    // Actualizar el taller con el nuevo promedio
    await Taller.findByIdAndUpdate(tallerId, {
      rating: Math.round(averageRating * 100) / 100, // Redondear a 2 decimales
      totalRatings: totalRatings
    });

    return NextResponse.json({
      message: 'Calificación guardada exitosamente',
      rating: newRating,
      tallerRating: {
        average: Math.round(averageRating * 100) / 100,
        total: totalRatings
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error al guardar calificación:', error);
    
    // Manejar error de duplicado (mismo usuario califica el mismo servicio)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Ya has calificado este servicio' }, 
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const tallerId = searchParams.get('tallerId');

    if (!tallerId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del taller' }, 
        { status: 400 }
      );
    }

    // Obtener todas las calificaciones del taller
    const ratings = await Rating.find({ taller: tallerId })
      .populate('usuario', 'nombre email')
      .populate('serviceRequest', 'fechaSolicitud')
      .sort({ fechaCalificacion: -1 });

    // Obtener estadísticas del taller
    const taller = await Taller.findById(tallerId, 'rating totalRatings nombre');

    return NextResponse.json({
      taller: {
        id: taller._id,
        nombre: taller.nombre,
        rating: taller.rating,
        totalRatings: taller.totalRatings
      },
      ratings: ratings
    });

  } catch (error) {
    console.error('Error al obtener calificaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}