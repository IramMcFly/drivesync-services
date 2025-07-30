"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import AsistenteActiveService from "@/components/view/asistente/AsistenteActiveService";
import ProvidersWrapper from "@/components/ProvidersWrapper";

export default function AsistenteActiveServicePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const serviceId = params.serviceId;

  // Verificar autenticación y rol
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user.role !== 'asistente') {
      router.push('/main');
      return;
    }
  }, [session, status, router]);

  // Verificar que tenemos un serviceId
  if (!serviceId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Servicio no encontrado</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">No se proporcionó un ID de servicio válido.</p>
          <button
            onClick={() => router.push('/asistente')}
            className="bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-md transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

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
      <AsistenteActiveService serviceId={serviceId} />
    </ProvidersWrapper>
  );
}
