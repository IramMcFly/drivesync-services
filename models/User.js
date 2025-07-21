import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  nombre: { type: String, required: true, trim: true },
  telefono: { type: String, required: true,trim: true },
  role: { type: String, enum: ['cliente', 'asistente', 'admin'], default: 'cliente' },
  foto: { type: Buffer }, // Imagen almacenada como dato binario
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model('User', userSchema);
