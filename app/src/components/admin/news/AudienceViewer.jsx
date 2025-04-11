"use client";

import { useState, useEffect } from 'react';
import { Users, Layers, Building2, Search, X, Eye, Filter } from 'lucide-react';
import { newsPermissionsService } from '@/services/newsPermissionsService';

export default function AudienceViewer({ newsId }) {
  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState('applications'); // 'applications', 'clients', 'users'
  
  // Estados para datos
  const [applications, setApplications] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [clientUserRelations, setClientUserRelations] = useState({});
  
  // Estados para búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para loading
  const [loading, setLoading] = useState(true);
  
  // Estado para filtros activos
  const [filters, setFilters] = useState({
    selectedClient: null,
    selectedApplication: null
  });

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar todos los datos necesarios
        const [appData, clientData, userData, relationsData] = await Promise.all([
          newsPermissionsService.getApplications(),
          newsPermissionsService.getClients(),
          newsPermissionsService.getUsers(),
          newsPermissionsService.getClientUserRelations()
        ]);
        
        setApplications(appData || []);
        setClients(clientData || []);
        setUsers(userData || []);
        setClientUserRelations(relationsData || {});
      } catch (error) {
        console.error('Error al cargar datos de audiencia:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Obtener usuarios de un cliente específico
  const getUsersByClient = (clientId) => {
    if (!clientId) return [];
    
    const userIds = clientUserRelations[clientId] || [];
    return users.filter(user => 
      user && user.id && userIds.includes(user.id)
    );
  };
  
  // Filtrar datos según el término de búsqueda
  const filteredApplications = applications.filter(app => 
    app && (app.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );
  
  const filteredClients = clients.filter(client => 
    client && (client.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name || user.email || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    
    // Aplicar filtro por cliente si está seleccionado
    if (filters.selectedClient) {
      const clientUserIds = clientUserRelations[filters.selectedClient] || [];
      if (!clientUserIds.includes(user.id)) {
        return false;
      }
    }
    
    return matchesSearch;
  });
  
  // Resetear filtros
  const resetFilters = () => {
    setFilters({
      selectedClient: null,
      selectedApplication: null
    });
  };
  
  // Cambiar a otra pestaña
  const changeTab = (tab) => {
    setActiveTab(tab);
    setSearchTerm(''); // Resetear búsqueda al cambiar de pestaña
  };
  
  // Obtener el contador de cada pestaña
  const getTabCount = (tabName) => {
    switch (tabName) {
      case 'applications':
        return applications.length;
      case 'clients':
        return clients.length;
      case 'users':
        return users.length;
      default:
        return 0;
    }
  };
  
  // Seleccionar un cliente como filtro
  const selectClientFilter = (clientId) => {
    setFilters(prev => ({
      ...prev,
      selectedClient: prev.selectedClient === clientId ? null : clientId
    }));
    
    // Si seleccionamos un cliente, cambiamos a la pestaña de usuarios
    if (clientId && activeTab !== 'users') {
      setActiveTab('users');
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => changeTab('applications')}
          className={`flex items-center py-3 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'applications' 
              ? 'text-indigo-600 bg-indigo-50' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          <Layers size={18} className="mr-2" />
          Aplicaciones
          <span className="ml-2 bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs">
            {getTabCount('applications')}
          </span>
          {activeTab === 'applications' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
          )}
        </button>
        
        <button
          onClick={() => changeTab('clients')}
          className={`flex items-center py-3 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'clients' 
              ? 'text-indigo-600 bg-indigo-50' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          <Building2 size={18} className="mr-2" />
          Clientes
          <span className="ml-2 bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs">
            {getTabCount('clients')}
          </span>
          {activeTab === 'clients' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
          )}
        </button>
        
        <button
          onClick={() => changeTab('users')}
          className={`flex items-center py-3 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'users' 
              ? 'text-indigo-600 bg-indigo-50' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          <Users size={18} className="mr-2" />
          Usuarios
          <span className="ml-2 bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs">
            {getTabCount('users')}
          </span>
          {activeTab === 'users' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
          )}
        </button>
      </div>
      
      {/* Search and filter bar */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder={`Buscar ${
              activeTab === 'applications' ? 'aplicaciones' : 
              activeTab === 'clients' ? 'clientes' : 'usuarios'
            }...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        
        {/* Filtro activo */}
        {(filters.selectedClient || filters.selectedApplication) && (
          <div className="flex items-center ml-4">
            <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-md flex items-center text-sm text-indigo-700">
              <Filter size={14} className="mr-1.5" />
              <span className="mr-1.5">
                {filters.selectedClient && 'Cliente: ' + (clients.find(c => c.id === filters.selectedClient)?.name || 'Desconocido')}
                {filters.selectedApplication && 'App: ' + (applications.find(a => a.id === filters.selectedApplication)?.name || 'Desconocida')}
              </span>
              <button 
                onClick={resetFilters} 
                className="hover:bg-indigo-100 rounded-full p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Content area */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div>
            {/* Contenido para Aplicaciones */}
            {activeTab === 'applications' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map(app => (
                    <div key={app.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                            <Layers size={20} className="text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">{app.name || 'Sin nombre'}</h3>
                            <p className="text-xs text-gray-500">ID: {app.id}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setFilters(prev => ({
                            ...prev,
                            selectedApplication: app.id
                          }))}
                          className="text-gray-400 hover:text-indigo-600 p-1 rounded-full hover:bg-gray-100"
                        >
                          <Filter size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    {searchTerm 
                      ? `No se encontraron aplicaciones con el término "${searchTerm}"` 
                      : 'No hay aplicaciones disponibles'}
                  </div>
                )}
              </div>
            )}
            
            {/* Contenido para Clientes */}
            {activeTab === 'clients' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.length > 0 ? (
                  filteredClients.map(client => {
                    const clientUsers = getUsersByClient(client.id);
                    return (
                      <div key={client.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                              <Building2 size={20} className="text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800">{client.name || 'Sin nombre'}</h3>
                              <p className="text-xs text-gray-500">
                                {clientUsers.length} {clientUsers.length === 1 ? 'usuario' : 'usuarios'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button 
                              onClick={() => selectClientFilter(client.id)}
                              className={`p-1 rounded-full ${
                                filters.selectedClient === client.id 
                                  ? 'bg-indigo-100 text-indigo-600' 
                                  : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100'
                              }`}
                            >
                              <Filter size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                selectClientFilter(client.id);
                                changeTab('users');
                              }}
                              className="text-gray-400 hover:text-indigo-600 p-1 rounded-full hover:bg-gray-100"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    {searchTerm 
                      ? `No se encontraron clientes con el término "${searchTerm}"` 
                      : 'No hay clientes disponibles'}
                  </div>
                )}
              </div>
            )}
            
            {/* Contenido para Usuarios */}
            {activeTab === 'users' && (
              <div>
                {filters.selectedClient && (
                  <div className="mb-4 pb-3 border-b border-gray-200">
                    <h3 className="font-medium text-gray-700 flex items-center">
                      <Building2 size={16} className="mr-2 text-indigo-600" />
                      Cliente: {clients.find(c => c.id === filters.selectedClient)?.name || 'Desconocido'}
                    </h3>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => {
                      // Encontrar el cliente al que pertenece este usuario
                      let userClient = null;
                      for (const [clientId, userIds] of Object.entries(clientUserRelations)) {
                        if (userIds.includes(user.id)) {
                          userClient = clients.find(c => c.id === clientId);
                          break;
                        }
                      }
                      
                      return (
                        <div key={user.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start">
                            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                              <Users size={20} className="text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800">{user.name || 'Sin nombre'}</h3>
                              <p className="text-xs text-gray-600">{user.email || 'Sin email'}</p>
                              {userClient && (
                                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-600">
                                  <Building2 size={12} className="mr-1" />
                                  {userClient.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                      {searchTerm 
                        ? `No se encontraron usuarios con el término "${searchTerm}"` 
                        : filters.selectedClient 
                          ? 'Este cliente no tiene usuarios asignados' 
                          : 'No hay usuarios disponibles'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}