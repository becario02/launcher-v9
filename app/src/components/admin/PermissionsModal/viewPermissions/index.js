import { useState, useEffect } from 'react';
import { Search, X, Layers, Building2, Users, ChevronDown } from 'lucide-react';

export default function ViewAudience({ assignedAudience, handleCloseModal }) {
  // Estados para búsqueda
  const [appSearchTerm, setAppSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  // Estado para controlar qué clientes están expandidos
  const [expandedClients, setExpandedClients] = useState({});
  
  // Agrupar usuarios por cliente
  const [usersByClient, setUsersByClient] = useState({});
  
  // Procesar y agrupar usuarios por cliente al cargar datos
  useEffect(() => {
    if (assignedAudience && Array.isArray(assignedAudience.users)) {
      const groupedUsers = {};
      const expandedState = {};
      
      // Agrupar usuarios por cliente
      assignedAudience.users.forEach(user => {
        if (!user) return;
        
        const clientName = user.clientName || 'Sin cliente';
        const clientId = user.clientId || clientName;
        
        if (!groupedUsers[clientId]) {
          groupedUsers[clientId] = {
            clientName,
            clientId,
            users: []
          };
          // Inicializar todos los clientes como expandidos
          expandedState[clientId] = true;
        }
        
        groupedUsers[clientId].users.push(user);
      });
      
      setUsersByClient(groupedUsers);
      setExpandedClients(expandedState);
    }
  }, [assignedAudience]);
  
  // Función para expandir/colapsar un cliente
  const toggleClientExpanded = (clientId) => {
    setExpandedClients(prev => ({
      ...prev,
      [clientId]: prev[clientId] === false ? true : false
    }));
  };
  
  // Filtrar aplicaciones según búsqueda
  const filteredApplications = assignedAudience.applications?.filter(app => 
    app && (app.name || '').toLowerCase().includes((appSearchTerm || '').toLowerCase())
  ) || [];
  
  // Filtrar clientes según búsqueda
  const filteredClients = assignedAudience.clients?.filter(client => 
    client && (client.name || '').toLowerCase().includes((clientSearchTerm || '').toLowerCase())
  ) || [];
  
  // Filtrar usuarios por término de búsqueda
  const getFilteredUsers = () => {
    const filteredGroups = {};
    const searchTerm = (userSearchTerm || '').toLowerCase();
    
    Object.keys(usersByClient).forEach(clientId => {
      const clientGroup = usersByClient[clientId];
      
      // Filtrar usuarios de este cliente
      const filteredClientUsers = clientGroup.users.filter(user =>
        user && (
          (user.name || '').toLowerCase().includes(searchTerm) ||
          (user.email || '').toLowerCase().includes(searchTerm)
        )
      );
      
      // Solo incluir el grupo si hay usuarios filtrados
      if (filteredClientUsers.length > 0) {
        filteredGroups[clientId] = {
          ...clientGroup,
          users: filteredClientUsers
        };
      }
    });
    
    return filteredGroups;
  };
  
  const filteredUserGroups = getFilteredUsers();

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
              <span className="ml-2 bg-indigo-50 text-primary-blue text-p-small font-medium px-2 py-0.5 rounded-full">
                {filteredApplications.length}
              </span>
            </div>
            
            {/* Buscador de aplicaciones */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Buscar aplicaciones..."
                value={appSearchTerm || ''}
                onChange={(e) => setAppSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-primary-blue placeholder:text-primary-blue border border-gray-2 rounded-md text-p focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-blue" />
              {appSearchTerm && (
                <button
                  onClick={() => setAppSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-2 hover:text-gray-4"
                >
                  <X size={14} className='text-primary-blue'/>
                </button>
              )}
            </div>
            
            <div className="flex-grow overflow-y-auto max-h-[280px] px-1 py-2 bg-white rounded-lg border border-gray-2">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-2 mb-1 hover:bg-gray-1 rounded-md transition-colors"
                  >
                    <div className="bg-indigo-50 p-2 rounded-md mr-3 flex-shrink-0">
                      <Layers size={16} className="text-primary-blue" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-p font-medium text-gray-5">{app.name || 'Sin nombre'}</p>
                      {app.count > 0 && (
                        <p className="text-p-small text-gray-3">{app.count} asignaciones</p>
                      )}
                    </div>
                    <div className="ml-2 w-2 h-2 rounded-full bg-green-500 flex-shrink-0" title="Asignado"></div>
                  </div>
                ))
              ) : (
                <p className="text-p text-primary-blue text-center py-4">
                  {appSearchTerm 
                    ? `No se encontraron aplicaciones con "${appSearchTerm}"` 
                    : 'No hay aplicaciones asignadas'}
                </p>
              )}
            </div>
          </div>
          
          {/* Clientes */}
          <div className="bg-gray-1 rounded-xl p-4 border border-gray-2 flex flex-col">
            <div className="flex items-center mb-3">
              <Building2 className="text-primary-blue mr-2" size={18} />
              <h3 className="font-medium text-gray-5 text-h3">CLIENTES</h3>
              <span className="ml-2 bg-indigo-50 text-primary-blue text-p-small font-medium px-2 py-0.5 rounded-full">
                {filteredClients.length}
              </span>
            </div>
            
            {/* Buscador de clientes */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={clientSearchTerm || ''}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-2 rounded-md text-p focus:outline-none focus:ring-2 focus:ring-primary-blue placeholder:text-primary-blue text-primary-blue"
              />
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-blue" />
              {clientSearchTerm && (
                <button
                  onClick={() => setClientSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-3 hover:text-gray-4"
                >
                  <X size={14} className='text-primary-blue'/>
                </button>
              )}
            </div>
            
            <div className="flex-grow overflow-y-auto max-h-[280px] px-1 py-2 bg-white rounded-lg border border-gray-2">
              {filteredClients.length > 0 ? (
                filteredClients.map((client, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-2 mb-1 hover:bg-gray-1 rounded-md transition-colors"
                  >
                    <div className="bg-indigo-100 p-2 rounded-md mr-3 flex-shrink-0">
                      <Building2 size={16} className="text-primary-blue" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-p font-medium text-gray-5">{client.name || 'Sin nombre'}</p>
                      <p className="text-p-small text-gray-3">
                        {client.userCount} {client.userCount === 1 ? 'usuario' : 'usuarios'}
                      </p>
                    </div>
                    <div className="ml-2 w-2 h-2 rounded-full bg-green-500 flex-shrink-0" title="Asignado"></div>
                  </div>
                ))
              ) : (
                <p className="text-p text-primary-blue text-center py-4">
                  {clientSearchTerm 
                    ? `No se encontraron clientes con "${clientSearchTerm}"` 
                    : 'No hay clientes asignados'}
                </p>
              )}
            </div>
          </div>
          
          {/* Usuarios */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col">
            <div className="flex items-center mb-3">
              <Users className="text-indigo-600 mr-2" size={18} />
              <h3 className="font-medium text-gray-700">USUARIOS</h3>
              <span className="ml-2 bg-indigo-50 text-indigo-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {Object.values(filteredUserGroups).reduce((total, group) => total + group.users.length, 0)}
              </span>
            </div>
            
            {/* Buscador de usuarios */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={userSearchTerm || ''}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-2 rounded-md text-p focus:outline-none focus:ring-2 focus:ring-primary-blue placeholder:text-primary-blue text-primary-blue"
              />
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-blue" />
              {userSearchTerm && (
                <button
                  onClick={() => setUserSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-3 hover:text-gray-4"
                >
                  <X size={14} className='text-primary-blue' />
                </button>
              )}
            </div>
            
            <div className="flex-grow overflow-y-auto max-h-[280px] px-1 py-2 bg-white rounded-lg border border-gray-2">
              {Object.keys(filteredUserGroups).length > 0 ? (
                Object.keys(filteredUserGroups).map(clientId => {
                  const clientGroup = filteredUserGroups[clientId];
                  const isExpanded = expandedClients[clientId] !== false;
                  
                  return (
                    <div key={clientId} className="mb-3">
                      {/* Encabezado del grupo de cliente con botón para colapsar/expandir */}
                      <div className="w-full bg-gray-1 rounded-md mb-1">
                        <button 
                          onClick={() => toggleClientExpanded(clientId)}
                          className="w-full px-3 py-1.5 text-p font-medium text-gray-5 flex items-center justify-between hover:bg-gray-2 transition-colors"
                        >
                          <div className="flex items-center">
                            <Building2 size={14} className="mr-1.5 text-primary-blue" />
                            <span>{clientGroup.clientName}</span>
                            <span className="ml-2 text-p-small text-gray-3">
                              ({clientGroup.users.length} {clientGroup.users.length === 1 ? 'usuario' : 'usuarios'})
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            {/* Icono para indicar expandido/colapsado */}
                            <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                              <ChevronDown size={16} className="text-primary-blue" />
                            </div>
                          </div>
                        </button>
                      </div>
                      
                      {/* Lista de usuarios de este cliente (mostrar solo si está expandido) */}
                      <div 
                        className={`pl-2 overflow-hidden transition-all duration-200 ${
                          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        {clientGroup.users.map((user, index) => (
                          <div 
                            key={index} 
                            className="flex items-center p-2 mb-1 hover:bg-gray-1 rounded-md transition-colors"
                          >
                            <div className="bg-indigo-100 p-2 rounded-md mr-3 flex-shrink-0">
                              <Users size={14} className="text-primary-blue" />
                            </div>
                            <div className="flex-grow">
                              <p className="text-p font-medium text-gray-5">{user.name || 'Sin nombre'}</p>
                              <p className="text-p-small text-gray-3 truncate">{user.email || 'Sin email'}</p>
                            </div>
                            <div className="ml-2 w-2 h-2 rounded-full bg-green-500 flex-shrink-0" title="Asignado"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-p text-primary-blue text-center py-4">
                  {userSearchTerm 
                    ? `No se encontraron usuarios con "${userSearchTerm}"` 
                    : 'No hay usuarios asignados'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-6 py-4 bg-gray-1 border-t border-gray-2 flex justify-between sticky bottom-0 z-10">
        <div className="text-p text-gray-4">
          {assignedAudience.rawData?.length > 0 ? (
            <span>
              {assignedAudience.applications?.length || 0} aplicaciones, {assignedAudience.clients?.length || 0} clientes, {assignedAudience.users?.length || 0} usuarios asignados
            </span>
          ) : (
            <span>No hay audiencia asignada a esta noticia</span>
          )}
        </div>
        
        <button 
          onClick={handleCloseModal}
          className="px-4 py-2 text-p text-semantic.red bg-white border border-semantic.red rounded-full transition-all duration-200 shadow-sm transform hover:-translate-y-0.5"
        >
          Cerrar
        </button>
      </div>
    </>
  );
}