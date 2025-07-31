
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, Suspense } from "react";
import ServiceStatus from "@/components/view/main/ServiceStatus";
import Asistencia from "@/components/view/main/Asistencia";
import ProvidersWrapper from "@/components/ProvidersWrapper";
import Header from "@/components/view/main/Header";
import ServiceStatusWrapper from "@/components/view/cliente/ServiceStatusWrapper";

// Componente que usa useSearchParams envuelto en Suspense
function AsistenciaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const serviceId = searchParams.get('serviceId');

  // Verificar autenticación
  useEffect(() => {
    if (status === 'loading') return; // Esperando a que cargue la sesión
    
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  // Si hay un serviceId, mostrar el estado del servicio
  if (serviceId) {
    return (
      <>
        <ServiceStatus serviceId={serviceId} />
        <ServiceStatusWrapper />
      </>
    );
  }

  // Si no hay serviceId, mostrar la página de asistencia normal
  return (
    <>
      <Header />
      <Asistencia />
      <ServiceStatusWrapper />
    </>
  );
}

export default function AsistenciaPage() {
  return (
    <ProvidersWrapper>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>}>
        <AsistenciaContent />
      </Suspense>
    </ProvidersWrapper>
  );
}
