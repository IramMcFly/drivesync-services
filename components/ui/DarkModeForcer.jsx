"use client";

import { useEffect } from 'react';

export default function DarkModeForcer() {
  useEffect(() => {
    // Forzar modo oscuro al cargar la página
    const forceDarkMode = () => {
      // Agregar clase dark al HTML
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      
      // Forzar background en body
      document.body.style.backgroundColor = '#0f172a';
      document.body.style.color = '#f1f5f9';
      
      // Forzar estilos en elementos problemáticos
      const forceStyles = () => {
        // Buscar elementos con bg-gray-800 y forzar modo oscuro
        const whiteElements = document.querySelectorAll('[class*="bg-gray-800"], .bg-gray-800');
        whiteElements.forEach(el => {
          el.style.setProperty('background-color', '#1e293b', 'important');
          el.style.setProperty('color', '#f1f5f9', 'important');
        });
        
        // Buscar elementos con text-gray-900 y forzar color claro
        const darkTextElements = document.querySelectorAll('[class*="text-gray-900"], .text-gray-900, [class*="text-black"], .text-black');
        darkTextElements.forEach(el => {
          el.style.setProperty('color', '#f1f5f9', 'important');
        });
        
        // Buscar elementos con border-gray-200 y forzar border oscuro
        const lightBorderElements = document.querySelectorAll('[class*="border-gray-200"], .border-gray-200');
        lightBorderElements.forEach(el => {
          el.style.setProperty('border-color', '#374151', 'important');
        });
      };
      
      // Ejecutar inmediatamente
      forceStyles();
      
      // Observar cambios en el DOM y aplicar estilos forzados
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (!document.documentElement.classList.contains('dark')) {
              document.documentElement.classList.add('dark');
            }
          }
          
          // Si se agregan nuevos nodos, aplicar estilos forzados
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1) { // Es un elemento
                const element = node;
                if (element.classList) {
                  if (element.classList.contains('bg-gray-800') || element.className.includes('bg-gray-800')) {
                    element.style.setProperty('background-color', '#1e293b', 'important');
                    element.style.setProperty('color', '#f1f5f9', 'important');
                  }
                  if (element.classList.contains('text-gray-900') || element.className.includes('text-gray-900')) {
                    element.style.setProperty('color', '#f1f5f9', 'important');
                  }
                }
                
                // También buscar en hijos del nuevo elemento
                setTimeout(forceStyles, 0);
              }
            });
          }
        });
      });
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
        childList: true,
        subtree: true
      });
      
      // Aplicar estilos cada segundo como backup
      const interval = setInterval(forceStyles, 1000);
      
      return () => {
        observer.disconnect();
        clearInterval(interval);
      };
    };

    const cleanup = forceDarkMode();
    
    // También ejecutar cuando el documento esté completamente cargado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', forceDarkMode);
    }
    
    // Limpiar event listener
    return () => {
      document.removeEventListener('DOMContentLoaded', forceDarkMode);
      if (cleanup) cleanup();
    };
  }, []);

  return null; // Este componente no renderiza nada
}
