// Configuración global para manejo de autenticación
export const AUTH_CONFIG = {
  // Tiempo de espera antes de redirigir al login (en ms)
  REDIRECT_DELAY: 15000, // 15 segundos
  
  // Tiempo de espera para verificar autenticación en perfil (en ms)
  PROFILE_AUTH_DELAY: 3000, // 3 segundos
  
  // Rutas que no requieren redirección automática
  NO_REDIRECT_PATHS: [
    '/userProfile',
    '/admin',
    '/taller',
    '/asistente'
  ],
  
  // Configuración de SessionProvider
  SESSION_CONFIG: {
    refetchInterval: 15 * 60, // 15 minutos
    refetchOnWindowFocus: false,
    basePath: "/api/auth"
  }
};

// Helper function para verificar si una ruta no debe redirigir automáticamente
export const shouldSkipAutoRedirect = (pathname) => {
  return AUTH_CONFIG.NO_REDIRECT_PATHS.some(path => 
    pathname.includes(path)
  );
};

// Helper function para logging de autenticación
export const logAuthStatus = (component, status, session) => {
  console.log(`🔍 ${component} - Status de sesión:`, { 
    status, 
    userType: session?.user?.userType,
    userId: session?.user?.id?.slice(0, 8) + '...',
    timestamp: new Date().toISOString()
  });
};