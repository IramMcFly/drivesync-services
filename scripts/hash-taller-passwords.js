// Script para hashear las contraseñas de talleres existentes
import { connectDB } from '../lib/mongoose.js';
import Taller from '../models/Taller.js';
import bcrypt from 'bcrypt';

async function hashTallerPasswords() {
  try {
    await connectDB();
    
    // Buscar todos los talleres
    const talleres = await Taller.find({});
    
    console.log(`Encontrados ${talleres.length} talleres`);
    
    for (const taller of talleres) {
      // Verificar si la contraseña ya está hasheada (las contraseñas hasheadas con bcrypt empiezan con $2b$)
      if (!taller.password.startsWith('$2b$')) {
        console.log(`Hasheando contraseña para taller: ${taller.email}`);
        
        const hashedPassword = await bcrypt.hash(taller.password, 12);
        
        await Taller.findByIdAndUpdate(taller._id, { 
          password: hashedPassword 
        });
        
        console.log(`✓ Contraseña actualizada para: ${taller.email}`);
      } else {
        console.log(`⏭️  Contraseña ya hasheada para: ${taller.email}`);
      }
    }
    
    console.log('✅ Proceso completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

hashTallerPasswords();
