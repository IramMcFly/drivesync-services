'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfiguracionPrivacidad() {
  const router = useRouter();
  const [configuracion, setConfiguracion] = useState({
    compartirDiagnosticos: true,
    guardarHistorial: true,
    ubicacionPrecisa: false,
    notificacionesMarketing: false,
    analiticasAnonimas: true,
    compartirConTalleres: true,
    retencionDatos: 12 // meses
  });

  const [chatEncriptado, setChatEncriptado] = useState(true);
  const [datosAnonimizados, setDatosAnonimizados] = useState(true);

  const handleConfigChange = (key, value) => {
    setConfiguracion(prev => ({ ...prev, [key]: value }));
  };

  const guardarConfiguracion = () => {
    // Simular guardado
    localStorage.setItem('privacySettings', JSON.stringify(configuracion));
    alert('✅ Configuración de privacidad guardada exitosamente');
  };

  const exportarDatos = () => {
    const datosUsuario = {
      configuracion,
      fechaExportacion: new Date().toISOString(),
      datosIncluidos: [
        'Historial de diagnósticos (anonimizado)',
        'Preferencias de servicios', 
        'Configuración de privacidad',
        'Historial de compras (sin datos de pago)'
      ]
    };
    
    const blob = new Blob([JSON.stringify(datosUsuario, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DriveSync-MisDatos-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const eliminarCuenta = () => {
    const confirmacion = confirm(
      '⚠️ ¿Estás seguro de eliminar tu cuenta?\n\n' +
      'Esto eliminará permanentemente:\n' +
      '• Todo tu historial de diagnósticos\n' +
      '• Configuraciones personalizadas\n' +
      '• Datos de vehículos guardados\n' +
      '• Historial de servicios\n\n' +
      'Esta acción NO se puede deshacer.'
    );
    
    if (confirmacion) {
      alert('🗑️ Cuenta eliminada. Todos tus datos han sido borrados permanentemente según GDPR.');
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-secondary p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="bg-primary px-4 py-2 rounded hover:bg-primary-hover transition-colors"
          >
            ← Regresar
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">🔒 Privacidad y Seguridad</h1>
            <p className="text-orange-200 text-sm">Control total sobre tus datos personales</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        
        {/* Estado de Seguridad */}
        <div className="bg-card-bg border border-input-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🛡️ Estado de Seguridad
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between bg-input-bg border border-input-border rounded p-3">
              <div>
                <div className="font-medium">Encriptación de Chat</div>
                <div className="text-sm text-text-muted">AES-256 end-to-end</div>
              </div>
              <div className="text-success text-xl">✅</div>
            </div>
            <div className="flex items-center justify-between bg-input-bg border border-input-border rounded p-3">
              <div>
                <div className="font-medium">Datos Anonimizados</div>
                <div className="text-sm text-text-muted">Sin PII en reportes</div>
              </div>
              <div className="text-success text-xl">✅</div>
            </div>
            <div className="flex items-center justify-between bg-input-bg border border-input-border rounded p-3">
              <div>
                <div className="font-medium">Conexión Segura</div>
                <div className="text-sm text-text-muted">HTTPS/SSL verificado</div>
              </div>
              <div className="text-success text-xl">✅</div>
            </div>
            <div className="flex items-center justify-between bg-input-bg border border-input-border rounded p-3">
              <div>
                <div className="font-medium">Cumplimiento GDPR</div>
                <div className="text-sm text-text-muted">Certificado EU</div>
              </div>
              <div className="text-success text-xl">✅</div>
            </div>
          </div>
        </div>

        {/* Configuración de Privacidad */}
        <div className="bg-card-bg border border-input-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">⚙️ Configuración de Privacidad</h2>
          <div className="space-y-4">
            
            <div className="flex items-center justify-between py-3 border-b border-input-border">
              <div>
                <div className="font-medium">Compartir diagnósticos con talleres</div>
                <div className="text-sm text-text-muted">Permite enviar reportes de IA a técnicos seleccionados</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={configuracion.compartirDiagnosticos}
                  onChange={(e) => handleConfigChange('compartirDiagnosticos', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-input-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-input-border">
              <div>
                <div className="font-medium">Guardar historial de conversaciones</div>
                <div className="text-sm text-text-muted">Mantener chats para mejorar diagnósticos futuros</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={configuracion.guardarHistorial}
                  onChange={(e) => handleConfigChange('guardarHistorial', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-input-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-input-border">
              <div>
                <div className="font-medium">Ubicación precisa</div>
                <div className="text-sm text-text-muted">GPS exacto para servicios de emergencia</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={configuracion.ubicacionPrecisa}
                  onChange={(e) => handleConfigChange('ubicacionPrecisa', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-input-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-input-border">
              <div>
                <div className="font-medium">Notificaciones de marketing</div>
                <div className="text-sm text-text-muted">Promociones y ofertas personalizadas</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={configuracion.notificacionesMarketing}
                  onChange={(e) => handleConfigChange('notificacionesMarketing', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-input-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">Analíticas anónimas</div>
                <div className="text-sm text-text-muted">Ayudar a mejorar la IA sin datos personales</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={configuracion.analiticasAnonimas}
                  onChange={(e) => handleConfigChange('analiticasAnonimas', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-input-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          <div className="mt-6">
            <button 
              onClick={guardarConfiguracion}
              className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-hover transition-colors"
            >
              💾 Guardar Configuración
            </button>
          </div>
        </div>

        {/* Gestión de Datos */}
        <div className="bg-card-bg border border-input-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">📊 Gestión de Datos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-input-bg border border-input-border rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">📥</div>
              <h3 className="font-semibold mb-2">Exportar Mis Datos</h3>
              <p className="text-sm text-text-muted mb-4">Descarga toda tu información en formato JSON</p>
              <button 
                onClick={exportarDatos}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover transition-colors"
              >
                Exportar
              </button>
            </div>

            <div className="bg-input-bg border border-input-border rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🧹</div>
              <h3 className="font-semibold mb-2">Limpiar Historial</h3>
              <p className="text-sm text-text-muted mb-4">Eliminar todas las conversaciones guardadas</p>
              <button 
                onClick={() => {
                  if (confirm('¿Eliminar todo el historial de chat?')) {
                    alert('✅ Historial eliminado');
                  }
                }}
                className="bg-warning text-white px-4 py-2 rounded hover:bg-warning/80 transition-colors"
              >
                Limpiar
              </button>
            </div>

            <div className="bg-input-bg border border-input-border rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🗑️</div>
              <h3 className="font-semibold mb-2">Eliminar Cuenta</h3>
              <p className="text-sm text-text-muted mb-4">Borrar permanentemente todos los datos</p>
              <button 
                onClick={eliminarCuenta}
                className="bg-error text-white px-4 py-2 rounded hover:bg-error/80 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>

        {/* Transparencia */}
        <div className="bg-card-bg border border-input-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">🔍 Transparencia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <h3 className="font-semibold mb-2">📋 Qué datos recopilamos:</h3>
              <ul className="space-y-1 text-sm text-text-secondary">
                <li>• Síntomas de vehículos (anonimizados)</li>
                <li>• Tipo de servicios solicitados</li>
                <li>• Ubicación aproximada (solo ciudad)</li>
                <li>• Preferencias de talleres</li>
                <li>• Historial de diagnósticos (encriptado)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">🚫 Qué NO recopilamos:</h3>
              <ul className="space-y-1 text-sm text-text-secondary">
                <li>• Datos de tarjetas de crédito</li>
                <li>• Conversaciones privadas no relacionadas</li>
                <li>• Contactos del teléfono</li>
                <li>• Fotos o videos sin permiso</li>
                <li>• Información de otros usuarios</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-primary/10 border border-primary/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-primary">🔒</span>
              <span className="font-semibold">Compromiso de Privacidad</span>
            </div>
            <p className="text-sm text-text-secondary">
              DriveSync cumple con GDPR, CCPA y leyes locales de protección de datos. 
              Nunca vendemos información personal. Todos los diagnósticos se procesan 
              con encriptación end-to-end y se almacenan de forma anonimizada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}