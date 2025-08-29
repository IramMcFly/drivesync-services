"use client";

import Link from 'next/link';
import { FaCar, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function FooterSection() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    servicios: [
      { name: "Mecánica Express", href: "/register/UserRegister" },
      { name: "Cambio de Batería", href: "/register/UserRegister" },
      { name: "Diagnóstico", href: "/register/UserRegister" },
      { name: "Asistencia Vial", href: "/register/UserRegister" },
      { name: "Mantenimiento", href: "/register/UserRegister" }
    ],
    empresa: [
      { name: "Acerca de Nosotros", href: "#" },
      { name: "Cómo Funciona", href: "#como-funciona" },
      { name: "Nuestro Equipo", href: "#" },
      { name: "Carreras", href: "#" },
      { name: "Blog", href: "#" }
    ],
    soporte: [
      { name: "Centro de Ayuda", href: "#" },
      { name: "Contacto", href: "#contacto" },
      { name: "Términos de Servicio", href: "#" },
      { name: "Política de Privacidad", href: "#" },
      { name: "FAQ", href: "#" }
    ],
    talleres: [
      { name: "Registrar Taller", href: "/register/TallerRegister" },
      { name: "Portal de Talleres", href: "/login" },
      { name: "Requisitos", href: "#" },
      { name: "Beneficios", href: "#" },
      { name: "Comisiones", href: "#" }
    ]
  };

  const socialLinks = [
    { name: "Facebook", icon: FaFacebook, href: "#", color: "hover:text-blue-500" },
    { name: "Twitter", icon: FaTwitter, href: "#", color: "hover:text-blue-400" },
    { name: "Instagram", icon: FaInstagram, href: "#", color: "hover:text-pink-500" },
    { name: "LinkedIn", icon: FaLinkedin, href: "#", color: "hover:text-blue-600" }
  ];

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <FaCar className="text-primary text-3xl" />
              <span className="font-montserrat font-black text-2xl text-white">
                DriveSync
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              Tu asistente automotriz confiable. Servicios de emergencia vehiculares, 
              diagnóstico y mantenimiento. Llegamos donde estés, cuando lo necesites.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400">
                <FaPhone className="text-primary" />
                <span>+52 614 128 9937</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <FaEnvelope className="text-primary" />
                <span>contacto@drivesync.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <FaMapMarkerAlt className="text-primary" />
                <span>Chihuahua, Chihuahua, México</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 transition-colors ${social.color} hover:bg-gray-700`}
                    aria-label={social.name}
                  >
                    <IconComponent className="text-lg" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-white mb-6">Servicios</h3>
            <ul className="space-y-3">
              {footerLinks.servicios.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-6">Empresa</h3>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-6">Soporte</h3>
            <ul className="space-y-3">
              {footerLinks.soporte.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            {/* CTA for Workshops */}
            <div className="mt-8 p-4 bg-gradient-to-r from-primary/20 to-orange-500/20 border border-primary/30 rounded-lg">
              <h4 className="font-semibold text-white mb-2 text-sm">¿Eres un Taller?</h4>
              <p className="text-gray-400 text-xs mb-3">
                Únete a nuestra red de talleres certificados
              </p>
              <Link
                href="/register/TallerRegister"
                className="inline-block bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
              >
                Registrar Taller
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} DriveSync Services. Todos los derechos reservados.
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                Términos de Servicio
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                Cookies
              </a>
            </div>
          </div>
          
          {/* Emergency Notice */}
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-xs">
              🚨 Para emergencias vehiculares, llama al{" "}
              <span className="text-primary font-semibold">+52 614 128 9937</span> - 
              Disponible 24/7
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
