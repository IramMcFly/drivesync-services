"use client"

import { useState } from "react"
import Image from "next/image"
import { FaSearch } from "react-icons/fa"

const Lugares = () => {
  const [searchTerm, setSearchTerm] = useState("")

  const lugaresAfiliados = [
    {
      id: 1,
      nombre: "AutoZone Chihuahua #7014",
      descripcion: "Tienda Especializada de Vehículos",
      imagen: "/images/autozone.jpg",
    },
    {
      id: 2,
      nombre: "ProDynamics",
      descripcion: "Tienda Especializada en llantas",
      imagen: "/images/prodynamics.jpg",
    },
    {
      id: 3,
      nombre: "Marlo Gasolinera Chihuahua",
      descripcion: "Gasolinera Top Tier",
      imagen: "/images/marlo.jpg",
    },
    {
      id: 4,
      nombre: "Multiservicios Almeraz",
      descripcion: "Servicios Rápidos y Económicos",
      imagen: "/images/almeraz.jpg",
    },
    {
      id: 5,
      nombre: "AutoZone Chihuahua #7554",
      descripcion: "Tienda Especializada de Vehículos",
      imagen: "/images/autozone.jpg",
    },
    {
      id: 6,
      nombre: 'Taller Automotriz "Garage Orona"',
      descripcion: "Taller Mecánico",
      imagen: "/images/orna.jpg",
    },
    {
      id: 7,
      nombre: "Taller Mecánico AutoAvante",
      descripcion: "Taller Mecánico",
      imagen: "/images/autoavante.png",
    },
    {
      id: 8,
      nombre: "VipCare Autolavado",
      descripcion: "Auto lavado de servicio",
      imagen: "/images/vipcare.png",
    },
    {
      id: 9,
      nombre: "ServicioExpress Autolavado",
      descripcion: "Auto lavado de servicio",
      imagen: "/images/autoexpress.jpg",
    },
  ]

  const lugaresFiltered = searchTerm
    ? lugaresAfiliados.filter(
        (lugar) =>
          lugar.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lugar.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : lugaresAfiliados

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white pb-16 md:pb-0">
      <section className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-white tracking-tight">Lugares Afiliados</h2>
            <p className="text-orange-400 text-lg">Explora nuestros comercios aliados</p>
          </div>
          <div className="relative w-full md:w-72">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar lugar..."
              className="w-full pl-11 pr-4 py-3 bg-[#1E1E1E] border border-[#333] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {lugaresFiltered.map((lugar) => (
            <div
              key={lugar.id}
              className="bg-[#1E1E1E] border border-[#333] rounded-xl shadow-md hover:shadow-orange-500/30 transition-all duration-300 flex flex-col overflow-hidden"
            >
              <div className="relative h-52 md:h-60 w-full">
                <Image
                  src={lugar.imagen}
                  alt={lugar.nombre}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 flex flex-col gap-2 text-start">
                <h3 className="text-white text-lg font-semibold">{lugar.nombre}</h3>
                <p className="text-gray-300 text-sm">{lugar.descripcion}</p>
              </div>
            </div>
          ))}
        </div>

        {lugaresFiltered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-xl text-white">
              No se encontraron lugares que coincidan con tu búsqueda.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

export default Lugares
