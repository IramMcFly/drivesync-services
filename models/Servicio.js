// models/Servicio.js
import mongoose from 'mongoose';


const servicioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, trim: true },
  subtipos: [{
    nombre: { type: String, required: true, trim: true },
    precio: { type: Number, required: true, min: 0 },
  }],
  precioMin: { type: Number, required: true, min: 0 },
  precioMax: { type: Number, required: true, min: 0 },
  imagen: { type: Buffer }, // Imagen almacenada como dato binario
}, {
  timestamps: true
});

export default mongoose.models.Servicio || mongoose.model('Servicio', servicioSchema);