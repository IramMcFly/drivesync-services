"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import ServiceStatus from "@/components/view/main/ServiceStatus";
import ProvidersWrapper from "@/components/ProvidersWrapper";

export default function ServiceStatusPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const serviceId = params.serviceId;

  // Verificar autenticación
  useEffect(() => {
    if (status === 'loading') return; // Esperando a que cargue la sesión
    
    if (!session) {
      router.push('/login');
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
            onClick={() => router.push('/main/servicios-express')}
            className="bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-md transition-colors"
          >
            Volver a servicios
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
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <ProvidersWrapper>
      <ServiceStatus serviceId={serviceId} />
    </ProvidersWrapper>
  );
}
