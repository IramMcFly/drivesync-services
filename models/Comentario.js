import mongoose from 'mongoose';

const comentarioSchema = new mongoose.Schema({
  taller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Taller',
    required: true
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comentario: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  calificacion: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  respuestas: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comentario: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    fecha: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Índices para mejorar rendimiento
comentarioSchema.index({ taller: 1, fecha: -1 });
comentarioSchema.index({ usuario: 1 });

export default mongoose.models.Comentario || mongoose.model('Comentario', comentarioSchema);
