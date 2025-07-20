// models/Asistente.js
import mongoose from 'mongoose';


const asistenteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // Relación con usuario base
  taller: { type: mongoose.Schema.Types.ObjectId, ref: 'Taller', required: true },
  activo: { type: Boolean, default: true },
  ubicacionActual: {
    lat: Number,
    lng: Number,
    direccion: String,
  },
  foto: { type: String },
  placa: { type: String },
}, {
  timestamps: true
});

export default mongoose.models.Asistente || mongoose.model('Asistente', asistenteSchema);
