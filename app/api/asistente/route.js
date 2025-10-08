import { connectDB } from '@/lib/mongoose';
import ServiceRequest from '@/models/ServiceRequest';
import Asistente from '@/models/Asistente';
import User from '@/models/User';
import Taller from '@/models/Taller';
import Servicio from '@/models/Servicio';
import { NextResponse } from 'next/server';

// GET: Obtener servicios disponibles para un asistente
export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId'); // ID del usuario asistente
  const action = searchParams.get('action'); // 'available' o 'assigned'

  if (!userId) {
    return NextResponse.json({ error: 'UserId requerido' }, { status: 400 });
  }

  try {
    // Buscar el asistente por userId
    const asistente = await Asistente.findOne({ user: userId }).populate('taller');
    if (!asistente) {
      return NextResponse.json({ error: 'Asistente no encontrado' }, { status: 404 });
    }

    let query = {};
    
    if (action === 'available') {
      // Servicios pendientes del taller del asistente
      query = {
        taller: asistente.taller._id,
        estado: 'pendiente',
        asistente: { $exists: false } // Sin asistente asignado
      };
    } else if (action === 'assigned') {
      // Servicios asignados a este asistente específico
      query = {
        asistente: asistente._id,
        estado: { $in: ['asignado', 'en_camino'] }
      };
    } else {
      // Por defecto, ambos tipos
      query = {
        $or: [
          {
            taller: asistente.taller._id,
            estado: 'pendiente',
            asistente: { $exists: false }
          },
          {
            asistente: asistente._id,
            estado: { $in: ['asignado', 'en_camino'] }
          }
        ]
      };
    }

    const servicios = await ServiceRequest.find(query)
      .populate({
        path: 'cliente',
        select: 'nombre telefono email',
        match: { _id: { $exists: true } }
      })
      .populate({
        path: 'taller',
        select: 'nombre direccion',
        match: { _id: { $exists: true } }
      })
      .populate({
        path: 'servicio',
        select: 'nombre descripcion',
        match: { _id: { $exists: true } }
      })
      .populate({
        path: 'vehiculo',
        select: 'marca modelo año color placa tipoVehiculo notas kilometraje esPrincipal',
        match: { _id: { $exists: true } }
      })
      .populate({
        path: 'asistente',
        select: 'placa vehiculo',
        match: { _id: { $exists: true } }
      })
      .sort({ fechaSolicitud: -1 });

    // Filtrar servicios que no tienen servicio válido
    const serviciosValidos = servicios.filter(s => s.servicio != null);
    
    // Log para debugging
    console.log('🔍 API Debug:', {
      totalServicios: servicios.length,
      serviciosValidos: serviciosValidos.length,
      serviciosConProblemas: servicios.filter(s => !s.servicio || !s.cliente).length
    });

    return NextResponse.json({
      success: true,
      asistente: {
        id: asistente._id,
        activo: asistente.activo,
        taller: asistente.taller.nombre,
        vehiculo: asistente.vehiculo,
        placa: asistente.placa,
        ubicacionActual: asistente.ubicacionActual // ✅ Agregar ubicación actual
      },
      servicios: serviciosValidos
    });

  } catch (error) {
    console.error('Error al obtener servicios:', error);
    return NextResponse.json({ 
      error: 'Error al obtener servicios', 
      details: error.message 
    }, { status: 500 });
  }
}

// POST: Aceptar un servicio (asignarse a un servicio pendiente)
export async function POST(request) {
  await connectDB();
  const { userId, serviceId } = await request.json();

  if (!userId || !serviceId) {
    return NextResponse.json({ 
      error: 'UserId y ServiceId requeridos' 
    }, { status: 400 });
  }

  try {
    // Buscar el asistente
    const asistente = await Asistente.findOne({ user: userId });
    if (!asistente) {
      return NextResponse.json({ error: 'Asistente no encontrado' }, { status: 404 });
    }

    // Verificar que el asistente esté activo
    if (!asistente.activo) {
      return NextResponse.json({ 
        error: 'Debes estar activo para aceptar servicios' 
      }, { status: 400 });
    }

    // Buscar el servicio y verificar que esté disponible
    const servicio = await ServiceRequest.findOne({
      _id: serviceId,
      estado: 'pendiente',
      taller: asistente.taller,
      asistente: { $exists: false }
    });

    if (!servicio) {
      return NextResponse.json({ 
        error: 'Servicio no disponible o ya asignado' 
      }, { status: 400 });
    }

    // Asignar el servicio al asistente
    const servicioActualizado = await ServiceRequest.findByIdAndUpdate(
      serviceId,
      {
        asistente: asistente._id,
        estado: 'asignado',
        $push: {
          historial: {
            estado: 'asignado',
            comentario: `Asignado al asistente ${asistente.placa}`,
            fecha: new Date()
          }
        }
      },
      { new: true }
    ).populate('cliente', 'nombre telefono email')
     .populate('taller', 'nombre direccion')
     .populate('servicio', 'nombre descripcion');

    return NextResponse.json({
      success: true,
      message: 'Servicio aceptado exitosamente',
      servicio: servicioActualizado
    });

  } catch (error) {
    console.error('Error al aceptar servicio:', error);
    return NextResponse.json({ 
      error: 'Error al aceptar servicio', 
      details: error.message 
    }, { status: 500 });
  }
}

// PUT: Actualizar estado del asistente (activo/inactivo) o estado del servicio
export async function PUT(request) {
  await connectDB();
  const data = await request.json();
  const { userId, action, serviceId, nuevoEstado, ubicacion } = data;

  if (!userId) {
    return NextResponse.json({ error: 'UserId requerido' }, { status: 400 });
  }

  try {
    const asistente = await Asistente.findOne({ user: userId });
    if (!asistente) {
      return NextResponse.json({ error: 'Asistente no encontrado' }, { status: 404 });
    }

    if (action === 'toggle_active') {
      // Cambiar estado activo/inactivo del asistente
      const nuevoEstadoActivo = !asistente.activo;
      await Asistente.findByIdAndUpdate(asistente._id, { 
        activo: nuevoEstadoActivo,
        ...(ubicacion && { ubicacionActual: ubicacion })
      });

      return NextResponse.json({
        success: true,
        message: `Asistente ${nuevoEstadoActivo ? 'activado' : 'desactivado'}`,
        activo: nuevoEstadoActivo
      });

    } else if (action === 'update_service') {
      // Actualizar estado de un servicio
      if (!serviceId || !nuevoEstado) {
        return NextResponse.json({ 
          error: 'ServiceId y nuevoEstado requeridos' 
        }, { status: 400 });
      }

      const servicioActualizado = await ServiceRequest.findOneAndUpdate(
        { 
          _id: serviceId, 
          asistente: asistente._id 
        },
        {
          estado: nuevoEstado,
          $push: {
            historial: {
              estado: nuevoEstado,
              comentario: `Estado cambiado a ${nuevoEstado}`,
              fecha: new Date()
            }
          }
        },
        { new: true }
      );

      if (!servicioActualizado) {
        return NextResponse.json({ 
          error: 'Servicio no encontrado o no asignado a este asistente' 
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `Servicio actualizado a ${nuevoEstado}`,
        servicio: servicioActualizado
      });

    } else if (action === 'update_service_state') {
      // Actualizar estado de un servicio (misma funcionalidad que update_service pero con nombre diferente)
      if (!serviceId || !nuevoEstado) {
        return NextResponse.json({ 
          error: 'ServiceId y nuevoEstado requeridos' 
        }, { status: 400 });
      }

      const servicioActualizado = await ServiceRequest.findOneAndUpdate(
        { 
          _id: serviceId, 
          asistente: asistente._id 
        },
        {
          estado: nuevoEstado,
          $push: {
            historial: {
              estado: nuevoEstado,
              comentario: `Estado cambiado a ${nuevoEstado}`,
              fecha: new Date()
            }
          }
        },
        { new: true }
      ).populate('cliente', 'nombre telefono email')
       .populate('taller', 'nombre direccion')
       .populate('servicio', 'nombre descripcion')
       .populate('asistente', 'placa vehiculo');

      if (!servicioActualizado) {
        return NextResponse.json({ 
          error: 'Servicio no encontrado o no asignado a este asistente' 
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `Servicio actualizado a ${nuevoEstado}`,
        servicio: servicioActualizado
      });

    } else if (action === 'update_location') {
      // Actualizar ubicación del asistente
      if (!ubicacion) {
        return NextResponse.json({ error: 'Ubicación requerida' }, { status: 400 });
      }

      await Asistente.findByIdAndUpdate(asistente._id, { 
        ubicacionActual: ubicacion 
      });

      return NextResponse.json({
        success: true,
        message: 'Ubicación actualizada'
      });

    } else if (action === 'release_service') {
      // Liberar servicio y devolverlo a pendiente
      if (!serviceId) {
        return NextResponse.json({ 
          error: 'ServiceId requerido' 
        }, { status: 400 });
      }

      const servicioActualizado = await ServiceRequest.findOneAndUpdate(
        { 
          _id: serviceId, 
          asistente: asistente._id 
        },
        {
          estado: 'pendiente',
          $unset: { asistente: 1 }, // Remover asistente asignado
          $push: {
            historial: {
              estado: 'pendiente',
              comentario: `Servicio liberado por asistente ${asistente.placa}`,
              fecha: new Date()
            }
          }
        },
        { new: true }
      );

      if (!servicioActualizado) {
        return NextResponse.json({ 
          error: 'Servicio no encontrado o no asignado a este asistente' 
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Servicio devuelto a la lista de pendientes',
        servicio: servicioActualizado
      });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });

  } catch (error) {
    console.error('Error al actualizar:', error);
    return NextResponse.json({ 
      error: 'Error al actualizar', 
      details: error.message 
    }, { status: 500 });
  }
}
