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
    return <div className="text-white text-center mt-10">Cargando servicios...</div>;
  }
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white pb-20 md:pb-0">
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-4xl font-bold text-center mb-10">Servicios Disponibles</h2>
        {loading && <p className="text-center text-gray-400">Cargando servicios...</p>}
        {error && <p className="text-center text-red-400">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {servicios.map((servicio) => (
            <div
              key={servicio._id}
              className="bg-[#1E1E1E] border border-[#333] rounded-xl shadow-md hover:shadow-orange-500/30 transition-all duration-300 flex flex-col overflow-hidden"
            >
              <div className="relative h-52 md:h-60">
                <img
                  src={servicio.imagenUrl || "/images/asistencia.jpg"}
                  alt={servicio.nombre}
                  className="object-cover w-full h-full"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  loading="lazy"
                />
              </div>
              <div className="p-4 flex flex-col gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-white">{servicio.nombre}</h3>
                  <p className="text-sm text-gray-300 mt-1">Desde: ${typeof servicio.precioMin === 'number' ? servicio.precioMin.toFixed(2) : "-"} MXN</p>
                </div>
                <Link href={`/main/extra/serviceForm?tipo=${encodeURIComponent(servicio.nombre)}`}>
                  <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-md text-sm">
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
