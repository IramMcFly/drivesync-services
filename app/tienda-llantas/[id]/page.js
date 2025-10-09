'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function DetalleProducto() {
  const router = useRouter();
  const params = useParams();
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [tabActiva, setTabActiva] = useState('especificaciones');
  const [carrito, setCarrito] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [mesesFinanciamiento, setMesesFinanciamiento] = useState(12);

  // Función para calcular financiamiento
  const calcularPagoMensual = (meses) => {
    const total = producto.precio * cantidad;
    const interes = 0.15; // 15% anual
    const interesMensual = interes / 12;
    const pagoMensual = (total * interesMensual * Math.pow(1 + interesMensual, meses)) / 
                       (Math.pow(1 + interesMensual, meses) - 1);
    return pagoMensual;
  };

  // Datos completos de productos
  const productos = {
    1: {
      id: 1,
      marca: 'Michelin',
      modelo: 'Energy XM2',
      medida: '185/65 R15',
      precio: 2450,
      imagen: 'https://via.placeholder.com/600x600/1a1a1a/ffffff?text=MICHELIN%0AEnergy+XM2%0A185/65+R15',
      stock: 8,
      descripcion: 'Llanta de alta calidad con excelente durabilidad y eficiencia energética',
      especificaciones: {
        'Índice de Carga': '88',
        'Índice de Velocidad': 'H (210 km/h)',
        'Tipo de Construcción': 'Radial',
        'Temporada': 'Todas las estaciones',
        'Garantía': '5 años o 80,000 km',
        'País de Origen': 'Francia',
        'Peso': '8.5 kg',
        'Profundidad de Banda': '8.2 mm'
      },
      caracteristicas: [
        'Tecnología Energy Saver para menor consumo de combustible',
        'Compuesto de sílice para mejor agarre en mojado',
        'Diseño de banda optimizado para menor ruido',
        'Construcción reforzada para mayor durabilidad'
      ],
      compatibilidad: [
        'Nissan Versa 2012-2020',
        'Chevrolet Aveo 2011-2018',
        'Toyota Yaris 2006-2020',
        'Honda Fit 2009-2020',
        'Hyundai Accent 2012-2020'
      ],
      reviews: [
        {
          id: 1,
          usuario: 'Carlos M.',
          calificacion: 5,
          fecha: '15 Sep 2024',
          comentario: 'Excelente llanta, muy silenciosa y durable. La recomiendo 100%.'
        },
        {
          id: 2,
          usuario: 'María L.',
          calificacion: 4,
          fecha: '3 Oct 2024',
          comentario: 'Buen agarre en lluvia, precio competitivo. Muy satisfecha con la compra.'
        },
        {
          id: 3,
          usuario: 'Roberto S.',
          calificacion: 5,
          fecha: '28 Sep 2024',
          comentario: 'Llevo 6 meses usándolas, se ven como nuevas. Calidad Michelin garantizada.'
        }
      ]
    },
    2: {
      id: 2,
      marca: 'Bridgestone',
      modelo: 'Turanza T001',
      medida: '195/65 R15',
      precio: 2680,
      imagen: 'https://via.placeholder.com/600x600/2d2d2d/ffffff?text=BRIDGESTONE%0ATuranza+T001%0A195/65+R15',
      stock: 12,
      descripcion: 'Máximo confort y seguridad en carretera con tecnología japonesa avanzada',
      especificaciones: {
        'Índice de Carga': '91',
        'Índice de Velocidad': 'V (240 km/h)',
        'Tipo de Construcción': 'Radial',
        'Temporada': 'Verano',
        'Garantía': '4 años o 60,000 km',
        'País de Origen': 'Japón',
        'Peso': '9.2 kg',
        'Profundidad de Banda': '8.5 mm'
      },
      caracteristicas: [
        'Tecnología NanoPro-Tech para mejor rendimiento',
        'Diseño asimétrico para estabilidad superior',
        'Compuesto especial para menor desgaste',
        'Optimizada para vehículos de lujo'
      ],
      compatibilidad: [
        'Honda Civic 2012-2021',
        'Toyota Corolla 2014-2021',
        'Mazda 3 2010-2018',
        'Volkswagen Jetta 2011-2019'
      ],
      reviews: [
        {
          id: 1,
          usuario: 'Ana G.',
          calificacion: 4,
          fecha: '20 Sep 2024',
          comentario: 'Muy cómodas para viajes largos, excelente calidad de rodamiento.'
        },
        {
          id: 2,
          usuario: 'Luis R.',
          calificacion: 5,
          fecha: '12 Oct 2024',
          comentario: 'Perfectas para mi Civic, se sienten muy estables en curvas.'
        }
      ]
    }
  };

  useEffect(() => {
    const id = params.id;
    if (productos[id]) {
      setProducto(productos[id]);
    }
  }, [params.id]);

  const agregarAlCarrito = () => {
    const nuevoItem = {
      ...producto,
      cantidad: cantidad,
      carritoId: Date.now()
    };
    setCarrito(prev => [...prev, nuevoItem]);
    setModalVisible(true);
    setTimeout(() => setModalVisible(false), 2000);
  };

  const calcularPromedioReviews = () => {
    if (!producto?.reviews || producto.reviews.length === 0) return 0;
    const total = producto.reviews.reduce((sum, review) => sum + review.calificacion, 0);
    return (total / producto.reviews.length).toFixed(1);
  };

  const renderEstrellas = (calificacion) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < calificacion ? 'text-yellow-400' : 'text-gray-600'}>
        ⭐
      </span>
    ));
  };

  if (!producto) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Cargando producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header con navegación */}
      <div className="bg-secondary text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/tienda-llantas">
            <button className="bg-primary px-4 py-2 rounded hover:bg-primary-hover transition-colors">
              ← Volver a la Tienda
            </button>
          </Link>
          <div className="text-sm text-orange-200">
            Tienda → Llantas → {producto.marca} {producto.modelo}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Sección principal del producto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Imagen del producto */}
          <div className="bg-card-bg rounded-lg border border-input-border p-6">
            <div className="aspect-square bg-secondary rounded-lg overflow-hidden relative flex items-center justify-center mb-4">
              <img 
                src={producto.imagen}
                alt={`${producto.marca} ${producto.modelo}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full items-center justify-center text-white flex-col bg-secondary">
                <div className="text-8xl mb-4">🛞</div>
                <div className="text-center">
                  <div className="font-bold text-2xl">{producto.marca}</div>
                  <div className="text-lg">{producto.modelo}</div>
                  <div className="text-sm">{producto.medida}</div>
                </div>
              </div>
            </div>
            
            {/* Galería en miniatura (simulada) */}
            <div className="grid grid-cols-4 gap-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="aspect-square bg-input-bg rounded border border-input-border flex items-center justify-center text-text-muted text-xs">
                  Vista {i}
                </div>
              ))}
            </div>
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {producto.marca} {producto.modelo}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xl font-bold bg-primary text-white px-3 py-1 rounded">
                  {producto.medida}
                </span>
                <div className="flex items-center gap-2">
                  {renderEstrellas(Math.floor(calcularPromedioReviews()))}
                  <span className="text-text-secondary">
                    {calcularPromedioReviews()} ({producto.reviews.length} reseñas)
                  </span>
                </div>
              </div>
              <p className="text-text-secondary text-lg">{producto.descripcion}</p>
            </div>

            {/* Precio y stock */}
            <div className="bg-input-bg border border-input-border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-3xl font-bold text-primary">
                  ${producto.precio.toLocaleString()}
                </div>
                <div className={`px-3 py-1 rounded text-sm ${
                  producto.stock > 5 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                }`}>
                  Stock: {producto.stock} disponibles
                </div>
              </div>

              {/* Cantidad y agregar al carrito */}
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <label className="text-text-secondary">Cantidad:</label>
                  <select 
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value))}
                    className="bg-input-bg border border-input-border rounded px-3 py-2 text-foreground"
                  >
                    {Array.from({length: Math.min(producto.stock, 10)}, (_, i) => (
                      <option key={i+1} value={i+1}>{i+1}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                onClick={agregarAlCarrito}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-hover transition-colors font-medium text-lg"
                disabled={producto.stock === 0}
              >
                {producto.stock === 0 ? 'Sin Stock' : '🛒 Agregar al Carrito'}
              </button>

              {/* Beneficios */}
              <div className="mt-4 space-y-2 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <span className="text-success">✓</span>
                  Envío gratis en compras mayores a $5,000
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-success">✓</span>
                  Instalación profesional incluida
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-success">✓</span>
                  Garantía del fabricante
                </div>
              </div>
            </div>

            {/* Calculadora de financiamiento */}
            <div className="bg-input-bg border border-input-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                💳 Financiamiento disponible
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-text-secondary text-sm mb-1">Plazo:</label>
                  <select 
                    value={mesesFinanciamiento}
                    onChange={(e) => setMesesFinanciamiento(parseInt(e.target.value))}
                    className="w-full bg-input-bg border border-input-border rounded px-3 py-2 text-foreground"
                  >
                    <option value={6}>6 meses</option>
                    <option value={12}>12 meses</option>
                    <option value={18}>18 meses</option>
                    <option value={24}>24 meses</option>
                  </select>
                </div>
                <div className="bg-card-bg border border-input-border rounded p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Pago mensual:</span>
                    <span className="text-primary font-bold text-lg">
                      ${calcularPagoMensual(mesesFinanciamiento).toLocaleString('es-MX', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    *Tasa de interés: 15% anual
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de información */}
        <div className="bg-card-bg border border-input-border rounded-lg">
          {/* Navegación de tabs */}
          <div className="border-b border-input-border">
            <div className="flex">
              {[
                { id: 'especificaciones', label: 'Especificaciones' },
                { id: 'caracteristicas', label: 'Características' },
                { id: 'compatibilidad', label: 'Compatibilidad' },
                { id: 'reviews', label: `Reseñas (${producto.reviews.length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setTabActiva(tab.id)}
                  className={`px-6 py-4 font-medium transition-colors ${
                    tabActiva === tab.id 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-text-secondary hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contenido de tabs */}
          <div className="p-6">
            {tabActiva === 'especificaciones' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(producto.especificaciones).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-input-border">
                    <span className="text-text-secondary">{key}:</span>
                    <span className="text-foreground font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {tabActiva === 'caracteristicas' && (
              <ul className="space-y-3">
                {producto.caracteristicas.map((caracteristica, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-text-secondary">{caracteristica}</span>
                  </li>
                ))}
              </ul>
            )}

            {tabActiva === 'compatibilidad' && (
              <div>
                <h4 className="text-foreground font-semibold mb-4">Vehículos compatibles:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {producto.compatibilidad.map((vehiculo, index) => (
                    <div key={index} className="bg-input-bg border border-input-border rounded p-3">
                      <span className="text-text-secondary">{vehiculo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tabActiva === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl font-bold text-primary">{calcularPromedioReviews()}</div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      {renderEstrellas(Math.floor(calcularPromedioReviews()))}
                    </div>
                    <div className="text-text-secondary text-sm">
                      Basado en {producto.reviews.length} reseñas
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {producto.reviews.map(review => (
                    <div key={review.id} className="bg-input-bg border border-input-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-foreground">{review.usuario}</div>
                          <div className="flex items-center gap-2">
                            {renderEstrellas(review.calificacion)}
                            <span className="text-text-muted text-sm">{review.fecha}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-text-secondary">{review.comentario}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {modalVisible && (
        <div className="fixed top-4 right-4 bg-primary text-white p-4 rounded-lg shadow-lg z-50">
          ✅ {cantidad} {cantidad === 1 ? 'llanta agregada' : 'llantas agregadas'} al carrito
        </div>
      )}
    </div>
  );
}