import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  // Referencia al usuario propietario
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Información básica del vehículo
  marca: { 
    type: String, 
    required: true, 
    trim: true 
  },
  modelo: { 
    type: String, 
    required: true, 
    trim: true 
  },
  año: { 
    type: Number, 
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 2
  },
  color: { 
    type: String, 
    required: true, 
    trim: true 
  },
  
  // Información técnica
  tipoVehiculo: {
    type: String,
    required: true,
    enum: ['sedan', 'hatchback', 'suv', 'pickup', 'coupe', 'convertible', 'wagon', 'minivan', 'motocicleta', 'otro'],
    default: 'sedan'
  },
  
  // Placas del vehículo
  placa: { 
    type: String, 
    required: true, 
    trim: true,
    uppercase: true
  },
  
  // Información adicional opcional
  numeroSerie: { 
    type: String, 
    trim: true 
  },
  kilometraje: { 
    type: Number, 
    min: 0 
  },
  
  // Estado del vehículo
  activo: { 
    type: Boolean, 
    default: true 
  },
  
  // Vehículo principal (por defecto para servicios)
  esPrincipal: { 
    type: Boolean, 
    default: false 
  },
  
  // Notas adicionales
  notas: { 
    type: String, 
    trim: true 
  }
}, {
  timestamps: true
});

// Índice compuesto para evitar placas duplicadas por usuario
vehicleSchema.index({ user: 1, placa: 1 }, { unique: true });

// Middleware para asegurar que solo hay un vehículo principal por usuario
vehicleSchema.pre('save', async function(next) {
  if (this.esPrincipal && this.isModified('esPrincipal')) {
    // Si este vehículo se marca como principal, desmarcar los otros del mismo usuario
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { esPrincipal: false }
    );
  }
  next();
});

// Método estático para obtener el vehículo principal de un usuario
vehicleSchema.statics.getPrincipal = function(userId) {
  return this.findOne({ user: userId, esPrincipal: true, activo: true });
};

// Método estático para obtener todos los vehículos activos de un usuario
vehicleSchema.statics.getByUser = function(userId) {
  return this.find({ user: userId, activo: true }).sort({ esPrincipal: -1, createdAt: -1 });
};

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);