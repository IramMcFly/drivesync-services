

import { connectDB } from '@/lib/mongoose'
import User from '@/models/User'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import * as yup from 'yup'

// Esquema de validación para registro y actualización
const userSchema = yup.object({
  email: yup.string().email('Email inválido').required('Email requerido'),
  password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nombre: yup.string().required('Nombre requerido'),
  telefono: yup.string().required('Teléfono requerido'),
  role: yup.string().oneOf(['cliente', 'asistente', 'admin']).default('cliente'),
});
// GET: Listar todos los usuarios o uno por ID
export async function GET(request) {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    try {
        if (id) {
            let user;
            if (id.includes('@')) {
                user = await User.findOne({ email: id });
            } else if (/^[0-9a-fA-F]{24}$/.test(id)) {
                // Si es un ObjectId válido
                user = await User.findById(id);
            } else {
                // Buscar por teléfono
                user = await User.findOne({ telefono: id });
            }
            if (!user) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
            return NextResponse.json(user);
        } else {
            const users = await User.find({});
            return NextResponse.json(users);
        }
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener usuario(s)', details: error.message }, { status: 400 });
    }
}

// POST: Registro o login de usuario
export async function POST(request) {
    try {
        await connectDB();
        const contentType = request.headers.get('content-type') || '';
        let email, password, nombre, telefono, role, fotoBuffer;
        let isRegister = false;

        if (contentType.includes('multipart/form-data')) {
            // Registro con foto y datos
            const formData = await request.formData();
            email = formData.get('email');
            password = formData.get('password');
            nombre = formData.get('nombre');
            telefono = formData.get('telefono');
            role = formData.get('role') || 'cliente';
            isRegister = true;
            const foto = formData.get('foto');
            if (foto && typeof foto.arrayBuffer === 'function') {
                const arrayBuffer = await foto.arrayBuffer();
                fotoBuffer = Buffer.from(arrayBuffer);
            }
        } else {
            // JSON request - puede ser login o registro directo
            const body = await request.json();
            email = body.email;
            password = body.password;
            nombre = body.nombre;
            telefono = body.telefono;
            role = body.role || 'cliente';
            
            // Si incluye nombre y teléfono, es un registro
            if (nombre && telefono) {
                isRegister = true;
            }
        }

        // Validación solo en registro
        if (isRegister) {
            try {
                await userSchema.validate({ email, password, nombre, telefono, role }, { abortEarly: false });
            } catch (validationError) {
                console.error('Error de validación:', validationError.errors);
                return NextResponse.json({
                    error: 'Datos inválidos',
                    details: validationError.errors
                }, { status: 400 });
            }
        }

        // Buscar el usuario por email
        let user = await User.findOne({ email });

        if (!user) {
            // Si el usuario no existe y es un registro, lo creamos
            if (isRegister) {
                const hashedPassword = await bcrypt.hash(password, 12);
                const userData = {
                    email,
                    password: hashedPassword,
                    nombre,
                    telefono,
                    role: role || 'cliente'
                };
                if (fotoBuffer) {
                    userData.foto = fotoBuffer;
                }
                user = await User.create(userData);

                return NextResponse.json({
                    message: 'Usuario creado exitosamente',
                    _id: user._id,
                    email: user.email,
                    nombre: user.nombre,
                    telefono: user.telefono,
                    role: user.role
                });
            } else {
                return NextResponse.json(
                    { error: 'Usuario no encontrado' },
                    { status: 404 }
                );
            }
        } else {
            // Si el usuario existe y es un registro, devolver error
            if (isRegister) {
                return NextResponse.json(
                    { error: 'Ya existe un usuario con este email' },
                    { status: 409 }
                );
            }
        }

        // Si el usuario existe, verificamos la contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Contraseña inválida' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            message: 'Usuario autenticado exitosamente',
            user: { email: user.email, nombre: user.nombre, telefono: user.telefono }
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Error del Servidor', details: error.errors || error.message },
            { status: 500 }
        );
    }
}

// PUT: Actualizar usuario existente
export async function PUT(request) {
    await connectDB();
    const contentType = request.headers.get('content-type') || '';
    let data = {};
    if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        data._id = formData.get('_id');
        data.nombre = formData.get('nombre');
        data.telefono = formData.get('telefono');
        data.email = formData.get('email');
        const foto = formData.get('foto');
        if (foto && typeof foto.arrayBuffer === 'function') {
            const arrayBuffer = await foto.arrayBuffer();
            data.foto = Buffer.from(arrayBuffer);
        }
        if (formData.get('password')) {
            data.password = await bcrypt.hash(formData.get('password'), 10);
        }
    } else {
        data = await request.json();
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
    }
    if (!data._id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    
    // Validar datos según el tipo de actualización
    try {
        // Si solo se está actualizando el role, no validar todo el esquema
        if (Object.keys(data).length === 2 && data._id && data.role) {
            // Solo validar el role
            const roleSchema = yup.object({
                role: yup.string().oneOf(['cliente', 'asistente', 'admin']).required()
            });
            await roleSchema.validate({ role: data.role });
        } else {
            // Validar datos básicos (excepto password, que es opcional en update)
            await userSchema.omit(['password']).validate(data, { abortEarly: false });
        }
    } catch (validationError) {
        return NextResponse.json({
            error: 'Datos inválidos',
            details: validationError.errors
        }, { status: 400 });
    }
    try {
        const { _id, ...rest } = data;
        const user = await User.findByIdAndUpdate(_id, rest, { new: true });
        if (!user) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Error al actualizar usuario', details: error.message }, { status: 400 });
    }
}

// DELETE: Eliminar usuario
export async function DELETE(request) {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    try {
        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
        return NextResponse.json({ message: 'Eliminado' });
    } catch (error) {
        return NextResponse.json({ error: 'Error al eliminar usuario', details: error.message }, { status: 400 });
    }
}