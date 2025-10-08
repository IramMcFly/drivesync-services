import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { v4 as uuidv4 } from 'uuid';

// Modelo para almacenar emergencias
const emergencySchema = {
  emergencyId: String,
  userId: String,
  type: String, // 'super_emergency', 'standard_emergency'
  status: String, // 'active', 'resolved', 'cancelled'
  location: {
    lat: Number,
    lng: Number,
    accuracy: Number,
    timestamp: String
  },
  deviceInfo: Object,
  createdAt: Date,
  resolvedAt: Date,
  authoritiesNotified: Boolean,
  camerasConnected: Array,
  recordings: Array,
  metadata: Object
};

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { userId, location, type = 'super_emergency', deviceInfo } = body;

    if (!userId || !location) {
      return NextResponse.json(
        { error: 'UserId y ubicación son requeridos' },
        { status: 400 }
      );
    }

    // Generar ID único para la emergencia
    const emergencyId = `EMG-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Crear registro de emergencia
    const emergencyData = {
      emergencyId,
      userId,
      type,
      status: 'active',
      location: {
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy || 0,
        timestamp: location.timestamp || new Date().toISOString()
      },
      deviceInfo: deviceInfo || {},
      createdAt: new Date(),
      authoritiesNotified: false,
      camerasConnected: [],
      recordings: [],
      metadata: {
        activationMethod: 'manual',
        priority: 'critical',
        responseRequired: true
      }
    };

    console.log(`🚨 SUPER EMERGENCIA CREADA:`, {
      emergencyId,
      userId,
      location: `${location.lat}, ${location.lng}`,
      timestamp: new Date().toISOString()
    });

    // Aquí guardarías en la base de datos
    // await Emergency.create(emergencyData);

    // Por ahora, simular guardado exitoso
    // En producción, aquí iría la lógica de base de datos

    return NextResponse.json({
      success: true,
      emergencyId,
      message: 'Emergencia creada exitosamente',
      status: 'active',
      location: emergencyData.location,
      nextSteps: [
        'Notificando a autoridades locales',
        'Conectando con cámaras de seguridad cercanas',
        'Iniciando protocolo de monitoreo'
      ]
    });

  } catch (error) {
    console.error('❌ Error creando emergencia:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const emergencyId = searchParams.get('emergencyId');
    const userId = searchParams.get('userId');

    if (!emergencyId && !userId) {
      return NextResponse.json(
        { error: 'EmergencyId o UserId requerido' },
        { status: 400 }
      );
    }

    // Aquí buscarías en la base de datos
    // const emergency = await Emergency.findOne({ 
    //   $or: [{ emergencyId }, { userId }]
    // });

    // Simulación de datos
    const emergencyData = {
      emergencyId: emergencyId || 'EMG-SAMPLE',
      userId,
      status: 'active',
      location: { lat: 25.6866, lng: -100.3161 },
      createdAt: new Date(),
      authoritiesNotified: true,
      camerasConnected: ['CAM-001', 'CAM-002'],
      recordings: []
    };

    return NextResponse.json({
      success: true,
      emergency: emergencyData
    });

  } catch (error) {
    console.error('❌ Error obteniendo emergencia:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}