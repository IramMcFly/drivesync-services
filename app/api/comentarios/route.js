import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import Taller from '@/models/Taller';
import Comentario from '@/models/Comentario';

// GET - Obtener comentarios de un taller
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const tallerId = searchParams.get('tallerId');

    if (!tallerId) {
      return NextResponse.json(
        { error: 'ID del taller requerido' },
        { status: 400 }
      );
    }

    const comentarios = await Comentario.find({ taller: tallerId })
      .populate('usuario', 'nombre email')
      .populate('taller', 'nombre')
      .sort({ fecha: -1 })
      .lean();

    return NextResponse.json(comentarios);
  } catch (error) {
    console.error('Error fetching comentarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo comentario
export async function POST(request) {
  try {
    await connectDB();

    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { tallerId, comentario, calificacion } = await request.json();

    // Validaciones
    if (!tallerId || !comentario || !calificacion) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (calificacion < 1 || calificacion > 5) {
      return NextResponse.json(
        { error: 'La calificación debe estar entre 1 y 5' },
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

    // Buscar el usuario por email (ya que session.user.email es lo disponible)
    const usuario = await User.findOne({ email: session.user.email });
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Crear el comentario
    const nuevoComentario = new Comentario({
      taller: tallerId,
      usuario: usuario._id,
      comentario: comentario.trim(),
      calificacion
    });

    await nuevoComentario.save();

    // Poblar y devolver el comentario creado
    const comentarioCreado = await Comentario.findById(nuevoComentario._id)
      .populate('usuario', 'nombre email')
      .populate('taller', 'nombre')
      .lean();

    return NextResponse.json(comentarioCreado, { status: 201 });
  } catch (error) {
    console.error('Error creating comentario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar comentario (opcional)
export async function PUT(request) {
  try {
    await connectDB();

    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { comentarioId, comentario, calificacion } = await request.json();

    if (!comentarioId) {
      return NextResponse.json(
        { error: 'ID del comentario requerido' },
        { status: 400 }
      );
    }

    // Buscar el usuario
    const usuario = await User.findOne({ email: session.user.email });
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Buscar el comentario y verificar que pertenece al usuario
    const comentarioExistente = await Comentario.findById(comentarioId);
    if (!comentarioExistente) {
      return NextResponse.json(
        { error: 'Comentario no encontrado' },
        { status: 404 }
      );
    }

    if (comentarioExistente.usuario.toString() !== usuario._id.toString()) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar este comentario' },
        { status: 403 }
      );
    }

    // Actualizar el comentario
    const updateData = {};
    if (comentario) updateData.comentario = comentario.trim();
    if (calificacion) updateData.calificacion = calificacion;

    const comentarioActualizado = await Comentario.findByIdAndUpdate(
      comentarioId,
      updateData,
      { new: true }
    ).populate('usuario', 'nombre email').populate('taller', 'nombre').lean();

    return NextResponse.json(comentarioActualizado);
  } catch (error) {
    console.error('Error updating comentario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar comentario (opcional)
export async function DELETE(request) {
  try {
    await connectDB();

    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const comentarioId = searchParams.get('comentarioId');

    if (!comentarioId) {
      return NextResponse.json(
        { error: 'ID del comentario requerido' },
        { status: 400 }
      );
    }

    // Buscar el usuario
    const usuario = await User.findOne({ email: session.user.email });
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Buscar el comentario y verificar que pertenece al usuario
    const comentario = await Comentario.findById(comentarioId);
    if (!comentario) {
      return NextResponse.json(
        { error: 'Comentario no encontrado' },
        { status: 404 }
      );
    }

    if (comentario.usuario.toString() !== usuario._id.toString()) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar este comentario' },
        { status: 403 }
      );
    }

    await Comentario.findByIdAndDelete(comentarioId);

    return NextResponse.json({ message: 'Comentario eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting comentario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
