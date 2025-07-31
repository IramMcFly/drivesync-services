import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Taller from "@/models/Taller";
import bcrypt from "bcrypt";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "correo@ejemplo.com" },
        password: { label: "Contraseña", type: "password" },
        userType: { label: "Tipo de usuario", type: "text" },
      },
      async authorize(credentials) {
        try {
          await connectDB();
          
          const { email, password, userType } = credentials;
          
          if (userType === 'taller') {
            // Buscar en la colección de talleres
            const taller = await Taller.findOne({ email });
            if (!taller) {
              console.log('Taller no encontrado:', email);
              return null;
            }
            
            const isValid = await bcrypt.compare(password, taller.password);
            if (!isValid) {
              console.log('Contraseña incorrecta para taller:', email);
              return null;
            }
            
            console.log('Taller autenticado exitosamente:', email);
            return { 
              id: taller._id.toString(), 
              email: taller.email, 
              nombre: taller.nombre, 
              role: 'taller',
              userType: 'taller',
              telefono: taller.telefono,
              direccion: taller.direccion,
              servicios: taller.servicios
            };
          } else {
            // Lógica original para usuarios
            const user = await User.findOne({ email });
            if (!user) {
              console.log('Usuario no encontrado:', email);
              return null;
            }
            
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
              console.log('Contraseña incorrecta para usuario:', email);
              return null;
            }
            
            console.log('Usuario autenticado exitosamente:', email);
            return { 
              id: user._id.toString(),
              email: user.email, 
              nombre: user.nombre, 
              role: user.role, 
              userType: user.role // Usar el rol real como userType
            };
          }
        } catch (error) {
          console.error('Error en autorización:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.nombre = user.nombre;
        token.role = user.role;
        token.userType = user.userType;
        
        // Campos adicionales para talleres
        if (user.userType === 'taller') {
          token.telefono = user.telefono;
          token.direccion = user.direccion;
          token.servicios = user.servicios;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.nombre = token.nombre;
        session.user.role = token.role;
        session.user.userType = token.userType;
        
        // Campos adicionales para talleres
        if (token.userType === 'taller') {
          session.user.telefono = token.telefono;
          session.user.direccion = token.direccion;
          session.user.servicios = token.servicios;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      console.log('NextAuth Debug:', code, metadata);
    }
  },
});

export { handler as GET, handler as POST };
