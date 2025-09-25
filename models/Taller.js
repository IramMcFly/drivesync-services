// models/Taller.js
import mongoose from 'mongoose';


const tallerSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  direccion: { type: String, required: true, trim: true },
  telefono: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  servicios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Servicio' }], // Servicios que ofrece el taller
  asistentes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asistente' }],
  // Eliminado campo horario
  password: { type: String, required: true },
  ubicacion: {
    lat: Number,
    lng: Number,
    direccion: String,
  },
  rating: { type: Number, default: 0, min: 0, max: 5 }, // Promedio de calificación del taller
  totalRatings: { type: Number, default: 0 }, // Número total de calificaciones recibidas
  calificacion: { type: Number, default: 0, min: 0, max: 5 }, // Campo legacy, usar 'rating' en su lugar
}, {
  timestamps: true
});

export default mongoose.models.Taller || mongoose.model('Taller', tallerSchema);
