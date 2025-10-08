import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { emergencyId, endTime, reason = 'user_safe', notes } = body;

    if (!emergencyId) {
      return NextResponse.json(
        { error: 'EmergencyId es requerido' },
        { status: 400 }
      );
    }

    console.log(`✅ FINALIZANDO EMERGENCIA:`, {
      emergencyId,
      endTime,
      reason,
      timestamp: new Date().toISOString()
    });

    // En producción, actualizarías el registro en la base de datos
    // await Emergency.findOneAndUpdate(
    //   { emergencyId },
    //   {
    //     status: 'resolved',
    //     resolvedAt: new Date(endTime),
    //     resolution: {
    //       reason,
    //       notes,
    //       resolvedBy: 'user',
    //       timestamp: new Date().toISOString()
    //     }
    //   }
    // );

    // Notificar a autoridades sobre la resolución
    const resolutionNotification = {
      emergencyId,
      status: 'resolved',
      reason,
      endTime,
      notes,
      actions: [
        'Desactivando monitoreo',
        'Cerrando conexiones de cámara',
        'Actualizando sistemas de emergencia',
        'Generando reporte final'
      ]
    };

    console.log(`📡 NOTIFICANDO RESOLUCIÓN A AUTORIDADES:`, resolutionNotification);

    // Simular notificaciones de finalización
    const finalNotifications = await notifyEmergencyResolution(emergencyId, resolutionNotification);

    return NextResponse.json({
      success: true,
      message: 'Emergencia finalizada exitosamente',
      emergencyId,
      resolution: {
        status: 'resolved',
        endTime,
        reason,
        notes,
        finalizedAt: new Date().toISOString()
      },
      notifications: finalNotifications,
      summary: {
        duration: calculateDuration(endTime),
        authoritiesNotified: true,
        videosRecorded: 1,
        camerasUsed: 2,
        responseTime: '4 minutos'
      }
    });

  } catch (error) {
    console.error('❌ Error finalizando emergencia:', error);
    return NextResponse.json(
      { 
        error: 'Error finalizando emergencia',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Función para notificar resolución a autoridades
async function notifyEmergencyResolution(emergencyId, resolutionData) {
  const services = [
    'Centro de Emergencias 911',
    'Policía Local',
    'Sistema de Cámaras de Seguridad',
    'Operadores de Monitoreo'
  ];

  const notifications = [];

  for (const service of services) {
    try {
      // Simular notificación de resolución
      console.log(`📡 Notificando resolución a ${service}...`);
      
      notifications.push({
        service,
        status: 'notified',
        action: 'emergency_resolved',
        timestamp: new Date().toISOString(),
        confirmationId: `RES-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
      });

      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 50));

    } catch (error) {
      notifications.push({
        service,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  return notifications;
}

// Función para calcular duración de emergencia
function calculateDuration(endTime) {
  // Simular hora de inicio (en producción vendría de la base de datos)
  const startTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutos atrás
  const end = new Date(endTime);
  
  const durationMs = end - startTime;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  
  return `${minutes}m ${seconds}s`;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const emergencyId = searchParams.get('emergencyId');

    if (!emergencyId) {
      return NextResponse.json(
        { error: 'EmergencyId requerido' },
        { status: 400 }
      );
    }

    // En producción, buscarías en la base de datos
    // const emergency = await Emergency.findOne({ emergencyId });

    // Simulación de estado de emergencia
    const emergencyStatus = {
      emergencyId,
      status: 'resolved',
      resolution: {
        reason: 'user_safe',
        endTime: new Date().toISOString(),
        duration: '4m 32s',
        resolvedBy: 'user'
      },
      summary: {
        authoritiesContacted: true,
        videosRecorded: 1,
        camerasUsed: 2,
        responseGenerated: true
      }
    };

    return NextResponse.json({
      success: true,
      emergency: emergencyStatus
    });

  } catch (error) {
    console.error('❌ Error obteniendo estado de emergencia:', error);
    return NextResponse.json(
      { error: 'Error obteniendo estado' },
      { status: 500 }
    );
  }
}