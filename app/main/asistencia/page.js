
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import ServiceStatus from "@/components/view/main/ServiceStatus";
import Asistencia from "@/components/view/main/Asistencia";
import ProvidersWrapper from "@/components/ProvidersWrapper";
import Header from "@/components/view/main/Header";
import ServiceStatusWrapper from "@/components/view/cliente/ServiceStatusWrapper";

export default function AsistenciaPage() {
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
      <ProvidersWrapper>
        <ServiceStatus serviceId={serviceId} />
        <ServiceStatusWrapper />
      </ProvidersWrapper>
    );
  }

  // Si no hay serviceId, mostrar la página de asistencia normal
  return (
    <ProvidersWrapper>
      <Header />
      <Asistencia />
      <ServiceStatusWrapper />
    </ProvidersWrapper>
  );
}
