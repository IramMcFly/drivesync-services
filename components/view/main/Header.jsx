
"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import Image from "next/image"
import { FaBolt, FaMapMarkerAlt, FaLifeRing, FaUser, FaBars, FaTimes } from "react-icons/fa"
import React from "react"
import { usePathname, useRouter } from "next/navigation"

const navigationLinks = [
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
      <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-[#5D2A0C] to-[#8B4513] shadow-md">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center">
            <div className="flex items-center gap-3 mr-8">
              <Link href="/main/servicios-express" className="flex items-center gap-3">
                <div className="rounded-full overflow-hidden w-9 h-9">
                  <Image src="/images/logoDS.png" alt="DriveSync logo" width={36} height={36} />
                </div>
                <span className="font-bold text-white text-lg">DriveSync</span>
              </Link>
            </div>

            <nav className={`absolute left-0 right-0 top-16 bg-[#5D2A0C] md:bg-transparent md:static md:flex md:items-center ${isMenuOpen ? "block" : "hidden md:flex"}`}>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 p-4 md:p-0 md:ml-64">
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
              </div>
            </nav>

            <div className="ml-auto">
              <button
                className="text-white hover:bg-orange-800/20 p-2 rounded-full"
                onClick={() => router.push("/main/userProfile")}
                aria-label="Perfil de usuario"
              >
                <FaUser size={20} />
              </button>
            </div>

            {!isMobile && (
              <button
                className="md:hidden text-white hover:bg-orange-800/20 p-2 rounded-full ml-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            )}
          </div>
        </div>
      </header>

      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#5D2A0C] to-[#8B4513] text-white h-16 flex items-center justify-around z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
          {navigationLinks.map((link) => (
            <MobileNavItem
              key={link.href}
              href={link.href}
              icon={React.cloneElement(link.icon, { size: 24 })}
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
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${active ? "bg-orange-600 text-white" : "text-white hover:bg-orange-700/30"}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Link>
  )
}

function MobileNavItem({ href, children, icon }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center text-xs">
      <span className="mb-1 text-orange-400">{icon}</span>
      <span>{children}</span>
    </Link>
  )
}
