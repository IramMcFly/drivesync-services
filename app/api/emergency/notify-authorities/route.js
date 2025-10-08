import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { emergencyId, location, userId } = body;

    if (!emergencyId || !location || !userId) {
      return NextResponse.json(
        { error: 'EmergencyId, ubicación y userId son requeridos' },
        { status: 400 }
      );
    }

    console.log(`🚔 NOTIFICANDO A AUTORIDADES:`, {
      emergencyId,
      userId,
      location: `${location.lat}, ${location.lng}`,
      timestamp: new Date().toISOString()
    });

    // Simular APIs de servicios de emergencia
    const emergencyServices = [
      {
        name: 'Centro de Emergencias 911',
        endpoint: 'https://api.emergency.gov/alerts',
        priority: 'critical'
      },
      {
        name: 'Policía Local',
        endpoint: 'https://api.police.local/emergency',
        priority: 'high'
      },
      {
        name: 'Sistema de Cámaras de Seguridad',
        endpoint: 'https://api.security-cams.gov/connect',
        priority: 'medium'
      }
    ];

    const notifications = [];

    // Simular notificaciones a diferentes servicios
    for (const service of emergencyServices) {
      try {
        // En producción, aquí harías llamadas reales a las APIs
        const notificationData = {
          emergencyId,
          type: 'super_emergency',
          priority: service.priority,
          location: {
            latitude: location.lat,
            longitude: location.lng,
            accuracy: location.accuracy || 0
          },
          userId,
          timestamp: new Date().toISOString(),
          contact: {
            method: 'api',
            service: service.name
          }
        };

        console.log(`📡 Notificando a ${service.name}...`);
        
        // Simular respuesta exitosa
        notifications.push({
          service: service.name,
          status: 'sent',
          timestamp: new Date().toISOString(),
          confirmationId: `CONF-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
        });

        // Esperar un poco para simular tiempo de procesamiento
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error notificando a ${service.name}:`, error);
        notifications.push({
          service: service.name,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Buscar cámaras de seguridad cercanas
    const nearByCameras = await findNearByCameras(location);

    console.log(`📹 Cámaras encontradas cerca:`, nearByCameras.length);

    return NextResponse.json({
      success: true,
      message: 'Autoridades notificadas exitosamente',
      notifications,
      camerasFound: nearByCameras.length,
      cameras: nearByCameras,
      estimatedResponse: {
        police: '5-8 minutos',
        emergency: '3-5 minutos',
        monitoring: 'Inmediato'
      },
      monitoringActive: true
    });

  } catch (error) {
    console.error('❌ Error notificando autoridades:', error);
    return NextResponse.json(
      { 
        error: 'Error notificando autoridades',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Función para encontrar cámaras cercanas
async function findNearByCameras(location) {
  // Simular base de datos de cámaras de seguridad
  const mockCameras = [
    {
      id: 'CAM-001',
      name: 'Cámara Av. Constitución Norte',
      location: { lat: 25.6866, lng: -100.3161 },
      type: 'traffic',
      status: 'active',
      canStream: true,
      authority: 'Tránsito Municipal'
    },
    {
      id: 'CAM-002', 
      name: 'Cámara Seguridad Plaza Mayor',
      location: { lat: 25.6869, lng: -100.3158 },
      type: 'security',
      status: 'active',
      canStream: true,
      authority: 'Seguridad Pública'
    },
    {
      id: 'CAM-003',
      name: 'Cámara Estación Metro',
      location: { lat: 25.6863, lng: -100.3165 },
      type: 'transport',
      status: 'active',
      canStream: true,
      authority: 'Transporte Público'
    }
  ];

  // Calcular distancia y filtrar cámaras cercanas (dentro de 500m)
  const nearByCameras = mockCameras
    .map(camera => ({
      ...camera,
      distance: calculateDistance(
        location.lat, location.lng,
        camera.location.lat, camera.location.lng
      )
    }))
    .filter(camera => camera.distance <= 0.5) // 500 metros
    .sort((a, b) => a.distance - b.distance);

  return nearByCameras;
}

// Función para calcular distancia entre dos puntos (Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}