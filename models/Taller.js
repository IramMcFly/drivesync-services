// models/Taller.js
import mongoose from 'mongoose';


const tallerSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  direccion: { type: String, trim: true },
  telefono: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  servicios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Servicio' }], // Servicios que ofrece el taller
  asistentes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asistente' }],
  horario: { type: String },
  ubicacion: {
    lat: Number,
    lng: Number,
    direccion: String,
  },
  activo: { type: Boolean, default: true },
}, {
  timestamps: true
});

export default mongoose.models.Taller || mongoose.model('Taller', tallerSchema);