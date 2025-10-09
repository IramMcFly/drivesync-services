import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Taller from "@/models/Taller";
import bcrypt from "bcrypt";

const talleresMuestra = [
  {
    nombre: "Taller Central",
    direccion: "Av. Reforma 1234, Col. Centro",
    telefono: "55-1234-5678",
    email: "taller1@drivesync.com",
    password: "123456",
    ubicacion: {
      lat: 19.4326,
      lng: -99.1332,
      direccion: "Av. Reforma 1234, Col. Centro"
    },
    rating: 4.5,
    totalRatings: 125
  },
  {
    nombre: "AutoServicio Express",
    direccion: "Blvd. Manuel Ávila Camacho 456, Naucalpan",
    telefono: "55-9876-5432",
    email: "taller2@drivesync.com",
    password: "123456",
    ubicacion: {
      lat: 19.4969,
      lng: -99.2419,
      direccion: "Blvd. Manuel Ávila Camacho 456, Naucalpan"
    },
    rating: 4.2,
    totalRatings: 89
  },
  {
    nombre: "LlantaMax Pro",
    direccion: "Eje Central Lázaro Cárdenas 789, Col. Doctores",
    telefono: "55-5555-1111",
    email: "taller3@drivesync.com",
    password: "123456",
    ubicacion: {
      lat: 19.4284,
      lng: -99.1419,
      direccion: "Eje Central Lázaro Cárdenas 789, Col. Doctores"
    },
    rating: 4.7,
    totalRatings: 203
  }
];

export async function POST() {
  try {
    await connectDB();
    
    // Verificar si ya existen talleres
    const talleresExistentes = await Taller.countDocuments();
    if (talleresExistentes > 0) {
      return NextResponse.json({
        success: true,
        message: `Ya existen ${talleresExistentes} talleres en la base de datos`,
        talleres: talleresExistentes
      });
    }
    
    const talleresCreados = [];
    
    for (const tallerData of talleresMuestra) {
      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(tallerData.password, 10);
      
      const nuevoTaller = new Taller({
        ...tallerData,
        password: hashedPassword
      });
      
      await nuevoTaller.save();
      talleresCreados.push({
        id: nuevoTaller._id,
        nombre: nuevoTaller.nombre,
        email: nuevoTaller.email
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `${talleresCreados.length} talleres creados exitosamente`,
      talleres: talleresCreados
    });
    
  } catch (error) {
    console.error('Error creando talleres:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const talleres = await Taller.find({}, 'nombre email telefono direccion rating totalRatings');
    
    return NextResponse.json({
      success: true,
      talleres: talleres,
      total: talleres.length
    });
    
  } catch (error) {
    console.error('Error obteniendo talleres:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}