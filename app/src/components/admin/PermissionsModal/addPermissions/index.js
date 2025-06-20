import { useState, useEffect } from 'react';
import { Check, X, Search, Layers, Building2, Users, ChevronDown, Info, AlertCircle } from 'lucide-react';

// ✅ Componente Skeleton para estado de carga
const SkeletonLoader = () => {
  return (
    <div className="p-6 flex-grow overflow-y-auto bg-gray-100 dark:bg-gray-7">
      {/* Skeleton del mensaje informativo */}
      <div className="mb-6 mx-auto max-w-4xl">
        <div className="flex items-center p-4 bg-gray-200 border border-gray-300 rounded-lg dark:bg-gray-6 dark:border-gray-5 animate-pulse">
          <div className="flex-shrink-0 w-5 h-5 bg-gray-300 rounded dark:bg-gray-5"></div>
          <div className="ml-3 flex-1">
            <div className="h-4 bg-gray-300 rounded dark:bg-gray-5 w-3/4"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Skeleton Aplicaciones */}
        <div className="flex flex-col p-4 bg-white border border-gray-200 rounded-xl dark:bg-gray-6 dark:border-gray-6">
          <div className="flex items-center mb-3">
            <div className="w-5 h-5 bg-gray-300 rounded mr-2 animate-pulse dark:bg-gray-5"></div>
            <div className="h-5 bg-gray-300 rounded w-32 animate-pulse dark:bg-gray-5"></div>
          </div>
          
          {/* Skeleton search input */}
          <div className="relative mb-3">
            <div className="w-full h-10 bg-gray-200 rounded-md animate-pulse dark:bg-gray-5"></div>
          </div>
          
          {/* Skeleton checkbox "todos" */}
          <div className="flex items-center mb-2 p-2">
            <div className="w-4 h-4 bg-gray-300 rounded animate-pulse dark:bg-gray-5"></div>
            <div className="ml-2 h-4 bg-gray-300 rounded w-40 animate-pulse dark:bg-gray-5"></div>
          </div>
          
          {/* Skeleton lista */}
          <div className="flex-grow p-1 bg-white border border-gray-200 rounded-lg dark:bg-gray-7 dark:border-gray-6 max-h-[280px]">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center p-2 mb-1">
                <div className="w-4 h-4 bg-gray-300 rounded animate-pulse dark:bg-gray-5"></div>
                <div className="ml-2 h-4 bg-gray-300 rounded flex-1 animate-pulse dark:bg-gray-5"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton Clientes */}
        <div className="flex flex-col p-4 bg-white border border-gray-200 rounded-xl dark:bg-gray-6 dark:border-gray-6">
          <div className="flex items-center mb-3">
            <div className="w-5 h-5 bg-gray-300 rounded mr-2 animate-pulse dark:bg-gray-5"></div>
            <div className="h-5 bg-gray-300 rounded w-24 animate-pulse dark:bg-gray-5"></div>
          </div>
          
          <div className="relative mb-3">
            <div className="w-full h-10 bg-gray-200 rounded-md animate-pulse dark:bg-gray-5"></div>
          </div>
          
          <div className="flex items-center mb-2 p-2">
            <div className="w-4 h-4 bg-gray-300 rounded animate-pulse dark:bg-gray-5"></div>
            <div className="ml-2 h-4 bg-gray-300 rounded w-36 animate-pulse dark:bg-gray-5"></div>
          </div>
          
          <div className="flex-grow p-1 bg-white border border-gray-200 rounded-lg dark:bg-gray-7 dark:border-gray-6 max-h-[280px]">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center p-2 mb-1">
                <div className="w-4 h-4 bg-gray-300 rounded animate-pulse dark:bg-gray-5"></div>
                <div className="ml-2 h-4 bg-gray-300 rounded flex-1 animate-pulse dark:bg-gray-5"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skeleton Footer */}
      <div className="sticky bottom-0 z-10 flex justify-end gap-3 px-6 py-4 bg-gray-100 border-t border-gray-200 dark:bg-gray-7 dark:border-gray-6">
        <div className="h-10 w-24 bg-gray-300 rounded-full animate-pulse dark:bg-gray-5"></div>
        <div className="h-10 w-36 bg-gray-300 rounded-full animate-pulse dark:bg-gray-5"></div>
      </div>
    </div>
  );
};

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
  assignedAudience,
  isDark,
  isLoading = false // ✅ Nueva prop para controlar el loading
}) {
  const [saving, setSaving] = useState(false);
  const [appSearchTerm, setAppSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');  
  const [alreadyAssignedAppNames, setAlreadyAssignedAppNames] = useState({});
  const [alreadyAssignedClientNames, setAlreadyAssignedClientNames] = useState({});
  const [alreadyAssignedUserEmails, setAlreadyAssignedUserEmails] = useState({});
  
  const [validationError, setValidationError] = useState('');
  const [showValidationMessage, setShowValidationMessage] = useState(false);

  useEffect(() => {
    if (assignedAudience) {
      const appNames = {};
      if (Array.isArray(assignedAudience.applications)) {
        assignedAudience.applications.forEach(app => {
          if (app && app.name) {
            appNames[app.name.toLowerCase()] = true;
          }
        });
      }
      setAlreadyAssignedAppNames(appNames);
      
      const clientNames = {};
      if (Array.isArray(assignedAudience.clients)) {
        assignedAudience.clients.forEach(client => {
          if (client && client.name) {
            clientNames[client.name.toLowerCase()] = true;
          }
        });
      }
      setAlreadyAssignedClientNames(clientNames);
      
      const userEmails = {};
      if (Array.isArray(assignedAudience.users)) {
        assignedAudience.users.forEach(user => {
          if (user && user.email) {
            userEmails[user.email.toLowerCase()] = true;
          }
        });
      }
      setAlreadyAssignedUserEmails(userEmails);
    }
  }, [assignedAudience]);

  // ✅ Si está cargando, mostrar skeleton
  if (isLoading) {
    return <SkeletonLoader />;
  }

  const validatePermissions = () => {
    const hasApplications = permissions.applications && permissions.applications.length > 0;
    const hasClients = permissions.clients && permissions.clients.length > 0;
    const hasUsers = permissions.users && permissions.users.length > 0;
    
    if (!hasApplications) {
      return {
        isValid: false,
        message: 'Debe seleccionar al menos una aplicación para continuar'
      };
    }
    
    if (!hasClients && !hasUsers) {
      return {
        isValid: false,
        message: 'Debe seleccionar al menos un cliente o usuario para continuar'
      };
    }
    
    return {
      isValid: true,
      message: ''
    };
  };

  const isFormValid = () => {
    return validatePermissions().isValid;
  };

  const showTemporaryValidationMessage = (message) => {
    setValidationError(message);
    setShowValidationMessage(true);
    setTimeout(() => {
      setShowValidationMessage(false);
    }, 4000);
  };
  
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
    
      const newUserIds = new Set(permissions.users || []);
      newSelectedClients.forEach(clientId => {
        if (clientUserRelations[clientId]) {
          clientUserRelations[clientId].forEach(userId => {
            if (userId) newUserIds.add(userId);
          });
        }
      });
    
      setPermissions({
        ...permissions,
        clients: newSelectedClients,
        users: Array.from(newUserIds)
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
    
    const selectableUsers = clientUsers.filter(user => 
      user && user.id && !isAlreadyAssigned('users', user)
    );
    
    if (selectableUsers.length === 0) return;
    
    const allSelected = selectableUsers.every(user => 
      user && user.id && (permissions.users || []).includes(user.id)
    );
    
    const clientUserIds = selectableUsers.filter(user => user && user.id).map(user => user.id);
    
    if (allSelected) {
      setPermissions({
        ...permissions,
        users: (permissions.users || []).filter(
          userId => !clientUserIds.includes(userId)
        )
      });
    } else {
      setPermissions({
        ...permissions,
        users: [...new Set([
          ...(permissions.users || []),
          ...clientUserIds
        ])]
      });
    }
  };
  
  const handlePermissionChange = (type, id, item) => {
    if (!id) return;
    
    if (isAlreadyAssigned(type, item)) {
      return;
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
    
    if (type === 'clients') {
      const validUserIds = new Set();
      
      updatedPermissions.clients.forEach(clientId => {
        if (clientId && clientUserRelations[clientId]) {
          clientUserRelations[clientId].forEach(userId => {
            if (userId) validUserIds.add(userId);
          });
        }
      });
    
      updatedPermissions.users = Array.from(validUserIds);
    }    
    
    setPermissions(updatedPermissions);
    
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
  
  const toggleClientExpanded = (clientId) => {
    setExpandedClients(prev => ({
      ...prev,
      [clientId]: prev[clientId] === false ? true : false
    }));
  };
  
  const filteredApplications = applications.filter(app => 
    app && (app.name || '').toLowerCase().includes((appSearchTerm || '').toLowerCase())
  );
  
  const filteredClients = clients.filter(client => 
    client && (client.name || '').toLowerCase().includes((clientSearchTerm || '').toLowerCase())
  );
  
  const getClientUsers = (clientId) => {
    if (!clientId) return [];
    
    const userIds = clientUserRelations[clientId] || [];
    return allUsers.filter(user => 
      user && user.id && userIds.includes(user.id) && 
      (user.email || '').toLowerCase().includes((userSearchTerm || '').toLowerCase())
    );
  };

  const handleSave = async () => {
    const validation = validatePermissions();
    
    if (!validation.isValid) {
      showTemporaryValidationMessage(validation.message);
      return;
    }
    
    setSaving(true);
    try {
      await onSavePermissions();
    } catch (error) {
      console.error('Error al guardar permisos:', error);
      showTemporaryValidationMessage('Error al guardar los permisos. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* ✅ Overlay de guardado - solo se muestra cuando está guardando */}
      {saving && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
              Guardando permisos...
            </p>
          </div>
        </div>
      )}

      <div className={`p-6 flex-grow overflow-y-auto bg-gray-100 dark:bg-gray-7 ${saving ? 'pointer-events-none' : ''}`}>
        {showValidationMessage && (
          <div className="mb-4 mx-auto max-w-4xl">
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-600 dark:text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                  {validationError}
                </p>
              </div>
              <button
                onClick={() => setShowValidationMessage(false)}
                className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <div className="mb-6 mx-auto max-w-4xl">
          <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
            <Info className="flex-shrink-0 w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div className="ml-3">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <span className="font-medium">Campos requeridos:</span> Debe seleccionar al menos una aplicación y un cliente o usuario para guardar los permisos.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Aplicaciones */}
          <div className="flex flex-col p-4 bg-white border border-gray-200 rounded-xl dark:bg-gray-6 dark:border-gray-6">
            <div className="flex items-center mb-3">
              <Layers size={18} className="mr-2 text-primary" />
              <h3 className="text-h3 font-medium text-gray-700 dark:text-gray-2">
                APLICACIONES
                <span className="text-red-500 ml-1">*</span>
              </h3>
            </div>
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Buscar aplicaciones..."
                value={appSearchTerm}
                onChange={e => setAppSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-md text-p bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:bg-gray-7 dark:text-white dark:placeholder-gray-3 dark:border-gray-6"
              />
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-blue dark:text-gray-3" />
              {appSearchTerm && (
                <button
                  onClick={() => setAppSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-4 dark:hover:text-gray-2"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <label className="flex items-center mb-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-6">
              <input
                type="checkbox"
                checked={allApplications}
                onChange={handleSelectAllApplications}
                disabled={!filteredApplications?.length}
                className="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue dark:bg-gray-7 dark:border-gray-6"
              />
              <span className="ml-2 text-p font-medium text-gray-700 dark:text-gray-2 hover:text-primary-blue">
                {appSearchTerm ? 'Todas las aplicaciones filtradas' : 'Todas las aplicaciones'}
              </span>
            </label>
            <div className="flex-grow overflow-y-auto p-1 bg-white border border-gray-200 rounded-lg dark:bg-gray-7 dark:border-gray-6 max-h-[280px]">
              {filteredApplications?.length ? (
                filteredApplications.map(app => (
                  <div
                    key={app.id}
                    className={`flex items-center p-2 mb-1 rounded-md transition-colors ${
                      isAlreadyAssigned('applications', app)
                        ? 'bg-gray-50 dark:bg-gray-6'
                        : 'hover:bg-gray-1 dark:hover:bg-gray-5 cursor-pointer'
                    }`}
                    title={isAlreadyAssigned('applications', app) ? 'Ya asignada' : undefined}
                  >
                    <input
                      type="checkbox"
                      checked={
                        isAlreadyAssigned('applications', app) ||
                        permissions.applications?.includes(app.id)
                      }
                      disabled={isAlreadyAssigned('applications', app)}
                      onChange={() => handlePermissionChange('applications', app.id, app)}
                      className={`w-4 h-4 rounded ${
                        isAlreadyAssigned('applications', app)
                          ? 'text-green-500 opacity-70 cursor-not-allowed'
                          : 'text-primary-blue'
                      } focus:ring-primary-blue`}
                    />
                    <span
                      className={`ml-2 text-p truncate ${
                        isAlreadyAssigned('applications', app)
                          ? 'text-gray-400 dark:text-gray-3'
                          : 'text-gray-700 dark:text-gray-2'
                      }`}
                    >
                      {app.name}
                    </span>
                    {isAlreadyAssigned('applications', app) && (
                      <Info size={16} className="ml-auto text-green-500" />
                    )}
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-p text-gray-500 dark:text-gray-3">
                  {appSearchTerm
                    ? `No se encontraron resultados para "${appSearchTerm}"`
                    : 'No hay aplicaciones disponibles'}
                </p>
              )}
            </div>
          </div>

          {/* Clientes */}
          <div className="flex flex-col p-4 bg-white border border-gray-200 rounded-xl dark:bg-gray-6 dark:border-gray-6">
            <div className="flex items-center mb-3">
              <Building2 size={18} className="mr-2 text-primary" />
              <h3 className="text-h3 font-medium text-gray-700 dark:text-gray-2">
                CLIENTES
                <span className="text-red-500 ml-1">*</span>
              </h3>
            </div>
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={clientSearchTerm}
                onChange={e => setClientSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-md text-p bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:bg-gray-7 dark:text-white dark:placeholder-gray-3 dark:border-gray-6"
              />
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-blue dark:text-gray-3" />
              {clientSearchTerm && (
                <button
                  onClick={() => setClientSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-4 dark:hover:text-gray-2"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <label className="flex items-center mb-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-6">
              <input
                type="checkbox"
                checked={allClients}
                onChange={handleSelectAllClients}
                disabled={!filteredClients?.length}
                className="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue dark:bg-gray-7 dark:border-gray-6"
              />
              <span className="ml-2 text-p font-medium text-gray-700 dark:text-gray-2 hover:text-primary-blue">
                {clientSearchTerm ? 'Todos los clientes filtrados' : 'Todos los clientes'}
              </span>
            </label>
            <div className="flex-grow overflow-y-auto p-1 bg-white border border-gray-200 rounded-lg dark:bg-gray-7 dark:border-gray-6 max-h-[280px]">
              {filteredClients?.length ? (
                filteredClients.map(client => (
                  <div
                    key={client.id}
                    className={`flex items-center p-2 mb-1 rounded-md transition-colors ${
                      isAlreadyAssigned('clients', client)
                        ? 'bg-gray-50 dark:bg-gray-6'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-6 cursor-pointer'
                    }`}
                    title={isAlreadyAssigned('clients', client) ? 'Ya asignado' : undefined}
                  >
                    <input
                      type="checkbox"
                      checked={
                        isAlreadyAssigned('clients', client) ||
                        permissions.clients?.includes(client.id)
                      }
                      disabled={isAlreadyAssigned('clients', client)}
                      onChange={() => handlePermissionChange('clients', client.id, client)}
                      className={`w-4 h-4 rounded ${
                        isAlreadyAssigned('clients', client)
                          ? 'text-green-500 opacity-70 cursor-not-allowed'
                          : 'text-primary-blue'
                      } focus:ring-primary-blue`}
                    />
                    <span
                      className={`ml-2 text-p truncate ${
                        isAlreadyAssigned('clients', client)
                          ? 'text-gray-400 dark:text-gray-3'
                          : 'text-gray-700 dark:text-gray-2'
                      }`}
                    >
                      {client.name}
                    </span>
                    {isAlreadyAssigned('clients', client) && (
                      <Info size={16} className="ml-auto text-green-500" />
                    )}
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-p text-gray-500 dark:text-gray-3">
                  {clientSearchTerm
                    ? `No se encontraron resultados para "${clientSearchTerm}"`
                    : 'No hay clientes disponibles'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`sticky bottom-0 z-10 flex justify-end gap-3 px-6 py-4 bg-gray-100 border-t border-gray-200 dark:bg-gray-7 dark:border-gray-6 ${saving ? 'pointer-events-none' : ''}`}>
        <button
          onClick={handleCloseModal}
          disabled={saving}
          className={`px-4 py-2 text-p border rounded-full text-semantic.red bg-white border-semantic.red transition-all duration-200 shadow-sm transform dark:bg-gray-6 dark:text-semantic.red dark:border-semantic.red ${
            saving 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-50 hover:-translate-y-0.5 dark:hover:bg-gray-5'
          }`}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !isFormValid()}
          className={`flex items-center px-4 py-2 text-p text-white rounded-full transition-all duration-200 shadow-sm transform ${
            saving || !isFormValid() 
              ? 'bg-gray-400 cursor-not-allowed opacity-70' 
              : 'bg-primary hover:shadow-md hover:-translate-y-0.5'
          } dark:bg-primary`}
        >
          {saving ? (
            <>
              <span className="w-3 h-3 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Check size={16} className="mr-1" /> Guardar Permisos
            </>
          )}
        </button>
      </div>
    </>
  );
}