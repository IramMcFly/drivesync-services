import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Por favor define el MONGODB_URI en las variables de entorno.')
}

// Función para inicializar todos los modelos
const initializeModels = async () => {
  try {
    // Importar todos los modelos para asegurar que estén registrados
    await import('@/models/User');
    await import('@/models/Taller');
    await import('@/models/Servicio');
    await import('@/models/ServiceRequest');
    await import('@/models/Asistente');
    
    console.log('📋 Todos los modelos de Mongoose han sido registrados');
  } catch (error) {
    console.error('❌ Error registrando modelos:', error);
  }
};

export const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(MONGODB_URI)

    if (connection.readyState === 1) {
      console.log('MongoDB conectado')
      
      // Inicializar modelos después de la conexión
      await initializeModels();
      
      return Promise.resolve(true)
    }
  } catch (error) {
    console.error('Error conectando a MongoDB:', error)
    return Promise.reject(error)
  }
}