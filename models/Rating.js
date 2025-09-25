// models/Rating.js
import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  usuario: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  taller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Taller', 
    required: true 
  },
  serviceRequest: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ServiceRequest', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comentario: { 
    type: String, 
    trim: true,
    maxlength: 500
  },
  fechaCalificacion: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Índice único para evitar calificaciones duplicadas por el mismo usuario al mismo taller en el mismo servicio
ratingSchema.index({ usuario: 1, taller: 1, serviceRequest: 1 }, { unique: true });

export default mongoose.models.Rating || mongoose.model('Rating', ratingSchema);