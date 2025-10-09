'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function TiendaLlantas() {
  const router = useRouter();
  const [filtros, setFiltros] = useState({
    marca: '',
    medida: '',
    precio: ''
  });
  const [carrito, setCarrito] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Datos simulados de llantas
  const llantas = [
    {
      id: 1,
      marca: 'Michelin',
      modelo: 'Energy XM2',
      medida: '185/65 R15',
      precio: 2450,
      imagen: 'https://via.placeholder.com/400x400/1a1a1a/ffffff?text=MICHELIN%0AEnergy+XM2%0A185/65+R15',
      stock: 8,
      descripcion: 'Llanta de alta calidad con excelente durabilidad'
    },
    {
      id: 2,
      marca: 'Bridgestone',
      modelo: 'Turanza T001',
      medida: '195/65 R15',
      precio: 2680,
      imagen: 'https://via.placeholder.com/400x400/2d2d2d/ffffff?text=BRIDGESTONE%0ATuranza+T001%0A195/65+R15',
      stock: 12,
      descripcion: 'Máximo confort y seguridad en carretera'
    },
    {
      id: 3,
      marca: 'Continental',
      modelo: 'PowerContact 2',
      medida: '205/55 R16',
      precio: 3150,
      imagen: 'https://via.placeholder.com/400x400/1f1f1f/ffff00?text=CONTINENTAL%0APowerContact+2%0A205/55+R16',
      stock: 6,
      descripcion: 'Llanta deportiva con excelente agarre'
    },
    {
      id: 4,
      marca: 'Pirelli',
      modelo: 'Cinturato P1',
      medida: '185/60 R15',
      precio: 2890,
      imagen: 'https://via.placeholder.com/400x400/000000/ffff00?text=PIRELLI%0ACinturato+P1%0A185/60+R15',
      stock: 10,
      descripcion: 'Ecológica y eficiente en combustible'
    },
    {
      id: 5,
      marca: 'Goodyear',
      modelo: 'EfficientGrip',
      medida: '195/55 R16',
      precio: 2750,
      imagen: 'https://via.placeholder.com/400x400/1a1a1a/ffff00?text=GOODYEAR%0AEfficientGrip%0A195/55+R16',
      stock: 15,
      descripcion: 'Menor resistencia al rodamiento'
    },
    {
      id: 6,
      marca: 'Yokohama',
      modelo: 'BluEarth AE-01',
      medida: '215/60 R16',
      precio: 3200,
      imagen: 'https://via.placeholder.com/400x400/2a2a2a/ffffff?text=YOKOHAMA%0ABluEarth+AE-01%0A215/60+R16',
      stock: 4,
      descripcion: 'Tecnología japonesa avanzada'
    }
  ];

  const agregarAlCarrito = (llanta) => {
    setCarrito(prev => [...prev, {...llanta, carritoId: Date.now()}]);
    setModalVisible(true);
    setTimeout(() => setModalVisible(false), 2000);
  };

  const removerDelCarrito = (carritoId) => {
    setCarrito(prev => prev.filter(item => item.carritoId !== carritoId));
  };

  const llantas_filtradas = llantas.filter(llanta => {
    return (
      (filtros.marca === '' || llanta.marca.toLowerCase().includes(filtros.marca.toLowerCase())) &&
      (filtros.medida === '' || llanta.medida.includes(filtros.medida)) &&
      (filtros.precio === '' || 
        (filtros.precio === 'bajo' && llanta.precio < 2600) ||
        (filtros.precio === 'medio' && llanta.precio >= 2600 && llanta.precio < 3000) ||
        (filtros.precio === 'alto' && llanta.precio >= 3000))
    );
  });

  const simularCompra = () => {
    if (carrito.length === 0) {
      alert('❌ Tu carrito está vacío. Agrega algunas llantas primero.');
      return;
    }
    
    const total = carrito.reduce((sum, llanta) => sum + llanta.precio, 0);
    const mensaje = `🎉 ¡Compra simulada exitosa!\n\n` +
                   `📦 Productos: ${carrito.length} llantas\n` +
                   `💰 Total: $${total.toLocaleString()}\n\n` +
                   `✅ En una aplicación real, esto:\n` +
                   `• Procesaría el pago\n` +
                   `• Coordinaría la entrega\n` +
                   `• Programaría la instalación\n` +
                   `• Enviaría confirmación por email\n\n` +
                   `📱 ¡Gracias por usar DriveSync!`;
    
    alert(mensaje);
    setCarrito([]); // Limpiar carrito después de "comprar"
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Banner de oferta */}
      <div className="bg-gradient-to-r from-primary to-primary-hover text-white p-3">
        <div className="max-w-6xl mx-auto text-center">
          <p className="font-bold">🔥 OFERTA ESPECIAL: Instalación GRATIS en compras mayores a $5,000 🔥</p>
          <p className="text-sm text-orange-100">Válido por tiempo limitado • Servicio a domicilio incluido</p>
        </div>
      </div>

      {/* Header */}
      <div className="bg-secondary text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🏪 DriveSync - Tienda de Llantas</h1>
            <p className="text-orange-200">Las mejores marcas al mejor precio</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative bg-white/10 rounded-lg px-3 py-2">
              <div className="text-sm">🛒 Carrito ({carrito.length})</div>
              {carrito.length > 0 && (
                <div className="text-xs text-orange-100">
                  Total: ${carrito.reduce((sum, llanta) => sum + llanta.precio, 0).toLocaleString()}
                </div>
              )}
              {carrito.length > 0 && (
                <button 
                  onClick={simularCompra}
                  className="mt-1 bg-primary px-3 py-1 rounded text-sm hover:bg-primary-hover transition-colors"
                >
                  💳 Comprar Todo
                </button>
              )}
            </div>
            <Link href="/main/servicios-express">
              <button className="bg-primary px-4 py-2 rounded hover:bg-primary-hover transition-colors">
                ← Regresar a Servicios
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Buscador por vehículo */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3 text-foreground flex items-center gap-2">
            🚗 Encuentra llantas para tu vehículo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select className="bg-input-bg border border-input-border rounded px-3 py-2 text-foreground">
              <option value="">Selecciona marca</option>
              <option value="toyota">Toyota</option>
              <option value="honda">Honda</option>
              <option value="nissan">Nissan</option>
              <option value="chevrolet">Chevrolet</option>
              <option value="volkswagen">Volkswagen</option>
              <option value="hyundai">Hyundai</option>
            </select>
            <select className="bg-input-bg border border-input-border rounded px-3 py-2 text-foreground">
              <option value="">Selecciona modelo</option>
              <option value="corolla">Corolla</option>
              <option value="civic">Civic</option>
              <option value="versa">Versa</option>
              <option value="aveo">Aveo</option>
            </select>
            <select className="bg-input-bg border border-input-border rounded px-3 py-2 text-foreground">
              <option value="">Año</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
            <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover transition-colors">
              🔍 Buscar Compatible
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-card-bg rounded-lg shadow p-4 mb-6 border border-input-border">
          <h3 className="font-semibold mb-3 text-foreground">🔍 Filtrar por:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Marca</label>
              <input 
                type="text"
                placeholder="Buscar marca..."
                className="w-full bg-input-bg border border-input-border rounded px-3 py-2 text-foreground placeholder-text-muted focus:border-primary focus:outline-none"
                value={filtros.marca}
                onChange={(e) => setFiltros({...filtros, marca: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Medida</label>
              <select 
                className="w-full bg-input-bg border border-input-border rounded px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                value={filtros.medida}
                onChange={(e) => setFiltros({...filtros, medida: e.target.value})}
              >
                <option value="">Todas las medidas</option>
                <option value="185/65 R15">185/65 R15</option>
                <option value="195/65 R15">195/65 R15</option>
                <option value="185/60 R15">185/60 R15</option>
                <option value="195/55 R16">195/55 R16</option>
                <option value="205/55 R16">205/55 R16</option>
                <option value="215/60 R16">215/60 R16</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Rango de Precio</label>
              <select 
                className="w-full bg-input-bg border border-input-border rounded px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                value={filtros.precio}
                onChange={(e) => setFiltros({...filtros, precio: e.target.value})}
              >
                <option value="">Todos los precios</option>
                <option value="bajo">Hasta $2,600</option>
                <option value="medio">$2,600 - $3,000</option>
                <option value="alto">Más de $3,000</option>
              </select>
            </div>
          </div>
        </div>

        {/* Carrito expandido cuando hay productos */}
        {carrito.length > 0 && (
          <div className="bg-card-bg rounded-lg shadow p-4 mb-6 border border-input-border">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
              🛒 Tu Carrito ({carrito.length} {carrito.length === 1 ? 'llanta' : 'llantas'})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {carrito.map((item) => (
                <div key={item.carritoId} className="flex items-center justify-between bg-input-bg p-2 rounded border border-input-border">
                  <div className="flex-1">
                    <span className="font-medium text-foreground">{item.marca} {item.modelo}</span>
                    <span className="text-sm text-text-muted ml-2">{item.medida}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">${item.precio.toLocaleString()}</span>
                    <button 
                      onClick={() => removerDelCarrito(item.carritoId)}
                      className="text-red-500 hover:text-red-400 text-sm p-1"
                      title="Remover del carrito"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-input-border pt-3 mt-3 flex justify-between items-center">
              <div className="text-lg font-bold text-foreground">
                Total: <span className="text-primary">${carrito.reduce((sum, llanta) => sum + llanta.precio, 0).toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCarrito([])}
                  className="px-4 py-2 border border-input-border rounded hover:bg-input-bg text-text-secondary transition-colors"
                >
                  🗑️ Vaciar
                </button>
                <button 
                  onClick={simularCompra}
                  className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
                >
                  💳 Finalizar Compra
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {llantas_filtradas.map(llanta => (
            <div key={llanta.id} className="bg-card-bg rounded-lg shadow hover:shadow-lg transition-shadow border border-input-border">
              <div className="h-48 bg-secondary rounded-t-lg overflow-hidden relative flex items-center justify-center">
                <img 
                  src={llanta.imagen} 
                  alt={`${llanta.marca} ${llanta.modelo}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full items-center justify-center text-white flex-col bg-secondary">
                  <div className="text-4xl mb-2">🛞</div>
                  <div className="text-center">
                    <div className="font-bold">{llanta.marca}</div>
                    <div className="text-sm">{llanta.modelo}</div>
                    <div className="text-xs">{llanta.medida}</div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/tienda-llantas/${llanta.id}`}>
                    <h3 className="font-bold text-lg text-foreground hover:text-primary transition-colors cursor-pointer">
                      {llanta.marca}
                    </h3>
                  </Link>
                  <span className={`px-2 py-1 rounded text-xs ${llanta.stock > 5 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                    Stock: {llanta.stock}
                  </span>
                </div>
                <Link href={`/tienda-llantas/${llanta.id}`}>
                  <p className="text-text-secondary mb-1 hover:text-primary transition-colors cursor-pointer">
                    {llanta.modelo}
                  </p>
                </Link>
                <p className="text-sm text-text-muted mb-2">{llanta.descripcion}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold bg-primary text-white px-2 py-1 rounded">
                    {llanta.medida}
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    ${llanta.precio.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => agregarAlCarrito(llanta)}
                    className="flex-1 bg-primary text-white py-2 rounded hover:bg-primary-hover transition-colors disabled:opacity-50"
                    disabled={llanta.stock === 0}
                  >
                    {llanta.stock === 0 ? 'Sin Stock' : '🛒 Agregar'}
                  </button>
                  <Link href={`/tienda-llantas/${llanta.id}`}>
                    <button className="px-4 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors">
                      Ver Detalles
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {llantas_filtradas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-muted text-lg">No se encontraron llantas con los filtros seleccionados</p>
          </div>
        )}

        {/* Sección de servicios relacionados */}
        {llantas_filtradas.length > 0 && (
          <div className="bg-card-bg rounded-lg shadow p-6 mt-8 border border-input-border">
            <h3 className="text-xl font-bold text-foreground mb-4">🔧 Servicios Adicionales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-input-bg border border-input-border rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">⚖️</div>
                <h4 className="font-semibold text-foreground mb-2">Balanceado</h4>
                <p className="text-text-muted text-sm mb-3">Servicio profesional de balanceado incluido</p>
                <div className="text-primary font-bold">$200 c/u</div>
              </div>
              <div className="bg-input-bg border border-input-border rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">📐</div>
                <h4 className="font-semibold text-foreground mb-2">Alineación</h4>
                <p className="text-text-muted text-sm mb-3">Alineación computarizada de precisión</p>
                <div className="text-primary font-bold">$450</div>
              </div>
              <div className="bg-input-bg border border-input-border rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🔄</div>
                <h4 className="font-semibold text-foreground mb-2">Rotación</h4>
                <p className="text-text-muted text-sm mb-3">Rotación para desgaste uniforme</p>
                <div className="text-primary font-bold">$150</div>
              </div>
            </div>
          </div>
        )}

        {/* Sección de garantías */}
        {llantas_filtradas.length > 0 && (
          <div className="bg-card-bg rounded-lg shadow p-6 mt-6 border border-input-border">
            <h3 className="text-xl font-bold text-foreground mb-4">🛡️ Protección Extendida</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-input-bg border border-input-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="text-warning">⭐</span>
                  Garantía Básica
                </h4>
                <ul className="space-y-1 text-sm text-text-secondary mb-4">
                  <li>• Defectos de fabricación</li>
                  <li>• Reemplazo por desgaste irregular</li>
                  <li>• Válida por 2 años</li>
                </ul>
                <div className="text-success font-bold">INCLUIDA</div>
              </div>
              <div className="bg-input-bg border border-input-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="text-primary">🏆</span>
                  Garantía Premium
                </h4>
                <ul className="space-y-1 text-sm text-text-secondary mb-4">
                  <li>• Todo lo de garantía básica</li>
                  <li>• Protección contra ponchadura</li>
                  <li>• Reemplazo por daño accidental</li>
                  <li>• Válida por 5 años</li>
                </ul>
                <div className="text-primary font-bold">+$500 por llanta</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {modalVisible && (
        <div className="fixed top-4 right-4 bg-primary text-white p-4 rounded-lg shadow-lg z-50">
          ✅ Producto agregado al carrito
        </div>
      )}

      {/* Footer informativo */}
      <div className="bg-secondary text-white p-6 mt-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-bold mb-2 text-primary">📦 Envío e Instalación</h4>
              <p className="text-sm text-orange-200">
                • Envío gratis en compras mayores a $5,000<br/>
                • Instalación profesional incluida<br/>
                • Servicio a domicilio disponible
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-2 text-primary">🛡️ Garantía</h4>
              <p className="text-sm text-orange-200">
                • Garantía de fábrica<br/>
                • Garantía contra defectos<br/>
                • Soporte técnico especializado
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-2 text-primary">💳 Formas de Pago</h4>
              <p className="text-sm text-orange-200">
                • Tarjetas de crédito y débito<br/>
                • Transferencias bancarias<br/>
                • Pagos en efectivo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}