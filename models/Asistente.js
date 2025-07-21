// models/Asistente.js
import mongoose from 'mongoose';


const asistenteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // Relación con usuario base
  taller: { type: mongoose.Schema.Types.ObjectId, ref: 'Taller', required: true },
  activo: { type: Boolean, default: false }, // Indica si el asistente está activo
  ubicacionActual: {
    lat: Number,
    lng: Number,
  },
  placa: { type: String },
}, {
  timestamps: true
});

export default mongoose.models.Asistente || mongoose.model('Asistente', asistenteSchema);
