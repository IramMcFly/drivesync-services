const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Tamaños de íconos necesarios para PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  const inputPath = path.join(process.cwd(), 'public', 'images', 'logoDS.png');
  const outputDir = path.join(process.cwd(), 'public', 'icons');

  // Verificar que existe el logo
  if (!fs.existsSync(inputPath)) {
    console.error('❌ No se encontró el archivo logoDS.png en public/images/');
    console.log('📝 Por favor, coloca tu logo en public/images/logoDS.png');
    return;
  }

  // Crear directorio de íconos si no existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🎨 Generando íconos PWA...');

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 15, g: 23, b: 42, alpha: 1 } // bg-gray-900
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Creado: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Error creando icon-${size}x${size}.png:`, error.message);
    }
  }

  console.log('🎉 ¡Íconos PWA generados exitosamente!');
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
  generateIcons().catch(console.error);
}

module.exports = { generateIcons };