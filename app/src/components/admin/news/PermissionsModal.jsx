'use client';

import { useState, useEffect } from 'react';
import { X, Users, PlusCircle, Eye } from 'lucide-react';
import { newsPermissionsService } from '@/services/newsPermissionsService';
import AddPermissions from '../PermissionsModal/addPermissions';
import ViewAudience from '../PermissionsModal/viewPermissions';
import { useTheme } from '@/context/ThemeContext';

export default function PermissionsModal({
  isOpen,
  newsId,
  handleCloseModal,
  handleSavePermissions
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Vista actual ('add' o 'view')
  const [viewMode, setViewMode] = useState('add');
  const [loading, setLoading] = useState(true);
  
  // Datos de permisos y audiencia
  const [permissions, setPermissions] = useState({ applications: [], clients: [], users: [] });
  const [assignedAudience, setAssignedAudience] = useState({ applications: [], clients: [], users: [], rawData: [] });
  
  // Catálogos
  const [applications, setApplications] = useState([]);
  const [clients, setClients] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [clientUserRelations, setClientUserRelations] = useState({});
  
  // "Seleccionar todo"
  const [allApplications, setAllApplications] = useState(false);
  const [allClients, setAllClients] = useState(false);
  const [allUsersSelected, setAllUsersSelected] = useState(false);
  
  // Clientes expandidos
  const [expandedClients, setExpandedClients] = useState({});

  // Bloquear scroll al fondo
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const top = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(top || '0') * -1);
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Carga inicial de datos
  useEffect(() => {
    if (isOpen && newsId) {
      setLoading(true);
      setViewMode('add');
      Promise.all([
        newsPermissionsService.getApplications(),
        newsPermissionsService.getClients(),
        newsPermissionsService.getUsers(),
        newsPermissionsService.getNewsPermissions(newsId),
        newsPermissionsService.getClientUserRelations(),
        newsPermissionsService.getAssignedAudience(newsId)
      ])
        .then(([appData, clientData, userData, permsData, relationsData, audienceData]) => {
          setApplications(appData || []);
          setClients(clientData || []);
          setAllUsers(userData || []);
          setPermissions(permsData || { applications: [], clients: [], users: [] });
          setAssignedAudience(audienceData || { applications: [], clients: [], users: [], rawData: [] });
          setClientUserRelations(relationsData || {});

          // Lógica "seleccionar todo"
          setAllApplications(
            Array.isArray(appData) &&
            Array.isArray(permsData?.applications) &&
            appData.length > 0 &&
            appData.length === permsData.applications.length
          );
          setAllClients(
            Array.isArray(clientData) &&
            Array.isArray(permsData?.clients) &&
            clientData.length > 0 &&
            clientData.length === permsData.clients.length
          );

          // Inicializar expandido
          const initExp = {};
          (clientData || []).forEach(c => { if (c?.id) initExp[c.id] = true; });
          setExpandedClients(initExp);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, newsId]);

  // Guardar permisos
  const onSave = async () => {
    if (!newsId) return;
    setLoading(true);
    try {
      const res = await newsPermissionsService.saveNewsPermissions(newsId, permissions);
      if (res?.success) {
        handleSavePermissions(newsId, permissions);
        const audience = await newsPermissionsService.getAssignedAudience(newsId);
        setAssignedAudience(audience || assignedAudience);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"></div>

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto relative flex flex-col w-full max-w-5xl max-h-[90vh]
                     bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden
                     transition-all duration-300 animate-fadeIn"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center px-6 py-4 bg-primary-blue">
            <div className="absolute left-6 hidden lg:block">
              <h2 className="flex items-center text-h2 font-semibold text-white">
                <Users className="mr-2" /> Configurar Audiencia
              </h2>
            </div>
            <div className="lg:hidden flex items-center">
              <Users className="text-white" size={20} />
            </div>
            <div className="flex flex-grow justify-center">
              <div className="flex items-center p-1 rounded-full bg-gray-200 dark:bg-gray-600">
                <button
                  onClick={() => setViewMode('add')}
                  className={`
                    flex items-center px-3 py-1 sm:px-4 sm:py-1.5 text-p font-medium rounded-full transition-colors
                    ${viewMode === 'add'
                      ? 'bg-white dark:bg-gray-800 shadow-sm text-primary-blue'
                      : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'}
                  `}
                >
                  <PlusCircle className="mr-1" size={14} /> Agregar
                </button>
                <button
                  onClick={() => setViewMode('view')}
                  className={`
                    flex items-center px-3 py-1 sm:px-4 sm:py-1.5 text-p font-medium rounded-full transition-colors
                    ${viewMode === 'view'
                      ? 'bg-white dark:bg-gray-800 shadow-sm text-primary-blue'
                      : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'}
                  `}
                >
                  <Eye className="mr-1" size={14} /> Ver Asignados
                </button>
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              className="absolute right-6 p-1 rounded-full text-white hover:text-primary-blue hover:bg-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex-grow flex items-center justify-center bg-white dark:bg-gray-800">
              <div className="h-8 w-8 rounded-full border-b-2 border-primary-blue animate-spin"></div>
            </div>
          ) : viewMode === 'add' ? (
            <AddPermissions
              applications={applications}
              clients={clients}
              allUsers={allUsers}
              permissions={permissions}
              setPermissions={setPermissions}
              clientUserRelations={clientUserRelations}
              allApplications={allApplications}
              setAllApplications={setAllApplications}
              allClients={allClients}
              setAllClients={setAllClients}
              allUsersSelected={allUsersSelected}
              setAllUsersSelected={setAllUsersSelected}
              expandedClients={expandedClients}
              setExpandedClients={setExpandedClients}
              onSavePermissions={onSave}
              handleCloseModal={handleCloseModal}
              assignedAudience={assignedAudience}
              isDark={isDark}
            />
          ) : (
            <ViewAudience
              assignedAudience={assignedAudience}
              handleCloseModal={handleCloseModal}
              isDark={isDark}
            />
          )}
        </div>
      </div>
    </div>
  );
}