import { connectDB } from '@/lib/mongoose';
import ServiceRequest from '@/models/ServiceRequest';
import User from '@/models/User';
import Taller from '@/models/Taller';
import Servicio from '@/models/Servicio';
import Asistente from '@/models/Asistente';
import { NextResponse } from 'next/server';

// Estados válidos y sus transiciones permitidas
const VALID_STATES = ['pendiente', 'asignado', 'en_camino', 'finalizado', 'cancelado'];
const STATE_TRANSITIONS = {
  'pendiente': ['asignado', 'cancelado'],
  'asignado': ['en_camino', 'cancelado', 'pendiente'],
  'en_camino': ['finalizado', 'cancelado'],
  'finalizado': [], // Estado final
  'cancelado': []   // Estado final
};

// Validar transición de estado
function isValidStateTransition(currentState, newState) {
  if (!currentState || !newState) return false;
  if (!VALID_STATES.includes(newState)) return false;
  return STATE_TRANSITIONS[currentState]?.includes(newState) || false;
}

// GET: Listar todas las solicitudes de servicio o una por ID
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clienteId = searchParams.get('clienteId');
    const asistenteId = searchParams.get('asistenteId');
    const estado = searchParams.get('estado');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    // Construir filtros
    let filters = {};
    if (clienteId) filters.cliente = clienteId;
    if (asistenteId) filters.asistente = asistenteId;
    if (estado && VALID_STATES.includes(estado)) filters.estado = estado;

    if (id) {
      const solicitud = await ServiceRequest.findById(id)
        .populate('cliente', 'nombre email telefono')
        .populate('taller', 'nombre direccion telefono')
        .populate('servicio', 'nombre descripcion')
        .populate({
          path: 'asistente',
          populate: {
            path: 'user',
            select: 'nombre telefono email'
          }
        });
        
      if (!solicitud) {
        return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
      }
      
      return NextResponse.json(solicitud);
    } else {
      const requests = await ServiceRequest.find(filters)
        .populate('cliente', 'nombre email telefono')
        .populate('taller', 'nombre direccion telefono')
        .populate('servicio', 'nombre descripcion')
        .populate({
          path: 'asistente',
          populate: {
            path: 'user',
            select: 'nombre telefono email'
          }
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);
        
      return NextResponse.json(requests);
    }
  } catch (error) {
    console.error('Error en GET /api/servicerequests:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      details: error.message 
    }, { status: 500 });
  }
}

// POST: Crear una nueva solicitud de servicio
export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();

    // Validaciones básicas
    if (!data.cliente || !data.taller || !data.servicio) {
      return NextResponse.json({ 
        error: 'Campos requeridos: cliente, taller, servicio' 
      }, { status: 400 });
    }

    if (!data.ubicacion?.lat || !data.ubicacion?.lng) {
      return NextResponse.json({ 
        error: 'Ubicación requerida (lat, lng)' 
      }, { status: 400 });
    }

    if (!data.precio || data.precio <= 0) {
      return NextResponse.json({ 
        error: 'Precio debe ser mayor a 0' 
      }, { status: 400 });
    }

    // Verificar que las referencias existen
    const [cliente, taller, servicio] = await Promise.all([
      User.findById(data.cliente),
      Taller.findById(data.taller),
      Servicio.findById(data.servicio)
    ]);

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 400 });
    }
    if (!taller) {
      return NextResponse.json({ error: 'Taller no encontrado' }, { status: 400 });
    }
    if (!servicio) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 400 });
    }

    // Crear solicitud con historial inicial
    const nuevaSolicitud = await ServiceRequest.create({
      ...data,
      estado: 'pendiente',
      historial: [{
        estado: 'pendiente',
        fecha: new Date(),
        comentario: 'Solicitud creada'
      }]
    });

    // Popultar la respuesta
    const solicitudCompleta = await ServiceRequest.findById(nuevaSolicitud._id)
      .populate('cliente', 'nombre email telefono')
      .populate('taller', 'nombre direccion telefono')
      .populate('servicio', 'nombre descripcion');

    return NextResponse.json({ 
      success: true, 
      serviceRequest: solicitudCompleta 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error en POST /api/servicerequests:', error);
    return NextResponse.json({ 
      error: 'Error al crear solicitud', 
      details: error.message 
    }, { status: 400 });
  }
}

// PUT: Actualizar una solicitud existente
export async function PUT(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    if (!data._id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    // Obtener solicitud actual
    const solicitudActual = await ServiceRequest.findById(data._id);
    if (!solicitudActual) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
    }

    // Validar transición de estado si se está cambiando
    if (data.estado && data.estado !== solicitudActual.estado) {
      if (!isValidStateTransition(solicitudActual.estado, data.estado)) {
        return NextResponse.json({ 
          error: `Transición inválida de '${solicitudActual.estado}' a '${data.estado}'`,
          validTransitions: STATE_TRANSITIONS[solicitudActual.estado] || []
        }, { status: 400 });
      }

      // Agregar entrada al historial si hay cambio de estado
      const historialEntry = {
        estado: data.estado,
        fecha: new Date(),
        comentario: data.comentario || `Estado cambiado a ${data.estado}`
      };

      data.$push = { historial: historialEntry };
    }

    // Validar asistente si se está asignando
    if (data.asistente && data.asistente !== solicitudActual.asistente?.toString()) {
      const asistente = await Asistente.findById(data.asistente);
      if (!asistente) {
        return NextResponse.json({ error: 'Asistente no encontrado' }, { status: 400 });
      }
      
      // Verificar que el asistente pertenece al taller correcto
      if (asistente.taller.toString() !== solicitudActual.taller.toString()) {
        return NextResponse.json({ 
          error: 'El asistente no pertenece al taller de esta solicitud' 
        }, { status: 400 });
      }
    }

    // Actualizar solicitud
    const solicitudActualizada = await ServiceRequest.findByIdAndUpdate(
      data._id, 
      data, 
      { new: true, runValidators: true }
    )
    .populate('cliente', 'nombre email telefono')
    .populate('taller', 'nombre direccion telefono')
    .populate('servicio', 'nombre descripcion')
    .populate({
      path: 'asistente',
      populate: {
        path: 'user',
        select: 'nombre telefono email'
      }
    });

    return NextResponse.json(solicitudActualizada);
    
  } catch (error) {
    console.error('Error en PUT /api/servicerequests:', error);
    return NextResponse.json({ 
      error: 'Error al actualizar solicitud', 
      details: error.message 
    }, { status: 400 });
  }
}

// DELETE: Eliminar una solicitud
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const solicitud = await ServiceRequest.findById(id);
    if (!solicitud) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
    }

    // Solo permitir eliminar solicitudes en estado pendiente o cancelado
    if (!['pendiente', 'cancelado'].includes(solicitud.estado)) {
      return NextResponse.json({ 
        error: 'Solo se pueden eliminar solicitudes pendientes o canceladas' 
      }, { status: 400 });
    }

    await ServiceRequest.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Solicitud eliminada' });
    
  } catch (error) {
    console.error('Error en DELETE /api/servicerequests:', error);
    return NextResponse.json({ 
      error: 'Error al eliminar solicitud', 
      details: error.message 
    }, { status: 400 });
  }
}

// PATCH: Actualización parcial para cambios de estado específicos
export async function PATCH(request) {
  try {
    await connectDB();
    const data = await request.json();
    const { id, action, ...updateData } = data;
    
    if (!id || !action) {
      return NextResponse.json({ 
        error: 'ID y action son requeridos' 
      }, { status: 400 });
    }

    const solicitud = await ServiceRequest.findById(id);
    if (!solicitud) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
    }

    let newState;
    let comment;

    switch (action) {
      case 'assign':
        if (!updateData.asistenteId) {
          return NextResponse.json({ error: 'asistenteId requerido' }, { status: 400 });
        }
        newState = 'asignado';
        comment = `Asistente asignado: ${updateData.asistenteId}`;
        updateData.asistente = updateData.asistenteId;
        break;
        
      case 'start_journey':
        newState = 'en_camino';
        comment = 'Asistente en camino al cliente';
        break;
        
      case 'complete':
        newState = 'finalizado';
        comment = updateData.comment || 'Servicio completado';
        break;
        
      case 'cancel':
        newState = 'cancelado';
        comment = updateData.reason || 'Servicio cancelado';
        break;
        
      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }

    // Validar transición
    if (!isValidStateTransition(solicitud.estado, newState)) {
      return NextResponse.json({ 
        error: `No se puede ${action} desde el estado '${solicitud.estado}'`,
        currentState: solicitud.estado,
        validTransitions: STATE_TRANSITIONS[solicitud.estado] || []
      }, { status: 400 });
    }

    // Actualizar con historial
    const updatedData = {
      ...updateData,
      estado: newState,
      $push: {
        historial: {
          estado: newState,
          fecha: new Date(),
          comentario: comment
        }
      }
    };

    const solicitudActualizada = await ServiceRequest.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    )
    .populate('cliente', 'nombre email telefono')
    .populate('taller', 'nombre direccion telefono')
    .populate('servicio', 'nombre descripcion')
    .populate({
      path: 'asistente',
      populate: {
        path: 'user',
        select: 'nombre telefono email'
      }
    });

    return NextResponse.json({
      success: true,
      serviceRequest: solicitudActualizada,
      action: action,
      previousState: solicitud.estado,
      newState: newState
    });
    
  } catch (error) {
    console.error('Error en PATCH /api/servicerequests:', error);
    return NextResponse.json({ 
      error: 'Error al actualizar estado', 
      details: error.message 
    }, { status: 400 });
  }
}
