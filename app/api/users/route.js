export async function DELETE(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return new NextResponse('ID requerido', { status: 400 });
  await User.findByIdAndDelete(id);
  return new NextResponse('Eliminado', { status: 200 });
}

import { connectDB } from '@/lib/mongoose'
import User from '@/models/User'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

export async function GET() {
  await connectDB();
  const users = await User.find({});
  return NextResponse.json(users);
}

export async function POST(request) {
    try {
        await connectDB();

        // Detectar si el request es FormData (registro) o JSON (login)
        const contentType = request.headers.get('content-type') || '';
        let email, password, fotoBuffer;

        if (contentType.includes('multipart/form-data')) {
            // Registro con foto
            const formData = await request.formData();
            email = formData.get('email');
            password = formData.get('password');
            const foto = formData.get('foto');
            if (foto && typeof foto.arrayBuffer === 'function') {
                const arrayBuffer = await foto.arrayBuffer();
                fotoBuffer = Buffer.from(arrayBuffer);
            }
        } else {
            // Login
            const body = await request.json();
            email = body.email;
            password = body.password;
        }

        // Buscar el usuario por email
        let user = await User.findOne({ email });

        if (!user) {
            // Si el usuario no existe, lo creamos
            const hashedPassword = await bcrypt.hash(password, 10);
            const userData = {
                email,
                password: hashedPassword
            };
            if (fotoBuffer) {
                userData.foto = fotoBuffer;
            }
            user = await User.create(userData);

            return NextResponse.json({
                message: 'Usuario creado exitosamente',
                user: { email: user.email }
            });
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
            user: { email: user.email }
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Error del Servidor' },
            { status: 500 }
        );
    }
}