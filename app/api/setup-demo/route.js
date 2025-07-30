import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import Asistente from '@/models/Asistente';
import Taller from '@/models/Taller';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

// POST: Crear datos de prueba para asistentes
export async function POST() {
  await connectDB();

  try {
    // Verificar si ya existe un usuario asistente de prueba
    const existingUser = await User.findOne({ email: 'asistente@test.com' });
    if (existingUser) {
      return NextResponse.json({ 
        message: 'Usuario asistente de prueba ya existe',
        user: existingUser,
        loginCredentials: {
          email: 'asistente@test.com',
          password: '123456'
        }
      });
    }

    // Buscar un taller existente o crear uno de prueba
    let taller = await Taller.findOne();
    if (!taller) {
      taller = await Taller.create({
        nombre: 'Taller DriveSync Demo',
        email: 'taller@test.com',
        password: await bcrypt.hash('123456', 12),
        telefono: '6141234567',
        direccion: 'Av. Principal 123, Ciudad',
        horarioAtencion: {
          apertura: '08:00',
          cierre: '18:00'
        },
        servicios: [] // Se puede llenar con servicios existentes
      });
    }

    // Crear usuario asistente de prueba
    const hashedPassword = await bcrypt.hash('123456', 12);
    const nuevoUsuario = await User.create({
      email: 'asistente@test.com',
      password: hashedPassword,
      nombre: 'Juan Pérez',
      telefono: '6141234567',
      role: 'asistente'
    });

    // Crear perfil de asistente
    const nuevoAsistente = await Asistente.create({
      user: nuevoUsuario._id,
      taller: taller._id,
      activo: false,
      ubicacionActual: {
        lat: 28.6353, // Coordenadas de ejemplo (Chihuahua)
        lng: -106.0889
      },
      placa: 'ABC-123',
      vehiculo: {
        marca: 'Toyota',
        modelo: 'Corolla',
        año: 2020,
        color: 'Blanco'
      },
      licencia: 'CH123456789'
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario asistente de prueba creado exitosamente',
      user: {
        id: nuevoUsuario._id,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre,
        role: nuevoUsuario.role
      },
      asistente: {
        id: nuevoAsistente._id,
        taller: taller.nombre,
        placa: nuevoAsistente.placa,
        vehiculo: nuevoAsistente.vehiculo
      },
      loginCredentials: {
        email: 'asistente@test.com',
        password: '123456'
      }
    });

  } catch (error) {
    console.error('Error creando usuario asistente:', error);
    return NextResponse.json({ 
      error: 'Error al crear usuario asistente', 
      details: error.message 
    }, { status: 500 });
  }
}

// GET: Obtener información de usuarios de prueba
export async function GET() {
  await connectDB();

  try {
    const asistenteUser = await User.findOne({ email: 'asistente@test.com' });
    const tallerUser = await Taller.findOne({ email: 'taller@test.com' });

    return NextResponse.json({
      testUsers: {
        asistente: asistenteUser ? {
          email: 'asistente@test.com',
          password: '123456',
          role: 'asistente'
        } : null,
        taller: tallerUser ? {
          email: 'taller@test.com',
          password: '123456',
          role: 'taller'
        } : null
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Error obteniendo información', 
      details: error.message 
    }, { status: 500 });
  }
}
