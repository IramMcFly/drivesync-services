"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AsistenteActiveService from "@/components/view/asistente/AsistenteActiveService";
import ProvidersWrapper from "@/components/ProvidersWrapper";

export default function AsistenteActiveServicePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Verificar autenticación y rol
  useEffect(() => {
    if (status === 'loading') return; // Esperando a que cargue la sesión
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Verificar que el usuario sea un asistente
    if (session.user.role !== 'asistente') {
      router.push('/main'); // Redirigir a la página principal si no es asistente
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'asistente') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acceso no autorizado</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Esta sección es solo para asistentes.
          </p>
          <button
            onClick={() => router.push('/main')}
            className="bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-md transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProvidersWrapper>
      <AsistenteActiveService />
    </ProvidersWrapper>
  );
}
