"use client";
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  FaTools, FaCog, FaUsers, FaClipboardList, FaChartBar, 
  FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaEye 
} from 'react-icons/fa';

export default function TallerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [asistentes, setAsistentes] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

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
    
    // Cargar datos del taller
    loadDashboardData();
  }, [session, status, router]);

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
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FaTools className="text-primary text-2xl" />
            <div>
              <h1 className="text-xl font-bold text-gray-100">
                Dashboard - {session.user.nombre}
              </h1>
              <p className="text-sm text-gray-400">{session.user.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 
                     text-white rounded-lg transition-colors"
          >
            <FaSignOutAlt size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-gray-800 min-h-screen p-4">
          <div className="space-y-2">
            <NavItem
              icon={<FaChartBar />}
              label="Resumen"
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <NavItem
              icon={<FaUsers />}
              label="Asistentes"
              active={activeTab === 'asistentes'}
              onClick={() => setActiveTab('asistentes')}
            />
            <NavItem
              icon={<FaClipboardList />}
              label="Solicitudes"
              active={activeTab === 'solicitudes'}
              onClick={() => setActiveTab('solicitudes')}
            />
            <NavItem
              icon={<FaCog />}
              label="Configuración"
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
            />
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-100">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Tab de Asistentes
function AsistentesTab({ asistentes, tallerId, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-100">Asistentes del Taller</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover 
                   text-white rounded-lg transition-colors"
        >
          <FaPlus size={16} />
          <span>Agregar Asistente</span>
        </button>
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

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {asistentes.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <FaUsers className="mx-auto mb-4 text-4xl" />
            <p>No hay asistentes registrados</p>
            <p className="text-sm mt-2">Agrega tu primer asistente para comenzar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                      {asistente.placa ? `Placa: ${asistente.placa}` : 'Sin asignar'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          asistente.activo 
                            ? 'bg-green-400/10 text-green-400' 
                            : 'bg-gray-400/10 text-gray-400'
                        }`}>
                          {asistente.activo ? 'Activo' : 'Inactivo'}
                        </span>
                        <button className="p-2 text-blue-400 hover:bg-blue-400/10 rounded">
                          <FaEye size={14} />
                        </button>
                        <button className="p-2 text-yellow-400 hover:bg-yellow-400/10 rounded">
                          <FaEdit size={14} />
                        </button>
                        <button className="p-2 text-red-400 hover:bg-red-400/10 rounded">
                          <FaTrash size={14} />
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
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Primero crear el usuario
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          password: formData.password,
          role: 'asistente'
        }),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        alert(errorData.error || 'Error al crear el usuario');
        return;
      }

      const userData = await userResponse.json();

      // Luego crear el asistente
      const asistenteResponse = await fetch('/api/asistentes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userData._id,
          taller: tallerId,
          placa: formData.placa,
          activo: true
        }),
      });

      if (asistenteResponse.ok) {
        onSuccess();
      } else {
        alert('Error al crear el asistente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">Agregar Nuevo Asistente</h3>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nombre Completo
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
            Email
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
            Teléfono
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
            Placa del Vehículo
          </label>
          <input
            type="text"
            value={formData.placa}
            onChange={(e) => setFormData({...formData, placa: e.target.value})}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                     text-gray-100 focus:border-primary focus:outline-none"
            placeholder="ABC-123"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contraseña Temporal
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                     text-gray-100 focus:border-primary focus:outline-none"
            placeholder="Contraseña temporal para el asistente"
            required
          />
        </div>
        
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

// Tab de Solicitudes
function SolicitudesTab({ solicitudes, onUpdate }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Solicitudes de Servicio</h2>

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
