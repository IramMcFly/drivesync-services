"use client";
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Modal } from "../../ui";
import useModal from "../../../hooks/useModal";
import ServiceForm from '../../forms/admin/ServiceForm';
import TallerForm from '../../forms/admin/TallerForm';
import { 
  FaShieldAlt, FaCog, FaUsers, FaClipboardList, FaChartBar, 
  FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaUserPlus,
  FaTimes, FaCar, FaBars, FaWarehouse, FaTools, FaFileAlt, FaBolt
} from 'react-icons/fa';
import StarRating from '../../ui/StarRating';

export default function AdminDashboard() {
  const { modalState, showError, showSuccess, showConfirm, hideModal } = useModal();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTalleres: 0,
    totalServicios: 0,
    totalRequests: 0,
    activeRequests: 0
  });

  // Estados para el CRUD de servicios
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceFormLoading, setServiceFormLoading] = useState(false);

  // Estados para el CRUD de talleres
  const [showTallerForm, setShowTallerForm] = useState(false);
  const [editingTaller, setEditingTaller] = useState(null);
  const [tallerFormLoading, setTallerFormLoading] = useState(false);

  // Verificar autenticación y tipo de usuario
  useEffect(() => {
    if (status === 'loading') return;
    
    // Solo redirigir si estamos seguros de que no hay sesión después de un tiempo
    if (status === 'unauthenticated') {
      const timer = setTimeout(() => {
        if (status === 'unauthenticated') {
          router.push('/login');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
    
    if (session && session.user?.userType !== 'admin') {
      router.push('/main/servicios-express');
      return;
    }
    
    if (session && session.user?.userType === 'admin') {
      loadDashboardData();
    }
  }, [session, status, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar todos los datos en paralelo
      const [usersRes, talleresRes, serviciosRes, requestsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/talleres'),
        fetch('/api/servicios'),
        fetch('/api/servicerequests')
      ]);

      let usersData = [];
      let talleresData = [];
      let serviciosData = [];
      let requestsData = [];

      if (usersRes.ok) {
        usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (talleresRes.ok) {
        talleresData = await talleresRes.json();
        setTalleres(talleresData);
      }

      if (serviciosRes.ok) {
        serviciosData = await serviciosRes.json();
        setServicios(serviciosData);
      }

      if (requestsRes.ok) {
        requestsData = await requestsRes.json();
        setServiceRequests(requestsData);
      }
      
      // Calcular estadísticas con los datos cargados
      setStats({
        totalUsers: usersData.length,
        totalTalleres: talleresData.length,
        totalServicios: serviciosData.length,
        totalRequests: requestsData.length,
        activeRequests: requestsData.filter(r => ['pendiente', 'asignado', 'en_camino'].includes(r.estado)).length
      });

    } catch (error) {
      showError('Error al cargar datos del panel administrativo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    showConfirm(
      '¿Estás seguro de que quieres eliminar este usuario?',
      async () => {
        try {
          const response = await fetch(`/api/users?id=${userId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            showSuccess('Usuario eliminado exitosamente');
            loadDashboardData();
          } else {
            showError('Error al eliminar usuario');
          }
        } catch (error) {
          showError('Error de conexión al eliminar usuario');
        }
      },
      'Eliminar Usuario'
    );
  };

  const handleDeleteTaller = async (tallerId) => {
    showConfirm(
      '¿Estás seguro de que quieres eliminar este taller?',
      async () => {
        try {
          const response = await fetch(`/api/talleres?id=${tallerId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            showSuccess('Taller eliminado exitosamente');
            loadDashboardData();
          } else {
            showError('Error al eliminar taller');
          }
        } catch (error) {
          showError('Error de conexión al eliminar taller');
        }
      },
      'Eliminar Taller'
    );
  };

  // CRUD Functions for Services
  const handleCreateService = () => {
    setEditingService(null);
    setShowServiceForm(true);
  };

  const handleEditService = (servicio) => {
    setEditingService(servicio);
    setShowServiceForm(true);
  };

  const handleDeleteService = async (servicioId) => {
    showConfirm(
      '¿Estás seguro de que quieres eliminar este servicio?',
      async () => {
        try {
          const response = await fetch(`/api/servicios?id=${servicioId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            showSuccess('Servicio eliminado exitosamente');
            loadDashboardData();
          } else {
            showError('Error al eliminar el servicio');
          }
        } catch (error) {
          showError('Error de conexión al eliminar servicio');
        }
      },
      'Eliminar Servicio'
    );
  };

  const handleServiceSubmit = async (serviceData) => {
    setServiceFormLoading(true);
    try {
      const formData = new FormData();
      
      // Agregar campos básicos
      Object.keys(serviceData).forEach(key => {
        if (key === 'subtipos') {
          formData.append(key, JSON.stringify(serviceData[key]));
        } else if (key === 'imagen' && serviceData[key]) {
          formData.append(key, serviceData[key]);
        } else if (key !== 'imagen' && key !== '_id') {
          formData.append(key, serviceData[key]);
        }
      });

      const url = '/api/servicios';
      const method = editingService ? 'PUT' : 'POST';
      
      if (editingService) {
        formData.append('_id', editingService._id);
      }

      const response = await fetch(url, {
        method,
        body: formData
      });

      if (response.ok) {
        showSuccess(editingService ? 'Servicio actualizado exitosamente' : 'Servicio creado exitosamente');
        setShowServiceForm(false);
        setEditingService(null);
        loadDashboardData();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al guardar el servicio');
      }
    } catch (error) {
      showError('Error de conexión al guardar servicio');
    } finally {
      setServiceFormLoading(false);
    }
  };

  // CRUD Functions for Users
  const handleChangeUserRole = async (userId, newRole) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _id: userId,
          role: newRole
        })
      });

      if (response.ok) {
        showSuccess('Rol de usuario actualizado exitosamente');
        loadDashboardData();
      } else {
        showError('Error al cambiar el rol del usuario');
      }
    } catch (error) {
      showError('Error de conexión al cambiar rol de usuario');
    }
  };

  const handleServiceFormCancel = () => {
    setShowServiceForm(false);
    setEditingService(null);
  };

  // CRUD Functions for Talleres
  const handleCreateTaller = () => {
    setEditingTaller(null);
    setShowTallerForm(true);
  };

  const handleEditTaller = (taller) => {
    setEditingTaller(taller);
    setShowTallerForm(true);
  };

  const handleTallerSubmit = async (tallerData) => {
    setTallerFormLoading(true);
    try {
      const url = '/api/talleres';
      const method = editingTaller ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tallerData)
      });

      if (response.ok) {
        showSuccess(editingTaller ? 'Taller actualizado exitosamente' : 'Taller creado exitosamente');
        setShowTallerForm(false);
        setEditingTaller(null);
        loadDashboardData();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al guardar el taller');
      }
    } catch (error) {
      showError('Error de conexión al guardar taller');
    } finally {
      setTallerFormLoading(false);
    }
  };

  const handleTallerFormCancel = () => {
    setShowTallerForm(false);
    setEditingTaller(null);
  };

  const menuItems = [
    { 
      key: 'overview', 
      label: 'Panel General', 
      icon: <FaChartBar />,
      count: null
    },
    { 
      key: 'users', 
      label: 'Usuarios', 
      icon: <FaUsers />,
      count: users.length
    },
    { 
      key: 'talleres', 
      label: 'Talleres', 
      icon: <FaWarehouse />,
      count: talleres.length
    },
    { 
      key: 'servicios', 
      label: 'Servicios', 
      icon: <FaTools />,
      count: servicios.length
    },
    { 
      key: 'requests', 
      label: 'Solicitudes', 
      icon: <FaFileAlt />,
      count: serviceRequests.length
    }
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Panel General</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <FaUsers className="text-blue-600 dark:text-blue-400 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Usuarios</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <FaWarehouse className="text-green-600 dark:text-green-400 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Talleres</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalTalleres}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <FaTools className="text-purple-600 dark:text-purple-400 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Servicios</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalServicios}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <FaFileAlt className="text-orange-600 dark:text-orange-400 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Solicitudes Activas</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activeRequests}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Actividad Reciente</h3>
              <div className="space-y-3">
                {serviceRequests.slice(0, 5).map((request) => (
                  <div key={request._id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {request.servicio?.nombre || 'Servicio'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {request.cliente?.nombre || 'Cliente'} - {request.estado}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      request.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      request.estado === 'asignado' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      request.estado === 'en_camino' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                      request.estado === 'finalizado' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {request.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Usuarios</h2>
              <button
                onClick={loadDashboardData}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
              >
                <FaSync size={16} />
                Actualizar
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Teléfono</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.nombre}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role || 'cliente'}
                            onChange={(e) => handleChangeUserRole(user._id, e.target.value)}
                            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          >
                            <option value="cliente">Cliente</option>
                            <option value="asistente">Asistente</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.telefono || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ml-2"
                          >
                            <FaTrash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'talleres':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Talleres</h2>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateTaller}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <FaPlus size={16} />
                  Nuevo Taller
                </button>
                <button
                  onClick={loadDashboardData}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <FaSync size={16} />
                  Actualizar
                </button>
              </div>
            </div>

            {talleres.length === 0 ? (
              <div className="text-center py-12">
                <FaWarehouse className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hay talleres</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Comienza registrando un nuevo taller.</p>
                <div className="mt-6">
                  <button
                    onClick={handleCreateTaller}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                  >
                    <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                    Nuevo Taller
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dirección</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contacto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Calificación</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Servicios</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {talleres.map((taller) => (
                        <tr key={taller._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{taller.nombre}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Registrado: {new Date(taller.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={taller.direccion}>
                              {taller.direccion}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{taller.telefono}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">{taller.email || 'Sin email'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StarRating 
                              rating={taller.rating || taller.calificacion || 0}
                              totalRatings={taller.totalRatings}
                              size="text-sm"
                              showNumber={true}
                              className="justify-start"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {taller.servicios ? `${taller.servicios.length} servicios` : 'Sin servicios'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditTaller(taller)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                              title="Editar taller"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={() => {/* TODO: Implementar vista detallada */}}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3"
                              title="Ver detalles"
                            >
                              <FaEye size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteTaller(taller._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Eliminar taller"
                            >
                              <FaTrash size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case 'servicios':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Servicios</h2>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateService}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <FaPlus size={16} />
                  Nuevo Servicio
                </button>
                <button
                  onClick={loadDashboardData}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <FaSync size={16} />
                  Actualizar
                </button>
              </div>
            </div>

            {servicios.length === 0 ? (
              <div className="text-center py-12">
                <FaTools className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hay servicios</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Comienza creando un nuevo servicio.</p>
                <div className="mt-6">
                  <button
                    onClick={handleCreateService}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                  >
                    <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                    Nuevo Servicio
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servicios.map((servicio) => (
                  <div key={servicio._id} className="bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{servicio.nombre}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditService(servicio)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="Editar servicio"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteService(servicio._id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Eliminar servicio"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {servicio.descripcion || 'Sin descripción'}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Precio mínimo:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">${servicio.precioMin}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Precio máximo:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">${servicio.precioMax}</span>
                      </div>
                    </div>

                    {servicio.subtipos && servicio.subtipos.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subtipos:</h4>
                        <div className="space-y-1">
                          {servicio.subtipos.slice(0, 3).map((subtipo, index) => (
                            <div key={index} className="flex justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400">{subtipo.nombre}</span>
                              <span className="text-gray-900 dark:text-gray-100">${subtipo.precio}</span>
                            </div>
                          ))}
                          {servicio.subtipos.length > 3 && (
                            <p className="text-xs text-gray-500">+{servicio.subtipos.length - 3} más</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Creado: {new Date(servicio.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'requests':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Solicitudes de Servicio</h2>
              <button
                onClick={loadDashboardData}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
              >
                <FaSync size={16} />
                Actualizar
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Servicio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Taller</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {serviceRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {request.cliente?.nombre || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {request.servicio?.nombre || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            request.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            request.estado === 'asignado' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                            request.estado === 'en_camino' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                            request.estado === 'finalizado' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {request.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {request.taller?.nombre || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(request.createdAt || request.fechaSolicitud).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 shadow-lg transform lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700`}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FaShieldAlt className="text-white text-lg" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Admin Panel</h1>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <nav className="mt-6 px-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => {
                      setActiveTab(item.key);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === item.key
                        ? 'bg-primary text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.count !== null && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activeTab === item.key
                          ? 'bg-gray-800/20 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <button
              onClick={() => {
                console.log('🚀 Admin navegando a Servicios Express');
                console.log('👤 Session actual:', { 
                  userType: session?.user?.userType, 
                  userId: session?.user?.id,
                  status: status 
                });
                router.push('/main/servicios-express');
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <FaBolt />
              <span className="font-medium">Ir a Servicios Express</span>
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <FaSignOutAlt />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Top Bar */}
          <div className="bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaBars size={20} />
                </button>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Bienvenido, {session?.user?.nombre || 'Administrador'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Service Form Modal */}
      {showServiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ServiceForm
              servicio={editingService}
              onSubmit={handleServiceSubmit}
              onCancel={handleServiceFormCancel}
              isLoading={serviceFormLoading}
            />
          </div>
        </div>
      )}

      {/* Taller Form Modal */}
      {showTallerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <TallerForm
              taller={editingTaller}
              onSubmit={handleTallerSubmit}
              onCancel={handleTallerFormCancel}
              isLoading={tallerFormLoading}
            />
          </div>
        </div>
      )}

      {/* Modal Component */}
      <Modal {...modalState} />
    </div>
  );
}
