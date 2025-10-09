"use client";
import { motion } from 'framer-motion';
import { FaShieldAlt, FaLock, FaUserShield, FaDatabase, FaEye, FaHandshake, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import Link from 'next/link';

export default function TerminosCondiciones() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <motion.div 
        className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/register/UserRegister" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
                <FaArrowLeft className="text-lg" />
                <span>Volver al registro</span>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <FaShieldAlt className="text-primary text-2xl" />
              <h1 className="text-2xl font-bold">DriveSync</h1>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto"
        >
          {/* Title Section */}
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <FaShieldAlt className="text-primary text-4xl" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Términos y Condiciones
              </h1>
            </div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Tu privacidad y seguridad son nuestra prioridad. Conoce cómo protegemos tus datos y cuáles son nuestros compromisos contigo.
            </p>
          </motion.div>

          {/* Security Promise Section */}
          <motion.div variants={fadeInUp} className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl p-8 mb-12 border border-primary/20">
            <div className="flex items-center space-x-3 mb-6">
              <FaLock className="text-primary text-3xl" />
              <h2 className="text-2xl font-bold text-primary">Compromiso de Seguridad</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p className="text-lg leading-relaxed">
                <strong className="text-white">En DriveSync, tus datos están completamente seguros con nosotros.</strong> Utilizamos las más avanzadas tecnologías de encriptación y protocolos de seguridad para garantizar que tu información personal, ubicación y datos de contacto estén protegidos en todo momento.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="flex items-start space-x-3">
                  <FaUserShield className="text-primary text-xl mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Protección de Identidad</h4>
                    <p className="text-sm">Tu información personal nunca será compartida con terceros sin tu consentimiento explícito.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FaDatabase className="text-primary text-xl mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Encriptación de Datos</h4>
                    <p className="text-sm">Todos tus datos son encriptados con tecnología de grado militar tanto en tránsito como en reposo.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Terms Sections */}
          <motion.div variants={fadeInUp} className="space-y-8">
            
            {/* Aceptación de Términos */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-primary mb-4 flex items-center space-x-2">
                <FaHandshake className="text-lg" />
                <span>1. Aceptación de Términos</span>
              </h3>
              <div className="text-gray-300 space-y-3">
                <p>Al registrarte en DriveSync, aceptas estos términos y condiciones en su totalidad. Estos términos constituyen un acuerdo legal entre tú y DriveSync.</p>
                <p>Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestros servicios.</p>
              </div>
            </div>

            {/* Recopilación de Datos */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-primary mb-4 flex items-center space-x-2">
                <FaDatabase className="text-lg" />
                <span>2. Recopilación y Uso de Datos</span>
              </h3>
              <div className="text-gray-300 space-y-3">
                <p><strong className="text-white">Datos que recopilamos:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Información de contacto (nombre, email, teléfono)</li>
                  <li>Ubicación geográfica (solo cuando uses nuestros servicios)</li>
                  <li>Información del vehículo (para brindar mejor servicio)</li>
                  <li>Historial de servicios solicitados</li>
                </ul>
                <p><strong className="text-white">Cómo usamos tus datos:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Para conectarte con asistentes y talleres cercanos</li>
                  <li>Para mejorar la calidad de nuestros servicios</li>
                  <li>Para enviarte notificaciones importantes sobre tu servicio</li>
                  <li>Para soporte al cliente y resolución de problemas</li>
                </ul>
              </div>
            </div>

            {/* Privacidad y Seguridad */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-primary mb-4 flex items-center space-x-2">
                <FaLock className="text-lg" />
                <span>3. Privacidad y Seguridad</span>
              </h3>
              <div className="text-gray-300 space-y-3">
                <p><strong className="text-white">Nuestro compromiso contigo:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Nunca venderemos tu información personal a terceros</li>
                  <li>Utilizamos encriptación SSL/TLS para todas las comunicaciones</li>
                  <li>Acceso restringido a tus datos solo para personal autorizado</li>
                  <li>Auditorías regulares de seguridad para proteger tu información</li>
                  <li>Cumplimiento con las leyes de protección de datos vigentes</li>
                </ul>
                <p className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                  <FaShieldAlt className="inline mr-2" />
                  <strong>Garantía de Seguridad:</strong> Si detectamos cualquier brecha de seguridad que pueda afectar tus datos, te notificaremos inmediatamente y tomaremos todas las medidas necesarias para proteger tu información.
                </p>
              </div>
            </div>

            {/* Derechos del Usuario */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-primary mb-4 flex items-center space-x-2">
                <FaUserShield className="text-lg" />
                <span>4. Tus Derechos</span>
              </h3>
              <div className="text-gray-300 space-y-3">
                <p>Como usuario de DriveSync, tienes derecho a:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Acceder a toda la información que tenemos sobre ti</li>
                  <li>Solicitar la corrección de datos incorrectos</li>
                  <li>Solicitar la eliminación de tu cuenta y datos</li>
                  <li>Retirar tu consentimiento en cualquier momento</li>
                  <li>Recibir una copia de tus datos en formato legible</li>
                </ul>
              </div>
            </div>

            {/* Super Emergencia */}
            <div className="bg-red-900/20 rounded-xl p-6 border border-red-500/30">
              <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center space-x-2">
                <FaShieldAlt className="text-lg" />
                <span>6. Botón de Super Emergencia</span>
              </h3>
              <div className="text-gray-300 space-y-3">
                <div className="bg-red-500/10 p-4 rounded-lg border-l-4 border-red-500">
                  <p className="text-red-200 font-semibold flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    IMPORTANTE: Uso exclusivo para emergencias reales
                  </p>
                </div>
                
                <p><strong className="text-white">¿Qué es el Super Emergencia?</strong></p>
                <p>El botón de Super Emergencia es una funcionalidad crítica que permite alertar automáticamente a autoridades de seguridad y servicios de emergencia en situaciones de peligro real.</p>
                
                <p><strong className="text-white">¿Cuándo activarlo?</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Accidentes vehiculares graves con lesiones</li>
                  <li>Situaciones de inseguridad o violencia</li>
                  <li>Emergencias médicas durante el servicio</li>
                  <li>Cualquier situación que ponga en riesgo tu integridad física</li>
                </ul>
                
                <p><strong className="text-white">¿Qué sucede al activarlo?</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>📍 Se envía tu ubicación exacta a las autoridades</li>
                  <li>📹 Se activa grabación automática de video y audio</li>
                  <li>🚨 Se notifica inmediatamente a servicios de emergencia</li>
                  <li>📞 Se contacta automáticamente a números de emergencia registrados</li>
                  <li>🔔 Se alerta a asistentes y talleres cercanos</li>
                  <li>👮 Se envía información al centro de monitoreo de seguridad</li>
                </ul>
                
                <p><strong className="text-white">Datos recopilados durante emergencia:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Ubicación GPS en tiempo real con máxima precisión</li>
                  <li>Video y audio del entorno durante 5 minutos</li>
                  <li>Información del usuario y vehículo</li>
                  <li>Historial del servicio actual</li>
                  <li>Datos del asistente asignado</li>
                </ul>
                
                <div className="bg-yellow-500/10 p-4 rounded-lg border-l-4 border-yellow-500 mt-4">
                  <p className="text-yellow-200 font-semibold">
                    ⚠️ USO RESPONSABLE OBLIGATORIO
                  </p>
                  <p className="text-gray-300 mt-2">
                    El uso indebido del botón de Super Emergencia (falsas alarmas, bromas, etc.) puede resultar en:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-gray-300">
                    <li>Suspensión inmediata de la cuenta</li>
                    <li>Responsabilidad por costos de respuesta de emergencia</li>
                    <li>Posibles consecuencias legales</li>
                    <li>Reporte a autoridades competentes</li>
                  </ul>
                </div>
                
                <p><strong className="text-white">Privacidad durante emergencias:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Los datos recopilados se comparten únicamente con autoridades de seguridad</li>
                  <li>Las grabaciones se mantienen seguras y encriptadas</li>
                  <li>Solo personal autorizado tiene acceso a la información de emergencia</li>
                  <li>Los datos se conservan según requerimientos legales de investigación</li>
                </ul>
                
                <div className="bg-green-500/10 p-4 rounded-lg border-l-4 border-green-500 mt-4">
                  <p className="text-green-200 font-semibold">
                    ✅ TU SEGURIDAD ES NUESTRA PRIORIDAD
                  </p>
                  <p className="text-gray-300 mt-2">
                    El botón de Super Emergencia está diseñado para protegerte. Su activación desencadena un protocolo completo de respuesta que puede salvar vidas.
                  </p>
                </div>
              </div>
            </div>

            {/* Uso Responsable de la Plataforma */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-primary mb-4 flex items-center space-x-2">
                <FaEye className="text-lg" />
                <span>7. Uso Responsable de la Plataforma</span>
              </h3>
              <div className="text-gray-300 space-y-3">
                <p>Al usar DriveSync, te comprometes a:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Proporcionar información veraz y actualizada</li>
                  <li>Usar la plataforma solo para fines legítimos</li>
                  <li>Respetar a otros usuarios, asistentes y talleres</li>
                  <li>No interferir con el funcionamiento de la plataforma</li>
                  <li>Reportar cualquier problema o comportamiento inapropiado</li>
                </ul>
              </div>
            </div>

            {/* Contacto */}
            <div className="bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl p-6 border border-primary/30">
              <h3 className="text-xl font-semibold text-white mb-4">¿Tienes preguntas sobre estos términos?</h3>
              <p className="text-gray-300 mb-4">
                Si tienes alguna pregunta sobre estos términos y condiciones, el uso del botón de Super Emergencia, o sobre cómo manejamos tus datos, no dudes en contactarnos.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="mailto:soporte@drivesync.com" className="text-primary hover:text-primary/80 transition-colors">
                  soporte@drivesync.com
                </a>
                <span className="text-gray-500">|</span>
                <span className="text-gray-300">Teléfono: (555) 123-4567</span>
                <span className="text-gray-500">|</span>
                <span className="text-red-400">Emergencias: 911</span>
              </div>
            </div>

          </motion.div>

          {/* Footer */}
          <motion.div variants={fadeInUp} className="text-center mt-12 pt-8 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              Última actualización: 9 de octubre de 2025 - Incluye nueva sección de Super Emergencia
            </p>
            <p className="text-gray-400 text-sm mt-2">
              © 2025 DriveSync. Todos los derechos reservados.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}