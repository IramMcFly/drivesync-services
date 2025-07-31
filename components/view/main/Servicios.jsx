"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Servicios() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated") {
      const fetchServicios = async () => {
        try {
          const res = await fetch("/api/servicios")
          if (!res.ok) throw new Error("Error al cargar servicios")
          const data = await res.json()
          // Convertir buffer de imagen a base64 si existe
          const serviciosConImagen = data.map(servicio => {
            let imagenUrl = null;
            if (servicio.imagen && servicio.imagen.data) {
              // Detectar tipo mime, por defecto image/jpeg
              const mimeType = servicio.imagen.type || 'image/jpeg';
              const base64String = Buffer.from(servicio.imagen.data).toString('base64');
              imagenUrl = `data:${mimeType};base64,${base64String}`;
            }
            return { ...servicio, imagenUrl };
          });
          setServicios(serviciosConImagen)
        } catch (err) {
          setError("No se pudieron cargar los servicios")
        } finally {
          setLoading(false)
        }
      }
      fetchServicios()
    }
  }, [status, router])

  if (status === "loading") {
    return <div className="text-gray-900 dark:text-gray-100 text-center mt-10 transition-colors">Cargando servicios...</div>;
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-20 md:pb-0 transition-colors">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-10 text-gray-900 dark:text-gray-100">Servicios Disponibles</h2>
        {loading && <p className="text-center text-gray-600 dark:text-gray-400">Cargando servicios...</p>}
        {error && <p className="text-center text-red-500 dark:text-red-400">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {servicios.map((servicio) => (
            <div
              key={servicio._id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg dark:hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-500/30 transition-all duration-300 flex flex-col overflow-hidden"
            >
              <div className="relative h-48 sm:h-52 lg:h-60">
                <img
                  src={servicio.imagenUrl || "/images/asistencia.jpg"}
                  alt={servicio.nombre}
                  className="object-cover w-full h-full"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  loading="lazy"
                />
              </div>
              <div className="p-3 sm:p-4 flex flex-col gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">{servicio.nombre}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Desde: ${typeof servicio.precioMin === 'number' ? servicio.precioMin.toFixed(2) : "-"} MXN</p>
                </div>
                <Link href={`/main/extra/serviceForm?tipo=${encodeURIComponent(servicio.nombre)}`}>
                  <button className="w-full bg-primary hover:bg-primary-hover text-white py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-colors">
                    Solicitar
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
