import { connectDB } from '@/lib/mongoose';
import Vehicle from '@/models/Vehicle';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as yup from 'yup';

// Esquema de validación para vehículo
const vehicleSchema = yup.object({
  marca: yup.string().required('Marca es requerida').trim(),
  modelo: yup.string().required('Modelo es requerido').trim(),
  año: yup.number()
    .required('Año es requerido')
    .min(1900, 'Año debe ser mayor a 1900')
    .max(new Date().getFullYear() + 2, 'Año no puede ser mayor al próximo año'),
  color: yup.string().required('Color es requerido').trim(),
  tipoVehiculo: yup.string()
    .required('Tipo de vehículo es requerido')
    .oneOf(['sedan', 'hatchback', 'suv', 'pickup', 'coupe', 'convertible', 'wagon', 'minivan', 'motocicleta', 'otro']),
  placa: yup.string()
    .required('Placa es requerida')
    .trim()
    .matches(/^[A-Z0-9\-]+$/, 'Placa debe contener solo letras mayúsculas, números y guiones'),
  numeroSerie: yup.string().trim().nullable(),
  kilometraje: yup.number().min(0, 'Kilometraje no puede ser negativo').nullable(),
  esPrincipal: yup.boolean().default(false),
  notas: yup.string().trim().nullable()
});

// GET: Obtener vehículos del usuario
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const vehicleId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'userId es requerido' 
      }, { status: 400 });
    }

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ 
        error: 'Usuario no encontrado' 
      }, { status: 404 });
    }

    if (vehicleId) {
      // Obtener un vehículo específico
      const vehicle = await Vehicle.findOne({ 
        _id: vehicleId, 
        user: userId, 
        activo: true 
      });
      
      if (!vehicle) {
        return NextResponse.json({ 
          error: 'Vehículo no encontrado' 
        }, { status: 404 });
      }
      
      return NextResponse.json(vehicle);
    } else {
      // Obtener todos los vehículos del usuario
      const vehicles = await Vehicle.getByUser(userId);
      return NextResponse.json(vehicles);
    }
    
  } catch (error) {
    console.error('Error en GET /api/vehicles:', error);
    return NextResponse.json({ 
      error: 'Error al obtener vehículos', 
      details: error.message 
    }, { status: 500 });
  }
}

// POST: Crear nuevo vehículo
export async function POST(request) {
  try {
    await connectDB();
    
    const data = await request.json();
    
    if (!data.userId) {
      return NextResponse.json({ 
        error: 'userId es requerido' 
      }, { status: 400 });
    }

    // Verificar que el usuario existe
    const user = await User.findById(data.userId);
    if (!user) {
      return NextResponse.json({ 
        error: 'Usuario no encontrado' 
      }, { status: 404 });
    }

    // Validar datos del vehículo
    const validatedData = await vehicleSchema.validate(data, { 
      abortEarly: false,
      stripUnknown: true 
    });

    // Verificar si ya existe un vehículo con la misma placa para este usuario
    const existingVehicle = await Vehicle.findOne({
      user: data.userId,
      placa: validatedData.placa.toUpperCase(),
      activo: true
    });

    if (existingVehicle) {
      return NextResponse.json({ 
        error: 'Ya tienes un vehículo registrado con esa placa' 
      }, { status: 400 });
    }

    // Si es el primer vehículo del usuario, marcarlo como principal
    const userVehiclesCount = await Vehicle.countDocuments({ 
      user: data.userId, 
      activo: true 
    });
    
    if (userVehiclesCount === 0) {
      validatedData.esPrincipal = true;
    }

    // Crear el vehículo
    const vehicle = await Vehicle.create({
      ...validatedData,
      user: data.userId,
      placa: validatedData.placa.toUpperCase()
    });

    return NextResponse.json({ 
      success: true, 
      vehicle 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error en POST /api/vehicles:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ 
        error: 'Datos de vehículo inválidos', 
        details: errors 
      }, { status: 400 });
    }
    
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'Ya existe un vehículo con esa placa' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Error al crear vehículo', 
      details: error.message 
    }, { status: 500 });
  }
}

// PUT: Actualizar vehículo existente
export async function PUT(request) {
  try {
    await connectDB();
    
    const data = await request.json();
    
    if (!data._id) {
      return NextResponse.json({ 
        error: 'ID del vehículo es requerido' 
      }, { status: 400 });
    }

    if (!data.userId) {
      return NextResponse.json({ 
        error: 'userId es requerido' 
      }, { status: 400 });
    }

    // Buscar el vehículo
    const existingVehicle = await Vehicle.findOne({ 
      _id: data._id, 
      user: data.userId 
    });
    
    if (!existingVehicle) {
      return NextResponse.json({ 
        error: 'Vehículo no encontrado' 
      }, { status: 404 });
    }

    // Validar datos del vehículo
    const validatedData = await vehicleSchema.validate(data, { 
      abortEarly: false,
      stripUnknown: true 
    });

    // Verificar si la placa ya existe en otro vehículo del mismo usuario
    if (validatedData.placa.toUpperCase() !== existingVehicle.placa) {
      const duplicatePlaca = await Vehicle.findOne({
        user: data.userId,
        placa: validatedData.placa.toUpperCase(),
        _id: { $ne: data._id },
        activo: true
      });

      if (duplicatePlaca) {
        return NextResponse.json({ 
          error: 'Ya tienes otro vehículo registrado con esa placa' 
        }, { status: 400 });
      }
    }

    // Actualizar el vehículo
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      data._id,
      {
        ...validatedData,
        placa: validatedData.placa.toUpperCase()
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      success: true, 
      vehicle: updatedVehicle 
    });
    
  } catch (error) {
    console.error('Error en PUT /api/vehicles:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ 
        error: 'Datos de vehículo inválidos', 
        details: errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Error al actualizar vehículo', 
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE: Eliminar vehículo (soft delete)
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('id');
    const userId = searchParams.get('userId');
    
    if (!vehicleId || !userId) {
      return NextResponse.json({ 
        error: 'ID del vehículo y userId son requeridos' 
      }, { status: 400 });
    }

    // Buscar el vehículo
    const vehicle = await Vehicle.findOne({ 
      _id: vehicleId, 
      user: userId 
    });
    
    if (!vehicle) {
      return NextResponse.json({ 
        error: 'Vehículo no encontrado' 
      }, { status: 404 });
    }

    // Verificar si es el único vehículo activo del usuario
    const activeVehiclesCount = await Vehicle.countDocuments({ 
      user: userId, 
      activo: true 
    });
    
    if (activeVehiclesCount <= 1) {
      return NextResponse.json({ 
        error: 'No puedes eliminar tu único vehículo. Agrega otro primero.' 
      }, { status: 400 });
    }

    // Soft delete
    vehicle.activo = false;
    await vehicle.save();

    // Si era el vehículo principal, asignar otro como principal
    if (vehicle.esPrincipal) {
      const nextVehicle = await Vehicle.findOne({ 
        user: userId, 
        activo: true,
        _id: { $ne: vehicleId }
      });
      
      if (nextVehicle) {
        nextVehicle.esPrincipal = true;
        await nextVehicle.save();
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Vehículo eliminado correctamente' 
    });
    
  } catch (error) {
    console.error('Error en DELETE /api/vehicles:', error);
    return NextResponse.json({ 
      error: 'Error al eliminar vehículo', 
      details: error.message 
    }, { status: 500 });
  }
}