
"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import Image from "next/image"
import { FaBolt, FaMapMarkerAlt, FaLifeRing, FaUser, FaBars, FaTimes } from "react-icons/fa"
import React from "react"
import { usePathname, useRouter } from "next/navigation"
import ThemeToggle from '../../ThemeToggle'

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
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="mx-auto px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/main/servicios-express" className="flex items-center gap-3">
                <div className="rounded-xl overflow-hidden w-10 h-10 bg-primary p-1">
                  <Image src="/images/logoDS.png" alt="DriveSync logo" width={32} height={32} className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-xl transition-colors">DriveSync</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
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
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <ThemeToggle />
              
              <button
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2.5 rounded-full transition-colors"
                onClick={() => router.push("/main/userProfile")}
                aria-label="Perfil de usuario"
              >
                <FaUser size={18} />
              </button>
              
              {/* Mobile menu button */}
              <button
                className="md:hidden text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2.5 rounded-full ml-2 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <nav className="md:hidden py-4 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 transition-colors">
              <div className="flex flex-col space-y-2">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors ${
                      pathname === link.href
                        ? "bg-primary text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mr-3 text-base">{link.icon}</span>
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
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 h-16 flex items-center justify-around z-50 shadow-lg transition-colors">
          {navigationLinks.map((link) => (
            <MobileNavItem
              key={link.href}
              href={link.href}
              icon={React.cloneElement(link.icon, { size: 24 })}
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
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center ${
        active 
          ? "bg-primary text-white shadow-md" 
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      {icon && <span className="mr-2 text-base">{icon}</span>}
      {children}
    </Link>
  )
}

function MobileNavItem({ href, children, icon, active }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1">
      <span className={`mb-1 text-lg transition-colors ${
        active ? "text-primary" : "text-gray-500 dark:text-gray-400"
      }`}>
        {icon}
      </span>
      <span className={`text-xs font-medium truncate transition-colors ${
        active ? "text-primary" : "text-gray-500 dark:text-gray-400"
      }`}>
        {children}
      </span>
    </Link>
  )
}
