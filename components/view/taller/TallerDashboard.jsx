"use client";
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Modal } from "../../ui";
import { useModal } from "../../../hooks/useModal";
import { 
  FaTools, FaCog, FaUsers, FaClipboardList, FaChartBar, 
  FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaUserPlus,
  FaTimes, FaCar, FaBars
} from 'react-icons/fa';

export default function TallerDashboard() {
  const { modalState, showError, hideModal } = useModal();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [asistentes, setAsistentes] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Verificar autenticación y tipo de usuario
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    if (session.user?.userType !== 'taller') {
      router.push('/main/servicios-express');
      return;
    }
    
    // Cargar datos del taller solo al inicio
    loadDashboardData();
  }, [session, status, router]); // Eliminamos dependencias innecesarias

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar asistentes del taller
      const asistentesRes = await fetch('/api/asistentes');
      if (asistentesRes.ok) {
        const asistentesData = await asistentesRes.json();
        // Filtrar por taller usando la referencia poblada
        setAsistentes(asistentesData.filter(a => a.taller?._id === session.user.id || a.taller === session.user.id));
      }
      
      // Cargar solicitudes de servicio
      const solicitudesRes = await fetch('/api/servicerequests');
      if (solicitudesRes.ok) {
        const solicitudesData = await solicitudesRes.json();
        setSolicitudes(solicitudesData.filter(s => s.tallerId === session.user.id));
      }
      
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cerrar el menú móvil cuando cambie el tab
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-300 hover:text-white p-2"
            >
              <FaBars size={20} />
            </button>
            <FaTools className="text-primary text-2xl" />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-100">
                Dashboard - {session.user.nombre}
              </h1>
              <p className="text-sm text-gray-400">{session.user.email}</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold text-gray-100">Dashboard</h1>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 
                     text-white rounded-lg transition-colors text-sm"
          >
            <FaSignOutAlt size={16} />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <div className="flex relative min-h-screen">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <nav className={`${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative lg:flex w-64 bg-gray-800 h-screen lg:min-h-screen z-50 transition-transform duration-300 ease-in-out top-0 left-0 overflow-y-auto`}>
          <div className="flex flex-col h-full w-full">
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <FaTools className="text-primary text-xl" />
                <span className="text-white font-semibold">Dashboard</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="flex-1 p-4 space-y-2">
            <NavItem
              icon={<FaChartBar />}
              label="Resumen"
              active={activeTab === 'overview'}
              onClick={() => {
                setActiveTab('overview');
                setMobileMenuOpen(false);
              }}
            />
            <NavItem
              icon={<FaUsers />}
              label="Asistentes"
              active={activeTab === 'asistentes'}
              onClick={() => {
                setActiveTab('asistentes');
                setMobileMenuOpen(false);
              }}
            />
            <NavItem
              icon={<FaClipboardList />}
              label="Solicitudes"
              active={activeTab === 'solicitudes'}
              onClick={() => {
                setActiveTab('solicitudes');
                setMobileMenuOpen(false);
              }}
            />
            <NavItem
              icon={<FaCog />}
              label="Configuración"
              active={activeTab === 'settings'}
              onClick={() => {
                setActiveTab('settings');
                setMobileMenuOpen(false);
              }}
            />
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-6 min-h-screen lg:min-h-0">
          {activeTab === 'overview' && (
            <OverviewTab 
              asistentes={asistentes} 
              solicitudes={solicitudes} 
              taller={session.user}
            />
          )}
          {activeTab === 'asistentes' && (
            <AsistentesTab 
              asistentes={asistentes} 
              tallerId={session.user.id}
              onUpdate={loadDashboardData}
            />
          )}
          {activeTab === 'solicitudes' && (
            <SolicitudesTab 
              solicitudes={solicitudes}
              onUpdate={loadDashboardData}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsTab taller={session.user} />
          )}
        </main>
      </div>
    </div>
  );
}

// Componente para items del nav
function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
        active 
          ? 'bg-primary text-white' 
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// Tab de Resumen
function OverviewTab({ asistentes, solicitudes, taller }) {
  const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
  const solicitudesEnProceso = solicitudes.filter(s => s.estado === 'en_proceso').length;
  const solicitudesCompletadas = solicitudes.filter(s => s.estado === 'completado').length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Resumen del Taller</h2>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Asistentes"
          value={asistentes.length}
          icon={<FaUsers />}
          color="blue"
        />
        <StatCard
          title="Solicitudes Pendientes"
          value={solicitudesPendientes}
          icon={<FaClipboardList />}
          color="yellow"
        />
        <StatCard
          title="En Proceso"
          value={solicitudesEnProceso}
          icon={<FaCog />}
          color="orange"
        />
        <StatCard
          title="Completadas"
          value={solicitudesCompletadas}
          icon={<FaChartBar />}
          color="green"
        />
      </div>

      {/* Información del Taller */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Información del Taller</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <p className="text-gray-100">{taller.nombre}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <p className="text-gray-100">{taller.email}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
            <p className="text-gray-100">{taller.telefono || 'No especificado'}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Dirección</label>
            <p className="text-gray-100">{taller.direccion || 'No especificada'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Servicios</label>
            <div className="flex flex-wrap gap-2">
              {taller.servicios?.map((servicio, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-primary/20 text-primary rounded text-sm"
                >
                  {servicio}
                </span>
              )) || <span className="text-gray-400">No especificados</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para tarjetas de estadísticas
function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-400/10',
    yellow: 'text-yellow-400 bg-yellow-400/10',
    orange: 'text-orange-400 bg-orange-400/10',
    green: 'text-green-400 bg-green-400/10',
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs lg:text-sm text-gray-400">{title}</p>
          <p className="text-xl lg:text-2xl font-bold text-gray-100">{value}</p>
        </div>
        <div className={`p-2 lg:p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Tab de Asistentes
function AsistentesTab({ asistentes, tallerId, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showConvertForm, setShowConvertForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAsistente, setSelectedAsistente] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleViewAsistente = (asistente) => {
    setSelectedAsistente(asistente);
    setShowViewModal(true);
  };

  const handleEditAsistente = (asistente) => {
    setSelectedAsistente(asistente);
    setShowEditModal(true);
  };

  const handleDeleteClick = (asistente) => {
    setSelectedAsistente(asistente);
    setShowDeleteModal(true);
  };

  const handleDeleteAsistente = async () => {
    if (!selectedAsistente) return;

    try {
      setLoading(true);
      
      // Eliminar el asistente
      const deleteResponse = await fetch(`/api/asistentes?id=${selectedAsistente._id}`, {
        method: 'DELETE'
      });

      if (!deleteResponse.ok) {
        throw new Error('Error al eliminar asistente');
      }

      // Cambiar el rol del usuario a cliente
      const updateUserResponse = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: selectedAsistente.user._id,
          role: 'cliente'
        }),
      });

      if (!updateUserResponse.ok) {
        throw new Error('Error al actualizar usuario');
      }

      setShowDeleteModal(false);
      setSelectedAsistente(null);
      onUpdate(); // Recargar datos
    } catch (error) {
      console.error('Error:', error);
      showError('Error al eliminar asistente: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-100">Asistentes del Taller</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onUpdate}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 
                     text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
          >
            <FaSync className={loading ? 'animate-spin' : ''} size={14} />
            <span>Actualizar</span>
          </button>
          <button
            onClick={() => setShowConvertForm(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                     text-white rounded-lg transition-colors text-sm"
          >
            <FaUserPlus size={14} />
            <span className="hidden sm:inline">Convertir Cliente</span>
            <span className="sm:hidden">Convertir</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover 
                     text-white rounded-lg transition-colors text-sm"
          >
            <FaPlus size={14} />
            <span className="hidden sm:inline">Agregar Asistente</span>
            <span className="sm:hidden">Agregar</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <AddAsistenteForm 
          tallerId={tallerId}
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            onUpdate();
          }}
        />
      )}

      {showConvertForm && (
        <ConvertClienteForm 
          tallerId={tallerId}
          onClose={() => setShowConvertForm(false)}
          onSuccess={() => {
            setShowConvertForm(false);
            onUpdate();
          }}
        />
      )}

      {/* Modales */}
      {showViewModal && selectedAsistente && (
        <ViewAsistenteModal 
          asistente={selectedAsistente}
          onClose={() => {
            setShowViewModal(false);
            setSelectedAsistente(null);
          }}
        />
      )}

      {showEditModal && selectedAsistente && (
        <EditAsistenteModal 
          asistente={selectedAsistente}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAsistente(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedAsistente(null);
            onUpdate();
          }}
        />
      )}

      {showDeleteModal && selectedAsistente && (
        <DeleteAsistenteModal 
          asistente={selectedAsistente}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedAsistente(null);
          }}
          onConfirm={handleDeleteAsistente}
          loading={loading}
        />
      )}

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {asistentes.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <FaUsers className="mx-auto mb-4 text-4xl" />
            <p>No hay asistentes registrados</p>
            <p className="text-sm mt-2">Agrega tu primer asistente para comenzar</p>
          </div>
        ) : (
          <>
            {/* Vista de tabla para desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Vehículo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Placa/Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {asistentes.map((asistente) => (
                    <tr key={asistente._id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 text-gray-100">
                        {asistente.user?.nombre || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {asistente.user?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {asistente.user?.telefono || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {asistente.vehiculo && (asistente.vehiculo.marca || asistente.vehiculo.modelo || asistente.vehiculo.año || asistente.vehiculo.color) ? (
                          <div className="text-sm">
                            <div className="font-medium">
                              {[asistente.vehiculo.marca, asistente.vehiculo.modelo].filter(Boolean).join(' ') || 'Marca/Modelo no especificado'}
                            </div>
                            <div className="text-gray-400">
                              {[asistente.vehiculo.año, asistente.vehiculo.color].filter(Boolean).join(' - ') || 'Año/Color no especificado'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">Sin información del vehículo</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        <div className="flex flex-col gap-1">
                          <span>{asistente.placa ? `Placa: ${asistente.placa}` : 'Sin asignar'}</span>
                          {asistente.licencia && (
                            <span className="text-xs text-gray-400">Lic: {asistente.licencia}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                            asistente.activo 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              asistente.activo ? 'bg-green-400' : 'bg-red-400'
                            }`} />
                            {asistente.activo ? 'Activo' : 'Inactivo'}
                          </span>
                          <button 
                            onClick={() => handleViewAsistente(asistente)}
                            className="p-2 text-blue-400 hover:bg-blue-400/10 rounded"
                            title="Ver detalles"
                          >
                            <FaEye size={14} />
                          </button>
                          <button 
                            onClick={() => handleEditAsistente(asistente)}
                            className="p-2 text-yellow-400 hover:bg-yellow-400/10 rounded"
                            title="Editar asistente"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(asistente)}
                            disabled={loading}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded disabled:opacity-50"
                            title="Eliminar asistente"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista de cards para móvil */}
            <div className="lg:hidden space-y-4 p-4">
              {asistentes.map((asistente) => (
                <div key={asistente._id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      {asistente.user?.foto ? (
                        <img 
                          src={typeof asistente.user.foto === 'string' 
                            ? asistente.user.foto 
                            : `data:image/jpeg;base64,${asistente.user.foto}`}
                          alt={`Foto de ${asistente.user.nombre}`}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <FaUsers className="text-primary text-lg" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-100 truncate">{asistente.user?.nombre || 'N/A'}</h3>
                        <p className="text-sm text-gray-400 truncate">{asistente.placa ? `Placa: ${asistente.placa}` : 'Sin placa'}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs flex-shrink-0 flex items-center gap-1 ${
                      asistente.activo 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        asistente.activo ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      {asistente.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-gray-300 truncate ml-2">{asistente.user?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Teléfono:</span>
                      <span className="text-gray-300">{asistente.user?.telefono || 'N/A'}</span>
                    </div>
                    {asistente.vehiculo && (asistente.vehiculo.marca || asistente.vehiculo.modelo) && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Vehículo:</span>
                        <span className="text-gray-300 truncate ml-2">
                          {[asistente.vehiculo.marca, asistente.vehiculo.modelo].filter(Boolean).join(' ')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-600">
                    <button 
                      onClick={() => handleViewAsistente(asistente)}
                      className="p-2 text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                      title="Ver detalles"
                    >
                      <FaEye size={16} />
                    </button>
                    <button 
                      onClick={() => handleEditAsistente(asistente)}
                      className="p-2 text-yellow-400 hover:bg-yellow-400/10 rounded transition-colors"
                      title="Editar asistente"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(asistente)}
                      disabled={loading}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded disabled:opacity-50 transition-colors"
                      title="Eliminar asistente"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Formulario para agregar asistente
function AddAsistenteForm({ tallerId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    placa: '',
    password: '',
    confirmPassword: '',
    marca: '',
    modelo: '',
    año: '',
    color: '',
    licencia: '',
    foto: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones básicas
    if (!formData.nombre || !formData.email || !formData.telefono || !formData.password || !formData.confirmPassword) {
      setError('Todos los campos obligatorios deben ser completados');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Crear FormData para enviar la foto junto con los datos del usuario
      const userFormData = new FormData();
      userFormData.append('nombre', formData.nombre);
      userFormData.append('email', formData.email);
      userFormData.append('telefono', formData.telefono);
      userFormData.append('password', formData.password);
      userFormData.append('role', 'asistente');
      
      if (formData.foto) {
        userFormData.append('foto', formData.foto);
      }

      // Crear el usuario con foto
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        body: userFormData // No enviar Content-Type header, el browser lo configurará automáticamente
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        setError(errorData.error || 'Error al crear el usuario');
        return;
      }

      const userData = await userResponse.json();
      console.log('Respuesta de la API de usuarios:', userData); // Para debug

      // Verificar que tenemos el _id del usuario
      if (!userData._id) {
        setError('Error: No se pudo obtener el ID del usuario creado');
        console.error('userData no contiene _id:', userData);
        return;
      }

      // Luego crear el asistente con información adicional
      const asistenteData = {
        user: userData._id,
        taller: tallerId,
        placa: formData.placa,
        activo: true
      };

      // Solo agregar vehiculo si hay al menos un campo completado
      if (formData.marca || formData.modelo || formData.año || formData.color) {
        asistenteData.vehiculo = {};
        if (formData.marca) asistenteData.vehiculo.marca = formData.marca;
        if (formData.modelo) asistenteData.vehiculo.modelo = formData.modelo;
        if (formData.año) asistenteData.vehiculo.año = parseInt(formData.año);
        if (formData.color) asistenteData.vehiculo.color = formData.color;
      }

      // Solo agregar licencia si no está vacía
      if (formData.licencia) {
        asistenteData.licencia = formData.licencia;
      }

      console.log('FormData completo antes de construir asistenteData:', formData); // Para debug
      console.log('Datos del asistente a enviar:', asistenteData); // Para debug

      const asistenteResponse = await fetch('/api/asistentes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asistenteData),
      });

      if (asistenteResponse.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await asistenteResponse.json();
        setError(errorData.error || 'Error al crear el asistente');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-100 mb-2">Agregar Nuevo Asistente</h3>
      <p className="text-gray-400 text-sm mb-6">
        Se creará una cuenta de usuario con rol de asistente y se asociará a tu taller. 
        El asistente podrá usar estas credenciales para iniciar sesión. Los campos marcados con * son obligatorios.
      </p>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                     text-gray-100 focus:border-primary focus:outline-none"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                     text-gray-100 focus:border-primary focus:outline-none"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Teléfono *
          </label>
          <input
            type="tel"
            value={formData.telefono}
            onChange={(e) => setFormData({...formData, telefono: e.target.value})}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                     text-gray-100 focus:border-primary focus:outline-none"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Foto de Perfil
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFormData({...formData, foto: e.target.files[0]})}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                     text-gray-100 focus:border-primary focus:outline-none file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0 file:text-sm file:font-medium
                     file:bg-primary file:text-white hover:file:bg-primary-hover"
          />
          <p className="text-xs text-gray-400 mt-1">Opcional - Formatos: JPG, PNG, GIF</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Placa del Vehículo *
          </label>
          <input
            type="text"
            value={formData.placa}
            onChange={(e) => setFormData({...formData, placa: e.target.value})}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                     text-gray-100 focus:border-primary focus:outline-none"
            placeholder="ABC-123"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Marca del Vehículo
          </label>
          <input
            type="text"
            value={formData.marca}
            onChange={(e) => setFormData({...formData, marca: e.target.value})}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                     text-gray-100 focus:border-primary focus:outline-none"
            placeholder="Toyota, Ford, etc."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Modelo del Vehículo
          </label>
          <input
            type="text"
            value={formData.modelo}
            onChange={(e) => setFormData({...formData, modelo: e.target.value})}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                     text-gray-100 focus:border-primary focus:outline-none"
            placeholder="Corolla, Focus, etc."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Año del Vehículo
          </label>
          <input
            type="number"
            value={formData.año}
            onChange={(e) => setFormData({...formData, año: e.target.value})}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                     text-gray-100 focus:border-primary focus:outline-none"
            placeholder="2020"
            min="1990"
            max={new Date().getFullYear() + 1}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Color del Vehículo
          </label>
          <input
            type="text"
            value={formData.color}
            onChange={(e) => setFormData({...formData, color: e.target.value})}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                     text-gray-100 focus:border-primary focus:outline-none"
            placeholder="Blanco, Negro, etc."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Número de Licencia
          </label>
          <input
            type="text"
            value={formData.licencia}
            onChange={(e) => setFormData({...formData, licencia: e.target.value})}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                     text-gray-100 focus:border-primary focus:outline-none"
            placeholder="Número de licencia de conducir"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contraseña *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                     text-gray-100 focus:border-primary focus:outline-none"
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confirmar Contraseña *
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                     text-gray-100 focus:border-primary focus:outline-none"
            placeholder="Confirma la contraseña"
            required
            minLength={6}
          />
        </div>
        
        {error && (
          <div className="md:col-span-2 bg-red-900/20 border border-red-800 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        <div className="md:col-span-2 flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white 
                     rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Asistente'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white 
                     rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

// Modal para ver detalles del asistente
function ViewAsistenteModal({ asistente, onClose }) {
  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 
                 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto 
                     animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-100">Detalles del Asistente</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl hover:bg-gray-700 
                     rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Foto de Perfil y Información Principal */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                {asistente.user?.foto ? (
                  <img 
                    src={typeof asistente.user.foto === 'string' 
                      ? asistente.user.foto 
                      : `data:image/jpeg;base64,${asistente.user.foto}`}
                    alt={`Foto de ${asistente.user.nombre}`}
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/20">
                    <FaUsers className="text-primary text-2xl" />
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-2xl font-bold text-gray-100 mb-2">
                  {asistente.user?.nombre || 'N/A'}
                </h4>
                <p className="text-gray-300 mb-2">{asistente.user?.email || 'N/A'}</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                  asistente.activo 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    asistente.activo ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  {asistente.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          {/* Información Personal */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-100 mb-4 flex items-center gap-2">
              <FaUsers className="text-blue-400" />
              Información Personal
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                <p className="text-gray-100">{asistente.user?.telefono || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rol</label>
                <p className="text-gray-100 capitalize">{asistente.user?.role || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Información del Vehículo */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-100 mb-4 flex items-center gap-2">
              <FaCar className="text-orange-400" />
              Información del Vehículo
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Placa</label>
                <p className="text-gray-100 font-medium">{asistente.placa || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Marca</label>
                <p className="text-gray-100">{asistente.vehiculo?.marca || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Modelo</label>
                <p className="text-gray-100">{asistente.vehiculo?.modelo || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Año</label>
                <p className="text-gray-100">{asistente.vehiculo?.año || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Color</label>
                <p className="text-gray-100">{asistente.vehiculo?.color || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Licencia de Conducir</label>
                <p className="text-gray-100">{asistente.licencia || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Información del Sistema */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-100 mb-4 flex items-center gap-2">
              <FaClipboardList className="text-purple-400" />
              Información del Sistema
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Fecha de Registro</label>
                <p className="text-gray-100">
                  {asistente.createdAt ? new Date(asistente.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Última Actualización</label>
                <p className="text-gray-100">
                  {asistente.updatedAt ? new Date(asistente.updatedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ID del Asistente</label>
                <p className="text-gray-100 font-mono text-sm">{asistente._id}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ID del Usuario</label>
                <p className="text-gray-100 font-mono text-sm">{asistente.user?._id || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal para editar asistente
function EditAsistenteModal({ asistente, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    placa: asistente.placa || '',
    marca: asistente.vehiculo?.marca || '',
    modelo: asistente.vehiculo?.modelo || '',
    año: asistente.vehiculo?.año || '',
    color: asistente.vehiculo?.color || '',
    licencia: asistente.licencia || '',
    activo: asistente.activo
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Preparar datos para actualizar
      const updateData = {
        _id: asistente._id,
        placa: formData.placa,
        activo: formData.activo
      };

      // Agregar información del vehículo si existe
      if (formData.marca || formData.modelo || formData.año || formData.color) {
        updateData.vehiculo = {};
        if (formData.marca) updateData.vehiculo.marca = formData.marca;
        if (formData.modelo) updateData.vehiculo.modelo = formData.modelo;
        if (formData.año) updateData.vehiculo.año = parseInt(formData.año);
        if (formData.color) updateData.vehiculo.color = formData.color;
      }

      // Agregar licencia si existe
      if (formData.licencia) {
        updateData.licencia = formData.licencia;
      }

      const response = await fetch('/api/asistentes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al actualizar el asistente');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 
                 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto 
                     animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-100">Editar Asistente</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-200 text-2xl hover:bg-gray-700 
                     rounded-full w-8 h-8 flex items-center justify-center transition-colors
                     disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-100 mb-4">Información Básica</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Placa del Vehículo *
                </label>
                <input
                  type="text"
                  value={formData.placa}
                  onChange={(e) => setFormData({...formData, placa: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg 
                           text-gray-100 focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={formData.activo}
                  onChange={(e) => setFormData({...formData, activo: e.target.value === 'true'})}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg 
                           text-gray-100 focus:border-primary focus:outline-none"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Información del Vehículo */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-100 mb-4">Información del Vehículo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  value={formData.marca}
                  onChange={(e) => setFormData({...formData, marca: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg 
                           text-gray-100 focus:border-primary focus:outline-none"
                  placeholder="Toyota, Ford, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Modelo
                </label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg 
                           text-gray-100 focus:border-primary focus:outline-none"
                  placeholder="Corolla, Focus, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Año
                </label>
                <input
                  type="number"
                  value={formData.año}
                  onChange={(e) => setFormData({...formData, año: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg 
                           text-gray-100 focus:border-primary focus:outline-none"
                  placeholder="2020"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg 
                           text-gray-100 focus:border-primary focus:outline-none"
                  placeholder="Blanco, Negro, etc."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Número de Licencia
                </label>
                <input
                  type="text"
                  value={formData.licencia}
                  onChange={(e) => setFormData({...formData, licencia: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg 
                           text-gray-100 focus:border-primary focus:outline-none"
                  placeholder="Número de licencia de conducir"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white 
                       rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal para confirmar eliminación
function DeleteAsistenteModal({ asistente, onClose, onConfirm, loading }) {
  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, loading]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 
                 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full 
                     animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-100">Confirmar Eliminación</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-200 text-2xl hover:bg-gray-700 
                     rounded-full w-8 h-8 flex items-center justify-center transition-colors
                     disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-red-400/10 rounded-full flex items-center justify-center mr-4">
              <FaTrash className="text-red-400 text-xl" />
            </div>
            <div>
              <p className="text-gray-100 font-medium">
                ¿Eliminar asistente "{asistente.user?.nombre}"?
              </p>
              <p className="text-gray-400 text-sm">
                Placa: {asistente.placa}
              </p>
            </div>
          </div>
          
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
            <div className="flex items-start">
              <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-yellow-900 text-xs font-bold">!</span>
              </div>
              <div>
                <p className="text-yellow-400 font-medium text-sm mb-1">Atención</p>
                <p className="text-yellow-300 text-sm">
                  Esta acción eliminará al asistente de tu taller y lo convertirá en un usuario cliente normal. 
                  No se eliminarán sus datos personales.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white 
                     rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white 
                     rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Eliminando...
              </>
            ) : (
              <>
                <FaTrash size={14} />
                Eliminar Asistente
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Formulario para convertir cliente existente a asistente
function ConvertClienteForm({ tallerId, onClose, onSuccess }) {
  const [searchData, setSearchData] = useState({
    email: '',
    telefono: ''
  });
  const [foundUser, setFoundUser] = useState(null);
  const [asistenteData, setAsistenteData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    año: '',
    color: '',
    licencia: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: buscar, 2: completar datos

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchData.email && !searchData.telefono) {
      setError('Debes proporcionar al menos un email o teléfono');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const searchParams = new URLSearchParams();
      if (searchData.email) searchParams.append('email', searchData.email);
      if (searchData.telefono) searchParams.append('telefono', searchData.telefono);

      const response = await fetch(`/api/users/search?${searchParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Usuario no encontrado');
        return;
      }

      const userData = await response.json();
      
      // Verificar que no sea ya un asistente o taller
      if (userData.role === 'asistente') {
        setError('Este usuario ya es un asistente');
        return;
      }
      
      if (userData.role === 'taller') {
        setError('No se puede convertir un taller en asistente');
        return;
      }

      // Verificar si ya es asistente de algún taller
      const checkAsistenteResponse = await fetch(`/api/asistentes?userId=${userData._id}`);
      if (checkAsistenteResponse.ok) {
        const existingAsistente = await checkAsistenteResponse.json();
        if (existingAsistente && existingAsistente.length > 0) {
          setError('Este usuario ya es asistente de un taller');
          return;
        }
      }

      setFoundUser(userData);
      setStep(2);
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión al buscar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!asistenteData.placa) {
      setError('La placa del vehículo es obligatoria');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Primero actualizar el rol del usuario a asistente
      const updateUserResponse = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: foundUser._id,
          role: 'asistente'
        }),
      });

      if (!updateUserResponse.ok) {
        throw new Error('Error al actualizar el rol del usuario');
      }

      // Crear los datos del asistente
      const newAsistenteData = {
        user: foundUser._id,
        taller: tallerId,
        placa: asistenteData.placa,
        activo: true
      };

      // Agregar información del vehículo si existe
      if (asistenteData.marca || asistenteData.modelo || asistenteData.año || asistenteData.color) {
        newAsistenteData.vehiculo = {};
        if (asistenteData.marca) newAsistenteData.vehiculo.marca = asistenteData.marca;
        if (asistenteData.modelo) newAsistenteData.vehiculo.modelo = asistenteData.modelo;
        if (asistenteData.año) newAsistenteData.vehiculo.año = parseInt(asistenteData.año);
        if (asistenteData.color) newAsistenteData.vehiculo.color = asistenteData.color;
      }

      // Agregar licencia si existe
      if (asistenteData.licencia) {
        newAsistenteData.licencia = asistenteData.licencia;
      }

      // Crear el asistente
      const asistenteResponse = await fetch('/api/asistentes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAsistenteData),
      });

      if (asistenteResponse.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await asistenteResponse.json();
        setError(errorData.error || 'Error al crear el asistente');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-100 mb-2">Convertir Cliente a Asistente</h3>
      <p className="text-gray-400 text-sm mb-6">
        Busca un cliente existente por email o teléfono para convertirlo en asistente de tu taller.
      </p>

      {step === 1 ? (
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email del Cliente
              </label>
              <input
                type="email"
                value={searchData.email}
                onChange={(e) => setSearchData({...searchData, email: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                         text-gray-100 focus:border-primary focus:outline-none"
                placeholder="cliente@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono del Cliente
              </label>
              <input
                type="tel"
                value={searchData.telefono}
                onChange={(e) => setSearchData({...searchData, telefono: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                         text-gray-100 focus:border-primary focus:outline-none"
                placeholder="123-456-7890"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white 
                       rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar Cliente'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white 
                       rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Información del usuario encontrado */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-100 mb-2">Cliente Encontrado</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Nombre:</span>
                <p className="text-gray-100">{foundUser.nombre}</p>
              </div>
              <div>
                <span className="text-gray-400">Email:</span>
                <p className="text-gray-100">{foundUser.email}</p>
              </div>
              <div>
                <span className="text-gray-400">Teléfono:</span>
                <p className="text-gray-100">{foundUser.telefono}</p>
              </div>
            </div>
          </div>

          {/* Formulario de datos del asistente */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Placa del Vehículo *
              </label>
              <input
                type="text"
                value={asistenteData.placa}
                onChange={(e) => setAsistenteData({...asistenteData, placa: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                         text-gray-100 focus:border-primary focus:outline-none"
                placeholder="ABC-123"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Marca del Vehículo
              </label>
              <input
                type="text"
                value={asistenteData.marca}
                onChange={(e) => setAsistenteData({...asistenteData, marca: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                         text-gray-100 focus:border-primary focus:outline-none"
                placeholder="Toyota, Ford, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Modelo del Vehículo
              </label>
              <input
                type="text"
                value={asistenteData.modelo}
                onChange={(e) => setAsistenteData({...asistenteData, modelo: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                         text-gray-100 focus:border-primary focus:outline-none"
                placeholder="Corolla, Focus, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Año del Vehículo
              </label>
              <input
                type="number"
                value={asistenteData.año}
                onChange={(e) => setAsistenteData({...asistenteData, año: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                         text-gray-100 focus:border-primary focus:outline-none"
                placeholder="2020"
                min="1990"
                max={new Date().getFullYear() + 1}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color del Vehículo
              </label>
              <input
                type="text"
                value={asistenteData.color}
                onChange={(e) => setAsistenteData({...asistenteData, color: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                         text-gray-100 focus:border-primary focus:outline-none"
                placeholder="Blanco, Negro, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Número de Licencia
              </label>
              <input
                type="text"
                value={asistenteData.licencia}
                onChange={(e) => setAsistenteData({...asistenteData, licencia: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                         text-gray-100 focus:border-primary focus:outline-none"
                placeholder="Número de licencia de conducir"
              />
            </div>

            {error && (
              <div className="md:col-span-2 bg-red-900/20 border border-red-800 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="md:col-span-2 flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white 
                         rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Convirtiendo...' : 'Convertir a Asistente'}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white 
                         rounded-lg transition-colors"
              >
                Buscar Otro
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white 
                         rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Tab de Solicitudes
function SolicitudesTab({ solicitudes, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-recargar solicitudes cada 30 segundos
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      onUpdate();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [onUpdate, autoRefresh]);

  const handleManualRefresh = async () => {
    setLoading(true);
    await onUpdate();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-100">Solicitudes de Servicio</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded 
                       focus:ring-primary focus:ring-2"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-300">
              Recarga automática (30s)
            </label>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 
                     text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <FaSync className={loading ? 'animate-spin' : ''} size={16} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {solicitudes.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <FaClipboardList className="mx-auto mb-4 text-4xl" />
            <p>No hay solicitudes de servicio</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Servicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {solicitudes.map((solicitud) => (
                  <tr key={solicitud._id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-gray-100">{solicitud.clienteNombre}</td>
                    <td className="px-6 py-4 text-gray-300">{solicitud.servicio}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        solicitud.estado === 'completado' ? 'bg-green-400/10 text-green-400' :
                        solicitud.estado === 'en_proceso' ? 'bg-yellow-400/10 text-yellow-400' :
                        'bg-gray-400/10 text-gray-400'
                      }`}>
                        {solicitud.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(solicitud.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-blue-400 hover:bg-blue-400/10 rounded">
                          <FaEye size={14} />
                        </button>
                        <button className="p-2 text-yellow-400 hover:bg-yellow-400/10 rounded">
                          <FaEdit size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        showCancel={modalState.showCancel}
      />
    </div>
  );
}

// Tab de Configuración
function SettingsTab({ taller }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Configuración del Taller</h2>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Información General</h3>
        <p className="text-gray-400">Funcionalidad en desarrollo...</p>
      </div>
    </div>
  );
}
