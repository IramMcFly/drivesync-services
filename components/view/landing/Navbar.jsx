"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes, FaCar } from 'react-icons/fa';

export default function Navbar({ isScrolled }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <FaCar className="text-primary text-xl sm:text-2xl" />
            <span className="font-montserrat font-black text-lg sm:text-xl text-white">
              DriveSync
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#servicios" className="text-gray-300 hover:text-primary transition-colors">
              Servicios
            </a>
            <a href="#como-funciona" className="text-gray-300 hover:text-primary transition-colors">
              Cómo Funciona
            </a>
            <a href="#contacto" className="text-gray-300 hover:text-primary transition-colors">
              Contacto
            </a>
            <Link href="/login" className="text-gray-300 hover:text-primary transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/register/UserRegister" 
              className="bg-primary hover:bg-primary-hover text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors font-medium text-sm sm:text-base">
              Registrarse
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-800/95 backdrop-blur-md rounded-lg mt-2 py-4 px-4">
            <div className="flex flex-col space-y-4">
              <a href="#servicios" 
                onClick={toggleMenu}
                className="text-gray-300 hover:text-primary transition-colors py-2">
                Servicios
              </a>
              <a href="#como-funciona" 
                onClick={toggleMenu}
                className="text-gray-300 hover:text-primary transition-colors py-2">
                Cómo Funciona
              </a>
              <a href="#contacto" 
                onClick={toggleMenu}
                className="text-gray-300 hover:text-primary transition-colors py-2">
                Contacto
              </a>
              <Link href="/login" 
                onClick={toggleMenu}
                className="text-gray-300 hover:text-primary transition-colors py-2">
                Iniciar Sesión
              </Link>
              <Link href="/register/UserRegister" 
                onClick={toggleMenu}
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-colors font-medium text-center">
                Registrarse
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
