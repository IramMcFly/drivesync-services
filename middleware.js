import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedRoutes = [
  '/view/main/servicios-express',
  // agrega aquí más rutas privadas si lo necesitas
];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  // Solo proteger rutas que estén en la lista
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL('/', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/view/main/servicios-express'], // puedes agregar más rutas aquí
};
