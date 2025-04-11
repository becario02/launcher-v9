"use client";

import { useState, useEffect } from 'react';
import { X, Users, PlusCircle, Eye } from 'lucide-react';
import { newsPermissionsService } from '@/services/newsPermissionsService';
import AddPermissions from '../PermissionsModal/addPermissions';
import ViewAudience from '../PermissionsModal/viewPermissions';

export default function PermissionsModal({
  isOpen,
  newsId,
  handleCloseModal,
  handleSavePermissions
}) {
  // Estado para controlar la vista (agregar o ver)
  const [viewMode, setViewMode] = useState('add'); // 'add' o 'view'
  const [loading, setLoading] = useState(true);
  
  // Estados para datos y permisos (para la vista de agregar)
  const [permissions, setPermissions] = useState({
    applications: [],
    clients: [],
    users: []
  });
  
  // Estados para datos de audiencia asignada (para la vista de ver)
  const [assignedAudience, setAssignedAudience] = useState({
    applications: [],
    clients: [],
    users: [],
    rawData: []
  });
  
  // Estados para datos
  const [applications, setApplications] = useState([]);
  const [clients, setClients] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [clientUserRelations, setClientUserRelations] = useState({});
  
  // Estados para selecciones de "todos"
  const [allApplications, setAllApplications] = useState(false);
  const [allClients, setAllClients] = useState(false);
  const [allUsersSelected, setAllUsersSelected] = useState(false);
  
  // Estado para controlar qué clientes están expandidos
  const [expandedClients, setExpandedClients] = useState({});

  // Efecto para bloquear scroll del fondo
  useEffect(() => {
    if (isOpen) {
      // Bloquear scroll
      document.body.style.overflow = 'hidden';
      
      // Guardar la posición actual de scroll
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restaurar scroll
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    
    return () => {
      // Limpiar al desmontar
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
    };
  }, [isOpen]);
  
  // Función para cargar los permisos asignados desde la BD
  const loadAssignedAudience = async () => {
    setLoading(true);
    try {
      const response = await newsPermissionsService.getAssignedAudience(newsId);
      if (response) {
        setAssignedAudience(response);
      }
    } catch (error) {
      console.error('Error al cargar audiencia asignada:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && newsId) {
      setLoading(true);
      
      // Restablecer vista a 'agregar' por defecto
      setViewMode('add');
      
      // Cargar todos los datos necesarios
      Promise.all([
        newsPermissionsService.getApplications(),
        newsPermissionsService.getClients(),
        newsPermissionsService.getUsers(),
        newsPermissionsService.getNewsPermissions(newsId),
        newsPermissionsService.getClientUserRelations(),
        // También cargamos la audiencia asignada desde el inicio
        newsPermissionsService.getAssignedAudience(newsId)
      ])
        .then(([appData, clientData, userData, permissionsData, relationsData, audienceData]) => {
          setApplications(appData || []);
          setClients(clientData || []);
          setAllUsers(userData || []);
          setPermissions(permissionsData || { applications: [], clients: [], users: [] });
          setAssignedAudience(audienceData || { applications: [], clients: [], users: [], rawData: [] });
          setClientUserRelations(relationsData || {});
          
          // Actualizar estados "all" - con verificación
          const validAppData = Array.isArray(appData) ? appData : [];
          const validPermissionsApps = Array.isArray(permissionsData?.applications) ? permissionsData.applications : [];
          setAllApplications(validAppData.length > 0 && validPermissionsApps.length === validAppData.length);
          
          const validClientData = Array.isArray(clientData) ? clientData : [];
          const validPermissionsClients = Array.isArray(permissionsData?.clients) ? permissionsData.clients : [];
          setAllClients(validClientData.length > 0 && validPermissionsClients.length === validClientData.length);
          
          // Inicializar todos los clientes como expandidos
          const initialExpandedState = {};
          if (Array.isArray(clientData)) {
            clientData.forEach(client => {
              if (client && client.id) {
                initialExpandedState[client.id] = true;
              }
            });
          }
          setExpandedClients(initialExpandedState);
          
          setLoading(false);
        })
        .catch(error => {
          console.error('Error al cargar datos para el modal de permisos:', error);
          setLoading(false);
        });
    }
  }, [isOpen, newsId]);

  // Función para guardar los permisos
  const onSavePermissions = async () => {
    if (!newsId) return;
    
    setLoading(true);
    try {
      const result = await newsPermissionsService.saveNewsPermissions(newsId, permissions);
      if (result && result.success) {
        handleSavePermissions(newsId, permissions);
        
        // Actualizar la vista de audiencia asignada después de guardar
        await loadAssignedAudience();
      }
    } catch (error) {
      console.error('Error al guardar permisos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Cambiar entre vistas
  const toggleViewMode = () => {
    // Si vamos a cambiar a la vista "ver", cargamos los datos más recientes
    if (viewMode === 'add') {
      loadAssignedAudience();
    }
    
    setViewMode(viewMode === 'add' ? 'view' : 'add');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"></div>
      
      <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden transform transition-all duration-300 animate-fadeIn pointer-events-auto relative max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del modal */}
          <div className="px-6 py-4 border-b border-gray-1 flex items-center bg-primary-blue sticky top-0 z-10">
            {/* Título a la izquierda - Visible en tamaño normal, oculto en móvil */}
            <div className="absolute left-6 hidden sm:block">
              <h2 className="text-h2 font-semibold text-white flex items-center">
                <Users className="mr-2 text-white" />
                Configurar Audiencia
              </h2>
            </div>
            
            {/* Ícono pequeño solo en móvil (a la izquierda) */}
            <div className="sm:hidden flex items-center">
              <Users className="text-white" size={20} />
            </div>
            
            {/* Switch de vistas absolutamente centrado en laptops, y centrado-izquierda en móvil */}
            <div className="flex-grow flex justify-center">
              <div className="bg-gray-2 rounded-full p-1 flex items-center">
                <button 
                  onClick={() => setViewMode('add')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 text-p-small sm:text-p font-medium rounded-full transition-colors flex items-center ${
                    viewMode === 'add' 
                      ? 'bg-white shadow-sm text-primary-blue' 
                      : 'text-gray-4 hover:text-gray-5'
                  }`}
                >
                  <PlusCircle size={14} className="mr-1 sm:mr-1.5" />
                  Agregar
                </button>
                <button 
                  onClick={() => setViewMode('view')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 text-p-small sm:text-p font-medium rounded-full transition-colors flex items-center ${
                    viewMode === 'view' 
                      ? 'bg-white shadow-sm text-primary-blue' 
                      : 'text-gray-4 hover:text-gray-5'
                  }`}
                >
                  <Eye size={14} className="mr-1 sm:mr-1.5" />
                  Ver Asignados
                </button>
              </div>
            </div>
            
            {/* Botón de cerrar a la derecha */}
            <button 
              onClick={handleCloseModal}
              className="absolute right-6 text-white ml-5 hover:text-primary-blue transition-colors p-1 rounded-full hover:bg-gray-1"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
          
          {/* Contenido principal */}
          {loading ? (
            <div className="flex justify-center items-center h-40 flex-grow">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
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
              onSavePermissions={onSavePermissions}
              handleCloseModal={handleCloseModal}
              assignedAudience={assignedAudience}
            />
          ) : (
            <ViewAudience 
              assignedAudience={assignedAudience}
              handleCloseModal={handleCloseModal}
            />
          )}
        </div>
      </div>
    </div>
  );
}