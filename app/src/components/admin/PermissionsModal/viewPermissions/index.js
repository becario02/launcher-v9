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
      <div className="p-6 overflow-y-auto flex-grow bg-white dark:bg-gray-7">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Aplicaciones */}
          <div className="bg-gray-1 dark:bg-gray-6 rounded-xl p-4 border border-gray-2 dark:border-gray-6 flex flex-col">
            <div className="flex items-center mb-3">
              <Layers className="text-primary mr-2" size={18} />
              <h3 className="font-medium text-gray-5 dark:text-gray-2 text-h3">APLICACIONES</h3>
              <span className="ml-2 bg-indigo-50 dark:bg-blue-900 dark:bg-opacity-20 text-primary-blue text-p-small font-medium px-2 py-0.5 rounded-full">
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
                className="w-full pl-9 pr-3 py-2 border-gray-2 dark:border-gray-6 text-primary-blue dark:text-white placeholder:text-primary-blue dark:placeholder:text-gray-3 bg-white dark:bg-gray-7 border rounded-md text-p focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-blue dark:text-gray-3" />
              {appSearchTerm && (
                <button
                  onClick={() => setAppSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-2 hover:text-gray-4 dark:text-gray-4 dark:hover:text-gray-2"
                >
                  <X size={14} className="text-primary-blue dark:text-gray-3" />
                </button>
              )}
            </div>
            
            <div className="flex-grow overflow-y-auto max-h-[280px] px-1 py-2 bg-white dark:bg-gray-7 rounded-lg border border-gray-2 dark:border-gray-6">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-2 mb-1 hover:bg-gray-1 dark:hover:bg-gray-6 rounded-md transition-colors"
                  >
                    <div className="bg-indigo-100 dark:bg-gray-2 dark:bg-opacity-20 p-2 rounded-md mr-3 flex-shrink-0">
                      <Layers size={16} className="text-primary" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-p font-medium text-gray-5 dark:text-gray-2">{app.name || 'Sin nombre'}</p>
                      {app.count > 0 && (
                        <p className="text-p-small text-gray-3">{app.count} asignaciones</p>
                      )}
                    </div>
                    <div className="ml-2 w-2 h-2 rounded-full bg-green-500 flex-shrink-0" title="Asignado"></div>
                  </div>
                ))
              ) : (
                <p className="text-p text-primary-blue dark:text-gray-3 text-center py-4">
                  {appSearchTerm 
                    ? `No se encontraron aplicaciones con "${appSearchTerm}"` 
                    : 'No hay aplicaciones asignadas'}
                </p>
              )}
            </div>
          </div>
          
          {/* Clientes */}
          <div className="bg-gray-1 dark:bg-gray-6 rounded-xl p-4 border border-gray-2 dark:border-gray-6 flex flex-col">
            <div className="flex items-center mb-3">
              <Building2 className="text-primary mr-2" size={18} />
              <h3 className="font-medium text-gray-5 dark:text-gray-2 text-h3">CLIENTES</h3>
              <span className="ml-2 bg-indigo-50 dark:bg-blue-900 dark:bg-opacity-20 text-primary-blue text-p-small font-medium px-2 py-0.5 rounded-full">
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
                className="w-full pl-9 pr-3 py-2 border-gray-2 dark:border-gray-6 text-primary-blue dark:text-white placeholder:text-primary-blue dark:placeholder:text-gray-3 bg-white dark:bg-gray-7 border rounded-md text-p focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-blue dark:text-gray-3" />
              {clientSearchTerm && (
                <button
                  onClick={() => setClientSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-3 hover:text-gray-4 dark:text-gray-4 dark:hover:text-gray-2"
                >
                  <X size={14} className="text-primary-blue dark:text-gray-3" />
                </button>
              )}
            </div>
            
            <div className="flex-grow overflow-y-auto max-h-[280px] px-1 py-2 bg-white dark:bg-gray-7 rounded-lg border border-gray-2 dark:border-gray-6">
              {filteredClients.length > 0 ? (
                filteredClients.map((client, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-2 mb-1 hover:bg-gray-1 dark:hover:bg-gray-6 rounded-md transition-colors"
                  >
                    <div className="bg-indigo-100 dark:bg-gray-2 dark:bg-opacity-20 p-2 rounded-md mr-3 flex-shrink-0">
                      <Building2 size={16} className="text-primary" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-p font-medium text-gray-5 dark:text-gray-2">{client.name || 'Sin nombre'}</p>
                      <p className="text-p-small text-gray-3">
                        {client.userCount} {client.userCount === 1 ? 'usuario' : 'usuarios'}
                      </p>
                    </div>
                    <div className="ml-2 w-2 h-2 rounded-full bg-green-500 flex-shrink-0" title="Asignado"></div>
                  </div>
                ))
              ) : (
                <p className="text-p text-primary-blue dark:text-gray-3 text-center py-4">
                  {clientSearchTerm 
                    ? `No se encontraron clientes con "${clientSearchTerm}"` 
                    : 'No hay clientes asignados'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-6 py-4 bg-gray-1 dark:bg-gray-7 border-t border-gray-2 dark:border-gray-6 flex justify-between sticky bottom-0 z-10">
        <div className="text-p text-gray-4 dark:text-gray-3">
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
          className="px-4 py-2 text-p text-primary dark:text-primary bg-white dark:bg-gray-7 border-primary dark:border-primary hover:bg-semantic-r dark:hover:bg-gray-6 border rounded-full transition-all duration-200 shadow-sm transform hover:-translate-y-0.5">
          Cerrar
        </button>
      </div>
    </>
  );
}