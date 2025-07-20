// models/ServiceRequest.js
import mongoose from 'mongoose';


const serviceRequestSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taller: { type: mongoose.Schema.Types.ObjectId, ref: 'Taller', required: true },
  servicio: { type: mongoose.Schema.Types.ObjectId, ref: 'Servicio', required: true },
  asistente: { type: mongoose.Schema.Types.ObjectId, ref: 'Asistente' }, // se asigna automáticamente
  estado: { type: String, enum: ['pendiente', 'asignado', 'en_camino', 'finalizado', 'cancelado'], default: 'pendiente' },
  detallesVehiculo: {
    marca: String,
    modelo: String,
    año: String,
    tipoVehiculo: String,
  },
  ubicacion: {
    lat: Number,
    lng: Number,
    direccion: String,
  },
  historial: [{
    estado: String,
    fecha: { type: Date, default: Date.now },
    comentario: String,
  }],
  fechaSolicitud: { type: Date, default: Date.now },
}, {
  timestamps: true
});

export default mongoose.models.ServiceRequest || mongoose.model('ServiceRequest', serviceRequestSchema);