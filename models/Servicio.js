// models/Servicio.js
import mongoose from 'mongoose';


const servicioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, trim: true },
  precio: { type: Number, required: true, min: 0 },
  imagen: { type: String }, // URL o path de la imagen
  activo: { type: Boolean, default: true },
}, {
  timestamps: true
});

export default mongoose.models.Servicio || mongoose.model('Servicio', servicioSchema);