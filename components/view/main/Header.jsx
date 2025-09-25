
"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import Image from "next/image"
import { FaBolt, FaMapMarkerAlt, FaLifeRing, FaUser, FaBars, FaTimes, FaShieldAlt, FaToolbox, FaCog } from "react-icons/fa"
import React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

const baseNavigationLinks = [
  {
    name: "Servicios Express",
    href: "/main/servicios-express",
    icon: <FaBolt size={16} />,
    component: "ServiciosExpress"
  },
  {
    name: "Lugares Afiliados",
    href: "/lugares",
    icon: <FaMapMarkerAlt size={16} />,
    component: "Lugares"
  },
  {
    name: "Asistencia Especial",
    href: "/main/asistencia",
    icon: <FaLifeRing size={16} />,
    component: "Asistencia"
  }
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  // Generar enlaces de navegación dinámicamente basados en el rol del usuario
  const getNavigationLinks = () => {
    const links = [...baseNavigationLinks]
    
    // Agregar enlace de Panel Administrativo para usuarios admin
    if (session?.user?.userType === 'admin') {
      links.push({
        name: "Panel Admin",
        href: "/admin",
        icon: <FaShieldAlt size={16} />,
        component: "AdminPanel"
      })
    }
    
    // Agregar enlace de Dashboard de Asistente para usuarios asistente
    if (session?.user?.userType === 'asistente') {
      links.push({
        name: "Dashboard Asistente",
        href: "/asistente",
        icon: <FaToolbox size={16} />,
        component: "AsistenteDashboard"
      })
    }
    
    // Agregar enlace de Dashboard de Taller para usuarios taller
    if (session?.user?.userType === 'taller') {
      links.push({
        name: "Dashboard Taller",
        href: "/taller/dashboard",
        icon: <FaCog size={16} />,
        component: "TallerDashboard"
      })
    }
    
    return links
  }

  const navigationLinks = getNavigationLinks()

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-lg border-b border-gray-600/50 shadow-lg transition-all duration-300">
        <div className="mx-auto px-4 lg:px-6">
          <div className="flex h-18 items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/main/servicios-express')} 
                className="flex items-center gap-4 hover:scale-105 transition-all duration-300 group"
              >
                <div className="rounded-2xl overflow-hidden w-12 h-12 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-1.5 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Image src="/images/logoDS.png" alt="DriveSync logo" width={40} height={40} className="w-full h-full object-contain filter drop-shadow-sm" />
                </div>
                <span className="font-bold text-white text-2xl tracking-wide bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent transition-all duration-300">DriveSync</span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {navigationLinks.map((link) => (
                <NavItem
                  key={link.href}
                  href={link.href}
                  active={pathname === link.href}
                  icon={link.icon}
                >
                  {link.name}
                </NavItem>
              ))}
            </nav>

            {/* User Profile Button */}
            <div className="flex items-center gap-3">
              <button
                className="text-gray-300 hover:text-white hover:bg-white/10 p-3 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/20"
                onClick={() => router.push("/main/userProfile")}
                aria-label="Perfil de usuario"
              >
                <FaUser size={20} />
              </button>
              
              {/* Mobile menu button */}
              <button
                className="md:hidden text-gray-300 hover:text-white hover:bg-white/10 p-3 rounded-xl ml-2 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/20"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <nav className="md:hidden py-6 border-t border-gray-600/50 bg-gradient-to-b from-gray-800/95 to-gray-900/95 backdrop-blur-lg transition-all duration-300">
              <div className="flex flex-col space-y-3">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center px-6 py-4 text-sm font-medium rounded-2xl mx-4 transition-all duration-300 backdrop-blur-sm border ${
                      pathname === link.href
                        ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-white border-orange-500/30 shadow-lg"
                        : "text-gray-300 hover:bg-white/10 border-white/10 hover:border-white/20 hover:text-white"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mr-4 text-lg">{link.icon}</span>
                    {link.name}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-800/95 backdrop-blur-xl border-t border-gray-600/50 h-20 flex items-center justify-around z-50 shadow-2xl transition-all duration-300">
          {navigationLinks.map((link) => (
            <MobileNavItem
              key={link.href}
              href={link.href}
              icon={React.cloneElement(link.icon, { size: 26 })}
              active={pathname === link.href}
            >
              {link.name}
            </MobileNavItem>
          ))}
        </nav>
      )}
    </>
  )
}

function NavItem({ href, children, active, icon }) {
  return (
    <Link
      href={href}
      className={`px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center backdrop-blur-sm border ${
        active 
          ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-white border-orange-500/30 shadow-lg transform scale-105" 
          : "text-gray-300 hover:text-white hover:bg-white/10 border-white/10 hover:border-white/20 hover:scale-105"
      }`}
    >
      {icon && <span className="mr-3 text-base">{icon}</span>}
      {children}
    </Link>
  )
}

function MobileNavItem({ href, children, icon, active }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center py-3 px-4 min-w-0 flex-1 group">
      <div className={`p-2 rounded-xl mb-2 transition-all duration-300 ${
        active 
          ? "bg-gradient-to-br from-orange-500/30 to-red-500/30 border border-orange-500/40" 
          : "group-hover:bg-white/10 border border-transparent group-hover:border-white/20"
      }`}>
        <span className={`text-xl transition-all duration-300 ${
          active ? "text-orange-400" : "text-gray-400 group-hover:text-white"
        }`}>
          {icon}
        </span>
      </div>
      <span className={`text-xs font-medium truncate transition-all duration-300 ${
        active ? "text-orange-400" : "text-gray-400 group-hover:text-white"
      }`}>
        {children}
      </span>
    </Link>
  )
}
