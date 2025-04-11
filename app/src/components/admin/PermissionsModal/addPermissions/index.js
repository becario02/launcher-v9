import { useState, useEffect } from 'react';
import { Check, X, Search, Layers, Building2, Users, ChevronDown, Info } from 'lucide-react';

export default function AddPermissions({
  applications,
  clients,
  allUsers,
  permissions,
  setPermissions,
  clientUserRelations,
  allApplications,
  setAllApplications,
  allClients,
  setAllClients,
  allUsersSelected,
  setAllUsersSelected,
  expandedClients,
  setExpandedClients,
  onSavePermissions,
  handleCloseModal,
  assignedAudience
}) {
  const [saving, setSaving] = useState(false);
  const [appSearchTerm, setAppSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');  
  const [alreadyAssignedAppNames, setAlreadyAssignedAppNames] = useState({});
  const [alreadyAssignedClientNames, setAlreadyAssignedClientNames] = useState({});
  const [alreadyAssignedUserEmails, setAlreadyAssignedUserEmails] = useState({});
  
  useEffect(() => {
    console.log("assignedAudience en AddPermissions:", assignedAudience);
    
    if (assignedAudience) {
      const appNames = {};
      if (Array.isArray(assignedAudience.applications)) {
        assignedAudience.applications.forEach(app => {
          if (app && app.name) {
            appNames[app.name.toLowerCase()] = true;
          }
        });
      }
      console.log("Aplicaciones asignadas por nombre:", appNames);
      setAlreadyAssignedAppNames(appNames);
      
      const clientNames = {};
      if (Array.isArray(assignedAudience.clients)) {
        assignedAudience.clients.forEach(client => {
          if (client && client.name) {
            clientNames[client.name.toLowerCase()] = true;
          }
        });
      }
      console.log("Clientes asignados por nombre:", clientNames);
      setAlreadyAssignedClientNames(clientNames);
      
      const userEmails = {};
      if (Array.isArray(assignedAudience.users)) {
        assignedAudience.users.forEach(user => {
          if (user && user.email) {
            userEmails[user.email.toLowerCase()] = true;
          }
        });
      }
      console.log("Usuarios asignados por email:", userEmails);
      setAlreadyAssignedUserEmails(userEmails);
    }
  }, [assignedAudience]);
  
  const isAlreadyAssigned = (type, item) => {
    if (!item) return false;
    
    if (type === 'applications') {
      const name = item.name || '';
      return !!alreadyAssignedAppNames[name.toLowerCase()];
    } else if (type === 'clients') {
      const name = item.name || '';
      return !!alreadyAssignedClientNames[name.toLowerCase()];
    } else if (type === 'users') {
      const email = item.email || '';
      return !!alreadyAssignedUserEmails[email.toLowerCase()];
    }
    
    return false;
  };
  
  const handleSelectAllApplications = () => {
    const newValue = !allApplications;
    setAllApplications(newValue);
    
    const appsToSelect = applications.filter(app => 
      app && 
      (app.name || '').toLowerCase().includes((appSearchTerm || '').toLowerCase()) &&
      !isAlreadyAssigned('applications', app)
    );
    
    if (newValue) {
      setPermissions({
        ...permissions,
        applications: [
          ...new Set([
            ...(permissions.applications || []),
            ...appsToSelect.filter(app => app && app.id).map(app => app.id)
          ])
        ]
      });
    } else {
      const appIdsToRemove = new Set(appsToSelect.filter(app => app && app.id).map(app => app.id));
      setPermissions({
        ...permissions,
        applications: (permissions.applications || []).filter(id => !appIdsToRemove.has(id))
      });
    }
  };
  
  const handleSelectAllClients = () => {
    const newValue = !allClients;
    setAllClients(newValue);
    
    const clientsToSelect = clients.filter(client => 
      client && 
      (client.name || '').toLowerCase().includes((clientSearchTerm || '').toLowerCase()) &&
      !isAlreadyAssigned('clients', client)
    );
    
    if (newValue) {
      const newSelectedClients = [
        ...new Set([
          ...(permissions.clients || []),
          ...clientsToSelect.filter(client => client && client.id).map(client => client.id)
        ])
      ];
      
      setPermissions({
        ...permissions,
        clients: newSelectedClients
      });
    } else {
      const clientIdsToRemove = new Set(
        clientsToSelect.filter(client => client && client.id).map(client => client.id)
      );
      
      const newSelectedClients = (permissions.clients || [])
        .filter(id => !clientIdsToRemove.has(id));
      
      const validUserIds = new Set();
      newSelectedClients.forEach(clientId => {
        if (clientId && clientUserRelations[clientId]) {
          (clientUserRelations[clientId] || []).forEach(userId => {
            if (userId) validUserIds.add(userId);
          });
        }
      });
      
      const newSelectedUsers = (permissions.users || [])
        .filter(userId => userId && validUserIds.has(userId));
      
      setPermissions({
        ...permissions,
        clients: newSelectedClients,
        users: newSelectedUsers
      });
    }
  };
  
  const handleSelectAllUsers = () => {
    const newValue = !allUsersSelected;
    setAllUsersSelected(newValue);
    
    const availableUserIds = new Set();
    (permissions.clients || []).forEach(clientId => {
      if (clientId && clientUserRelations[clientId]) {
        (clientUserRelations[clientId] || []).forEach(userId => {
          const user = allUsers.find(u => u && u.id === userId);
          if (userId && user && !isAlreadyAssigned('users', user)) {
            availableUserIds.add(userId);
          }
        });
      }
    });
    
    const usersToSelect = allUsers.filter(user => 
      user && user.id && availableUserIds.has(user.id) && 
      (user.email || '').toLowerCase().includes((userSearchTerm || '').toLowerCase())
    );
    
    if (newValue) {
      setPermissions({
        ...permissions,
        users: [
          ...new Set([
            ...(permissions.users || []),
            ...usersToSelect.filter(user => user && user.id).map(user => user.id)
          ])
        ]
      });
    } else {
      const userIdsToRemove = new Set(
        usersToSelect.filter(user => user && user.id).map(user => user.id)
      );
      setPermissions({
        ...permissions,
        users: (permissions.users || []).filter(id => id && !userIdsToRemove.has(id))
      });
    }
  };
  
  const handleSelectClientUsers = (clientId, clientUsers) => {
    if (!clientUsers || !Array.isArray(clientUsers) || clientUsers.length === 0) return;
    
    // Filtrar usuarios ya asignados
    const selectableUsers = clientUsers.filter(user => 
      user && user.id && !isAlreadyAssigned('users', user)
    );
    
    if (selectableUsers.length === 0) return; // No hay usuarios para seleccionar
    
    // Verificar si todos los usuarios del cliente ya están seleccionados
    const allSelected = selectableUsers.every(user => 
      user && user.id && (permissions.users || []).includes(user.id)
    );
    
    // Obtener los IDs de los usuarios del cliente
    const clientUserIds = selectableUsers.filter(user => user && user.id).map(user => user.id);
    
    if (allSelected) {
      // Si todos están seleccionados, deseleccionarlos
      setPermissions({
        ...permissions,
        users: (permissions.users || []).filter(
          userId => !clientUserIds.includes(userId)
        )
      });
    } else {
      // Si no todos están seleccionados, seleccionar todos
      setPermissions({
        ...permissions,
        users: [...new Set([
          ...(permissions.users || []),
          ...clientUserIds
        ])]
      });
    }
  };
  
  // Manejar cambios individuales de permisos
  const handlePermissionChange = (type, id, item) => {
    if (!id) return;
    
    // Verificar si el elemento ya está asignado
    if (isAlreadyAssigned(type, item)) {
      return; // No permitir cambiar elementos ya asignados
    }
    
    const currentPermissions = [...(permissions[type] || [])];
    const index = currentPermissions.indexOf(id);
    
    if (index === -1) {
      currentPermissions.push(id);
    } else {
      currentPermissions.splice(index, 1);
    }
    
    const updatedPermissions = {
      ...permissions,
      [type]: currentPermissions
    };
    
    // Si se cambia un cliente, actualizar usuarios
    if (type === 'clients') {
      // Obtener usuarios válidos basados en los clientes seleccionados
      const validUserIds = new Set();
      updatedPermissions.clients.forEach(clientId => {
        if (clientId && clientUserRelations[clientId]) {
          (clientUserRelations[clientId] || []).forEach(userId => {
            if (userId) validUserIds.add(userId);
          });
        }
      });
      
      // Mantener solo usuarios válidos
      updatedPermissions.users = (updatedPermissions.users || [])
        .filter(userId => userId && validUserIds.has(userId));
    }
    
    setPermissions(updatedPermissions);
    
    // Actualizar estado "all" correspondiente
    if (type === 'applications') {
      const visibleApps = applications.filter(app => 
        app && (app.name || '').toLowerCase().includes((appSearchTerm || '').toLowerCase()) && 
        !isAlreadyAssigned('applications', app)
      );
      setAllApplications(
        visibleApps.length > 0 && 
        visibleApps.every(app => app && app.id && updatedPermissions.applications.includes(app.id))
      );
    } else if (type === 'clients') {
      const visibleClients = clients.filter(client => 
        client && (client.name || '').toLowerCase().includes((clientSearchTerm || '').toLowerCase()) && 
        !isAlreadyAssigned('clients', client)
      );
      setAllClients(
        visibleClients.length > 0 && 
        visibleClients.every(client => client && client.id && updatedPermissions.clients.includes(client.id))
      );
    } else if (type === 'users') {
      const availableUserIds = new Set();
      (permissions.clients || []).forEach(clientId => {
        if (clientId && clientUserRelations[clientId]) {
          (clientUserRelations[clientId] || []).forEach(userId => {
            const user = allUsers.find(u => u && u.id === userId);
            if (userId && user && !isAlreadyAssigned('users', user)) {
              availableUserIds.add(userId);
            }
          });
        }
      });
      
      const visibleUsers = allUsers.filter(user => 
        user && user.id && availableUserIds.has(user.id) && 
        (user.email || '').toLowerCase().includes((userSearchTerm || '').toLowerCase())
      );
      
      setAllUsersSelected(
        visibleUsers.length > 0 && 
        visibleUsers.every(user => user && user.id && updatedPermissions.users.includes(user.id))
      );
    }
  };
  
  // Función para expandir/colapsar un cliente
  const toggleClientExpanded = (clientId) => {
    setExpandedClients(prev => ({
      ...prev,
      [clientId]: prev[clientId] === false ? true : false
    }));
  };
  
  // Filtrar aplicaciones según búsqueda
  const filteredApplications = applications.filter(app => 
    app && (app.name || '').toLowerCase().includes((appSearchTerm || '').toLowerCase())
  );
  
  // Filtrar clientes según búsqueda
  const filteredClients = clients.filter(client => 
    client && (client.name || '').toLowerCase().includes((clientSearchTerm || '').toLowerCase())
  );
  
  // Obtener usuarios según clientes seleccionados y búsqueda
  const getClientUsers = (clientId) => {
    if (!clientId) return [];
    
    const userIds = clientUserRelations[clientId] || [];
    return allUsers.filter(user => 
      user && user.id && userIds.includes(user.id) && 
      (user.email || '').toLowerCase().includes((userSearchTerm || '').toLowerCase())
    );
  };
  
  const handleSave = async () => {
    setSaving(true);
    await onSavePermissions();
    setSaving(false);
  };

  return (
    <>
      {/* Content */}
      <div className="p-6 overflow-y-auto flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Aplicaciones */}
          <div className="bg-gray-1 rounded-xl p-4 border border-gray-2 flex flex-col">
            <div className="flex items-center mb-3">
              <Layers className="text-primary-blue mr-2" size={18} />
              <h3 className="font-medium text-gray-5 text-h3">APLICACIONES</h3>
            </div>
            
            {/* Buscador de aplicaciones */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Buscar aplicaciones..."
                value={appSearchTerm || ''}
                onChange={(e) => setAppSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border placeholder:text-primary-blue text-primary-blue border-gray-2 rounded-md text-p focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-blue" />
              {appSearchTerm && (
                <button
                  onClick={() => setAppSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-5"
                >
                  <X size={14} className='text-primary-blue ' />
                </button>
              )}
            </div>
            
            <div className="mb-2">
              <label className="flex items-center p-2 hover:bg-white rounded-lg cursor-pointer">
                <input 
                  type="checkbox"
                  className="h-4 w-4 rounded text-primary-blue focus:ring-primary-blue border-gray-2"
                  checked={allApplications}
                  onChange={handleSelectAllApplications}
                  disabled={!Array.isArray(filteredApplications) || filteredApplications.length === 0}
                />
                <span className="ml-2 text-p font-medium text-gray-5 hover:text-primary-blue">
                  {appSearchTerm 
                    ? `Todas las aplicaciones filtradas` 
                    : `Todas las aplicaciones`}
                </span>
              </label>
            </div>
            
            <div className="flex-grow overflow-y-auto max-h-[280px] px-1 py-2 bg-white rounded-lg border border-gray-2">
              {Array.isArray(filteredApplications) && filteredApplications.length > 0 ? (
                filteredApplications.map(app => app && app.id && (
                  <div 
                    key={app.id} 
                    className={`flex items-center p-2 mb-1 rounded-md transition-colors ${
                      isAlreadyAssigned('applications', app) ? "bg-gray-1" : "hover:bg-semantic-blue cursor-pointer"
                    }`}
                    title={isAlreadyAssigned('applications', app) ? "Esta aplicación ya tiene asignada esta noticia" : ""}
                  >
                    <input 
                      type="checkbox"
                      className={`h-4 w-4 rounded focus:ring-indigo-500 border-gray-300 ${
                        isAlreadyAssigned('applications', app) ? "text-green-500 opacity-70 cursor-not-allowed" : "text-primary-blue"
                      }`}
                      checked={isAlreadyAssigned('applications', app) || Array.isArray(permissions.applications) && permissions.applications.includes(app.id)}
                      onChange={() => handlePermissionChange('applications', app.id, app)}
                      disabled={isAlreadyAssigned('applications', app)}
                    />
                    <span className={`ml-2 text-p hover:text-white ${isAlreadyAssigned('applications', app) ? "text-gray-3" : "text-gray-5"}`}>
                      {app.name || 'Sin nombre'}
                    </span>
                    
                    {isAlreadyAssigned('applications', app) && (
                      <div className="ml-auto flex items-center text-p-small" title="Esta aplicación ya tiene asignada esta noticia">
                        <Info size={16} className="text-green-500" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-p text-gray-3 text-center py-4">
                  {appSearchTerm 
                    ? `No se encontraron resultados para "${appSearchTerm}"` 
                    : `No hay aplicaciones disponibles`}
                </p>
              )}
            </div>
          </div>
          
          {/* Clientes */}
          <div className="bg-gray-1 rounded-xl p-4 border border-gray-2 flex flex-col">
            <div className="flex items-center mb-3">
              <Building2 className="text-primary-blue mr-2" size={18} />
              <h3 className="font-medium text-gray-5 text-h3">CLIENTES</h3>
            </div>
            
            {/* Buscador de clientes */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={clientSearchTerm || ''}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 placeholder:text-primary-blue border text-primary-blue border-gray-2 rounded-md text-p focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-blue" />
              {clientSearchTerm && (
                <button
                  onClick={() => setClientSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-3 hover:text-gray-4"
                >
                  <X size={14} className='text-primary-blue' />
                </button>
              )}
            </div>
            
            <div className="mb-2">
              <label className="flex items-center p-2 hover:bg-white rounded-lg cursor-pointer">
                <input 
                  type="checkbox"
                  className="h-4 w-4 rounded text-primary-blue focus:ring-primary-blue border-gray-5"
                  checked={allClients}
                  onChange={handleSelectAllClients}
                  disabled={!Array.isArray(filteredClients) || filteredClients.length === 0}
                />
                <span className="ml-2 text-p font-medium text-gray-5 hover:text-primary-blue">
                  {clientSearchTerm 
                    ? `Todos los clientes filtrados` 
                    : `Todos los clientes`}
                </span>
              </label>
            </div>
            
            <div className="flex-grow overflow-y-auto max-h-[280px] px-1 py-2 bg-white rounded-lg border border-gray-2">
              {Array.isArray(filteredClients) && filteredClients.length > 0 ? (
                filteredClients.map(client => client && client.id && (
                  <div 
                    key={client.id} 
                    className={`flex items-center p-2 mb-1 rounded-md transition-colors ${
                      isAlreadyAssigned('clients', client) ? "bg-gray-1" : "hover:bg-gray-1 cursor-pointer"
                    }`}
                    title={isAlreadyAssigned('clients', client) ? "Este cliente ya tiene asignada esta noticia" : ""}
                  >
                    <input 
                      type="checkbox"
                      className={`h-4 w-4 rounded focus:ring-primary-blue border-gray-2 ${
                        isAlreadyAssigned('clients', client) ? "text-green-500 opacity-70 cursor-not-allowed" : "text-primary-blue"
                      }`}
                      checked={isAlreadyAssigned('clients', client) || Array.isArray(permissions.clients) && permissions.clients.includes(client.id)}
                      onChange={() => handlePermissionChange('clients', client.id, client)}
                      disabled={isAlreadyAssigned('clients', client)}
                    />
                    <span className={`ml-2 text-p ${isAlreadyAssigned('clients', client) ? "text-gray-3" : "text-gray-5"}`}>
                      {client.name || 'Cliente sin nombre'}
                    </span>
                    
                    {isAlreadyAssigned('clients', client) && (
                      <div className="ml-auto flex items-center" title="Este cliente ya tiene asignada esta noticia">
                        <Info size={16} className="text-green-500" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-p text-gray-3 text-center py-4">
                  {clientSearchTerm 
                    ? `No se encontraron resultados para "${clientSearchTerm}"` 
                    : `No hay clientes disponibles`}
                </p>
              )}
            </div>
          </div>
          
          {/* Usuarios */}
          <div className="bg-gray-1 rounded-xl p-4 border border-gray-2 flex flex-col">
            <div className="flex items-center mb-3">
              <Users className="text-primary-blue mr-2" size={18} />
              <h3 className="font-medium text-gray-5 text-h3">USUARIOS</h3>
            </div>
            
            {Array.isArray(permissions.clients) && permissions.clients.length > 0 ? (
              <>
                {/* Buscador de usuarios */}
                <div className="relative mb-3">
                  <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    value={userSearchTerm || ''}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-primary-blue placeholder:text-primary-blue border border-gray-200 rounded-md text-p focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-blue" />
                  {userSearchTerm && (
                    <button
                      onClick={() => setUserSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} className='text-primary-blue' />
                    </button>
                  )}
                </div>
                
                <div className="mb-2">
                  <label className="flex items-center p-2 hover:bg-white rounded-lg cursor-pointer">
                    <input 
                      type="checkbox"
                      className="h-4 w-4 rounded text-primary-blue focus:ring-primary-blue border-gray-3"
                      checked={allUsersSelected}
                      onChange={handleSelectAllUsers}
                    />
                    <span className="ml-2 text-p font-medium text-gray-5 hover:text-primary-blue">
                      {userSearchTerm 
                        ? `Todos los usuarios filtrados` 
                        : `Todos los usuarios`}
                    </span>
                  </label>
                </div>
                
                <div className="flex-grow overflow-y-auto max-h-[280px] px-1 py-2 bg-white rounded-lg border border-gray-1">
                  {permissions.clients.map(clientId => {
                    if (!clientId) return null;
                    
                    const clientUsers = getClientUsers(clientId);
                    
                    if (!Array.isArray(clientUsers) || clientUsers.length === 0) return null;
                    
                    const client = clients.find(c => c && c.id === clientId);
                    const clientName = client ? (client.name || 'Cliente sin nombre') : (clientId || 'Cliente sin ID');
                    
                    // Estado para controlar si este grupo está expandido o colapsado
                    const isExpanded = expandedClients[clientId] !== false;
                    
                    // Verificar si todos los usuarios de este cliente están seleccionados (excluyendo los ya asignados)
                    const selectableUsers = clientUsers.filter(user => !isAlreadyAssigned('users', user));
                    const allClientUsersSelected = selectableUsers.length > 0 && 
                      selectableUsers.every(user => 
                        user && user.id && Array.isArray(permissions.users) && permissions.users.includes(user.id)
                      );
                    
                    return (
                      <div key={clientId} className="mb-3">
                        {/* Encabezado del grupo de cliente con botón para colapsar/expandir */}
                        <div className="w-full bg-gray-1 rounded-md mb-1 flex flex-col">
                          <button 
                            onClick={() => toggleClientExpanded(clientId)}
                            className="w-full px-3 py-1.5 text-p font-medium text-gray-5 flex items-center justify-between hover:bg-gray-2 transition-colors"
                          >
                            <div className="flex items-center">
                              <Building2 size={14} className="mr-1.5 text-primary-blue" />
                              <span>{clientName}</span>
                              <span className="ml-2 text-xs text-gray-500">
                                ({clientUsers.length} {clientUsers.length === 1 ? 'usuario' : 'usuarios'})
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              {/* Icono para indicar expandido/colapsado */}
                              <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                <ChevronDown size={16} className="text-primary-blue" />
                              </div>
                            </div>
                          </button>
                          
                          {/* Checkbox para seleccionar todos los usuarios de este cliente */}
                          <div className="px-3 pb-1.5 flex justify-end">
                            <label 
                              className="flex items-center text-p-small"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="mr-1 text-gray-4">Seleccionar todos</span>
                              <input 
                                type="checkbox"
                                className="h-3.5 w-3.5 rounded text-primary-blue focus:ring-primary-blue border-gray-300"
                                checked={allClientUsersSelected}
                                onChange={() => handleSelectClientUsers(clientId, clientUsers)}
                                disabled={selectableUsers.length === 0}
                              />
                            </label>
                          </div>
                        </div>
                        
                        {/* Lista de usuarios de este cliente (mostrar solo si está expandido) */}
                        <div 
                          className={`pl-2 overflow-hidden transition-all duration-200 ${
                            isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          {clientUsers.map(user => user && user.id && (
                            <div 
                              key={user.id} 
                              className={`flex items-center p-2 mb-1 rounded-md transition-colors ${
                                isAlreadyAssigned('users', user) ? "bg-gray-50" : "hover:bg-gray-50 cursor-pointer"
                              }`}
                              title={isAlreadyAssigned('users', user) ? "Este usuario ya tiene asignada esta noticia" : ""}
                            >
                              <input 
                                type="checkbox"
                                className={`h-4 w-4 rounded focus:ring-primary-blue border-gray-3 ${
                                  isAlreadyAssigned('users', user) ? "text-green-500 opacity-70 cursor-not-allowed" : "text-primary-blue"
                                }`}
                                checked={isAlreadyAssigned('users', user) || Array.isArray(permissions.users) && permissions.users.includes(user.id)}
                                onChange={() => handlePermissionChange('users', user.id, user)}
                                disabled={isAlreadyAssigned('users', user)}
                              />
                              <span className={`ml-2 text-p ${isAlreadyAssigned('users', user) ? "text-gray-3" : "text-gray-5"} truncate`}>
                                {user.email || user.name || 'Usuario sin nombre'}
                              </span>
                              
                              {isAlreadyAssigned('users', user) && (
                                <div className="ml-auto flex items-center" title="Este usuario ya tiene asignada esta noticia">
                                  <Info size={16} className="text-green-500" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Mensaje cuando no hay resultados */}
                  {permissions.clients.every(clientId => 
                    !clientId || 
                    !getClientUsers(clientId) || 
                    !Array.isArray(getClientUsers(clientId)) || 
                    getClientUsers(clientId).length === 0
                  ) && (
                    <p className="text-sm text-gray-3 text-center py-4">
                      {userSearchTerm 
                        ? `No se encontraron resultados para "${userSearchTerm}"` 
                        : `No hay usuarios disponibles para los clientes seleccionados`}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-grow bg-gray-1 rounded-lg p-4 text-center flex items-center justify-center">
                <p className="text-p text-gray-4">
                  Selecciona al menos un cliente para ver los usuarios disponibles
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-6 py-4 bg-gray-1 border-t border-gray-2 flex justify-end gap-3 sticky bottom-0 z-10">
        <button 
          onClick={handleCloseModal}
          className="px-4 py-2 text-p text-semantic.red bg-white border border-semantic.red rounded-full transition-all duration-200 shadow-sm transform hover:-translate-y-0.5"
        >
          Cancelar
        </button>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-p text-white bg-primary-blue hover:from-primary-blue rounded-full transition-all duration-200 shadow-sm transform hover:-translate-y-0.5 hover:shadow-md flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />
              Guardando...
            </>
          ) : (
            <>
              <Check size={16} className="mr-1" />
              Guardar Permisos
            </>
          )}
        </button>
      </div>
    </>
  );
}