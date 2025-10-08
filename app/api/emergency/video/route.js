import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const videoFile = formData.get('video');
    const emergencyId = formData.get('emergencyId');
    const userId = formData.get('userId');
    const timestamp = formData.get('timestamp');

    if (!videoFile || !emergencyId || !userId) {
      return NextResponse.json(
        { error: 'Video, emergencyId y userId son requeridos' },
        { status: 400 }
      );
    }

    console.log(`📹 RECIBIENDO VIDEO DE EMERGENCIA:`, {
      emergencyId,
      userId,
      fileName: videoFile.name,
      size: `${(videoFile.size / 1024 / 1024).toFixed(2)} MB`,
      timestamp
    });

    // Crear directorio para videos de emergencia si no existe
    const emergencyDir = path.join(process.cwd(), 'public', 'emergency-videos');
    try {
      await mkdir(emergencyDir, { recursive: true });
    } catch (error) {
      // El directorio ya existe
    }

    // Generar nombre único para el archivo
    const fileName = `${emergencyId}-${Date.now()}.webm`;
    const filePath = path.join(emergencyDir, fileName);

    // Guardar archivo de video
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    console.log(`✅ Video guardado: ${fileName}`);

    // Metadatos del video
    const videoMetadata = {
      emergencyId,
      userId,
      fileName,
      originalName: videoFile.name,
      size: videoFile.size,
      type: videoFile.type,
      timestamp: timestamp || new Date().toISOString(),
      filePath: `/emergency-videos/${fileName}`,
      status: 'uploaded',
      duration: null, // Se podría extraer con ffmpeg
      processed: false
    };

    // En producción, aquí guardarías en la base de datos
    // await EmergencyVideo.create(videoMetadata);

    // Simular procesamiento de video para autoridades
    setTimeout(async () => {
      await processEmergencyVideo(videoMetadata);
    }, 1000);

    return NextResponse.json({
      success: true,
      message: 'Video de emergencia recibido',
      videoId: fileName,
      metadata: videoMetadata,
      actions: [
        'Video enviado a autoridades',
        'Iniciando análisis automático',
        'Notificando a operadores de monitoreo'
      ]
    });

  } catch (error) {
    console.error('❌ Error procesando video de emergencia:', error);
    return NextResponse.json(
      { 
        error: 'Error procesando video',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Función para procesar video de emergencia
async function processEmergencyVideo(videoMetadata) {
  try {
    console.log(`🔄 PROCESANDO VIDEO: ${videoMetadata.fileName}`);

    // Simular análisis del video
    const analysisResults = {
      hasAudio: true,
      videoQuality: 'HD',
      detectedObjects: ['person', 'vehicle'],
      locationVerified: true,
      emergencyIndicators: ['distress_call', 'emergency_gesture'],
      riskLevel: 'high',
      recommendedAction: 'immediate_response'
    };

    // Simular notificación a autoridades con video
    const authoritiesNotification = {
      emergencyId: videoMetadata.emergencyId,
      videoUrl: videoMetadata.filePath,
      analysis: analysisResults,
      priority: 'critical',
      timestamp: new Date().toISOString()
    };

    console.log(`📡 ENVIANDO VIDEO A AUTORIDADES:`, authoritiesNotification);

    // En producción, aquí enviarías a sistemas de emergencia reales
    
    // Simular confirmación de recepción
    setTimeout(() => {
      console.log(`✅ CONFIRMACIÓN AUTORIDADES: Video ${videoMetadata.fileName} recibido y en monitoreo`);
    }, 2000);

  } catch (error) {
    console.error('❌ Error procesando video:', error);
  }
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

    // En producción, buscarías videos en la base de datos
    // const videos = await EmergencyVideo.find({ emergencyId });

    // Simulación de videos de emergencia
    const mockVideos = [
      {
        videoId: `${emergencyId}-${Date.now()}.webm`,
        emergencyId,
        timestamp: new Date().toISOString(),
        size: 2048000,
        status: 'processed',
        filePath: `/emergency-videos/${emergencyId}-sample.webm`,
        analysis: {
          riskLevel: 'high',
          emergencyIndicators: ['distress_call'],
          recommendedAction: 'immediate_response'
        }
      }
    ];

    return NextResponse.json({
      success: true,
      videos: mockVideos,
      totalVideos: mockVideos.length
    });

  } catch (error) {
    console.error('❌ Error obteniendo videos:', error);
    return NextResponse.json(
      { error: 'Error obteniendo videos' },
      { status: 500 }
    );
  }
}