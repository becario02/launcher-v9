'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Flag, Search, X, ChevronDown, ChevronUp, Plus, Layers, HelpCircle, FileText, PieChart, Box, Pin, Eye } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import Link from 'next/link';

// Datos de ejemplo para los menús laterales y submenús
const menuItems = [
  { id: 'transacciones', name: 'Transacciones', icon: Layers },
  { id: 'consultas', name: 'Consultas', icon: HelpCircle },
  { id: 'reportes', name: 'Reportes', icon: PieChart },
  { id: 'catalogo', name: 'Catálogo', icon: FileText },
  { id: 'administracion', name: 'Administración', icon: Box },
];

// Datos de ejemplo para los submenús
const subMenuItems = {
  transacciones: [
    { id: 'nivelA', name: 'Nivel A', hasChildren: false },
    { id: 'nivelB', name: 'Nivel B', hasChildren: true, 
      children: [
        { id: 'subnivel1', name: 'Subnivel 1', hasChildren: false },
        { id: 'subnivel2', name: 'Subnivel 2', hasChildren: true,
          children: [
            { id: 'subnivel2_1', name: 'Subnivel 2.1', hasChildren: false },
            { id: 'subnivel2_2', name: 'Subnivel 2.2', hasChildren: false },
            { id: 'subnivel2_3', name: 'Subnivel 2.3', hasChildren: false },
          ] 
        },
        { id: 'subnivel3', name: 'Subnivel 3', hasChildren: false },
      ] 
    },
    { id: 'nivelC', name: 'Nivel C', hasChildren: false },
    { id: 'nivelD', name: 'Nivel D', hasChildren: false },
  ],
  consultas: [
    { id: 'consulta1', name: 'Consulta 1', hasChildren: false },
    { id: 'consulta2', name: 'Consulta 2', hasChildren: false },
  ],
  reportes: [
    { id: 'reporte1', name: 'Reporte 1', hasChildren: false },
    { id: 'reporte2', name: 'Reporte 2', hasChildren: false },
  ],
  catalogo: [
    { id: 'catalogo1', name: 'Catálogo 1', hasChildren: false },
    { id: 'catalogo2', name: 'Catálogo 2', hasChildren: false },
  ],
  administracion: [
    { id: 'admin1', name: 'Admin 1', hasChildren: false },
    { id: 'admin2', name: 'Admin 2', hasChildren: false },
  ],
};

export default function ModulePage() {
  const { division, module } = useParams();
  const router = useRouter();
  const { primaryColor } = usePrimaryColor();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState('transacciones');
  const [expandedItems, setExpandedItems] = useState({});
  const [instances, setInstances] = useState([
    { id: 1, name: 'Instancia 1', active: true },
  ]);
  const [showInstancesModal, setShowInstancesModal] = useState(false);
  const [activeInstance, setActiveInstance] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const handleMenuItemClick = (itemId) => {
    setSelectedMenuItem(itemId);
  };

  const toggleItemExpansion = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };
  
  const addNewInstance = () => {
    const newId = instances.length > 0 ? Math.max(...instances.map(i => i.id)) + 1 : 1;
    const newInstance = { id: newId, name: `Instancia ${newId}`, active: true };
    setInstances([...instances, newInstance]);
    setActiveInstance(newId);
  };
  
  const removeInstance = (id, e) => {
    e.stopPropagation();
    const updatedInstances = instances.filter(instance => instance.id !== id);
    
    if (activeInstance === id && updatedInstances.length > 0) {
      setActiveInstance(updatedInstances[0].id);
    }
    
    setInstances(updatedInstances);
  };
  
  const setInstanceActive = (id) => {
    setActiveInstance(id);
  };

  // Verificar si estamos en móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Generar el breadcrumb con verificación para valores no definidos
  const breadcrumbItems = [
    { name: division || 'División', path: `/divisiones/${division}` },
    { name: module || 'Módulo', path: `/divisiones/${division}/${module}` }
  ];

  return (
    <div className="flex h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="relative z-50 w-60 h-full bg-white dark:bg-[#1C1C24] shadow-lg">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 md:ml-60 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="bg-[#F2F6FD] dark:bg-[#13131a] flex-1 pt-14 px-4 sm:px-6 lg:px-8 xl:px-16">
          {/* Reubicación: Breadcrumb y contador de instancias */}
          <div className="flex justify-between items-center px-4 py-3 bg-transparent">
            <div className="flex items-center text-sm">
              {breadcrumbItems.map((item, index) => (
                <div key={index} className="flex items-center">
                  <Link 
                    href={item.path}
                    className={`hover:text-gray-700 dark:hover:text-gray-300 ${
                      index === breadcrumbItems.length - 1 
                        ? 'text-gray-800 dark:text-white font-medium' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {item.name && typeof item.name === 'string' 
                      ? item.name.charAt(0).toUpperCase() + item.name.slice(1)
                      : 'Enlace'}
                  </Link>
                  {index < breadcrumbItems.length - 1 && (
                    <span className="mx-2 text-gray-400 dark:text-gray-600">›</span>
                  )}
                </div>
              ))}
            </div>
            
            <button 
              className="flex items-center gap-2 bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setShowInstancesModal(true)}
            >
              <span className={`flex items-center justify-center w-5 h-5 text-xs text-white rounded-md`} style={{backgroundColor: primaryColor}}>
                {instances.length}
              </span>
              <span className="text-sm font-medium">Instancias abiertas</span>
              <Eye className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          {/* Header del módulo con el título y las instancias */}
          <div className="w-full bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm">
            {/* Título del módulo y buscador en la misma fila */}
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center">
                <Flag className="w-5 h-5 mr-2" style={{ color: primaryColor }} />
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {module && typeof module === 'string' 
                    ? module.charAt(0).toUpperCase() + module.slice(1) 
                    : 'Módulo'}
                </h1>
              </div>
              
              {/* Buscador */}
              <div className="w-1/2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar"
                    className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-[#252530] border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-800 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Pestañas de instancias */}
            <div className="flex border-t border-gray-200 dark:border-gray-800 overflow-x-auto">
              {instances.map(instance => (
                <div 
                  key={instance.id}
                  className={`flex items-center px-3 py-2.5 text-sm cursor-pointer ${
                    activeInstance === instance.id 
                      ? 'border-b-2 font-medium' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                  style={activeInstance === instance.id ? { borderColor: primaryColor, color: primaryColor } : {}}
                  onClick={() => setInstanceActive(instance.id)}
                >
                  <span>{instance.name}</span>
                  {instances.length > 1 && (
                    <button 
                      className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      onClick={(e) => removeInstance(instance.id, e)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button 
                className="flex items-center justify-center px-3 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                onClick={addNewInstance}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Contenedor principal de dos columnas con margen superior */}
          <div className="flex h-[calc(100vh-15rem)] mt-4">
            {/* Menú lateral izquierdo ACTUALIZADO para parecerse al diseño de Zeplin */}
            <div className="w-56 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C1C24] rounded-l-md overflow-y-auto">
              {/* Lista de menús laterales como pestañas */}
              <div className="py-2">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center px-4 py-3 text-sm cursor-pointer ${
                      selectedMenuItem === item.id
                        ? 'border-l-4 bg-opacity-10 font-medium'
                        : 'border-l-4 border-transparent text-gray-700 dark:text-gray-300 hover:bg-opacity-5'
                    }`}
                    style={selectedMenuItem === item.id ? { 
                      borderColor: primaryColor, 
                      backgroundColor: `${primaryColor}10`,
                      color: primaryColor
                    } : {}}
                    onClick={() => handleMenuItemClick(item.id)}
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${
                      selectedMenuItem === item.id 
                        ? '' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`} 
                    style={selectedMenuItem === item.id ? { color: primaryColor } : {}}
                    />
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Panel principal con submenús */}
            <div className="flex-1 border-t border-r border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C1C24] rounded-r-md overflow-y-auto">
              {/* Lista de submenús - sin barra de búsqueda */}
              <div className="p-3">
                {subMenuItems[selectedMenuItem]?.map((item) => (
                  <div key={item.id}>
                    <div 
                      className="flex items-center justify-between p-3 my-1 rounded-md cursor-pointer bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#252530]"
                      onClick={() => item.hasChildren ? toggleItemExpansion(item.id) : null}
                    >
                      <span className="text-gray-800 dark:text-white">{item.name}</span>
                      <div className="flex items-center">
                        {!item.hasChildren && <Pin className="w-4 h-4 text-gray-400" />}
                        {item.hasChildren && (
                          expandedItems[item.id] ? (
                            <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          )
                        )}
                      </div>
                    </div>
                    
                    {/* Submenús hijos */}
                    {item.hasChildren && expandedItems[item.id] && (
                      <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                        {item.children.map((child) => (
                          <div key={child.id}>
                            <div 
                              className="flex items-center justify-between p-3 my-1 rounded-md cursor-pointer bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#252530]"
                              onClick={() => child.hasChildren ? toggleItemExpansion(child.id) : null}
                            >
                              <span className="text-gray-800 dark:text-white">{child.name}</span>
                              <div className="flex items-center">
                                {!child.hasChildren && <Pin className="w-4 h-4 text-gray-400" />}
                                {child.hasChildren && (
                                  expandedItems[child.id] ? (
                                    <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  )
                                )}
                              </div>
                            </div>
                            
                            {/* Sub-submenús */}
                            {child.hasChildren && expandedItems[child.id] && (
                              <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                                {child.children.map((subChild) => (
                                  <div 
                                    key={subChild.id}
                                    className="flex items-center justify-between p-3 my-1 rounded-md cursor-pointer bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#252530]"
                                  >
                                    <span className="text-gray-800 dark:text-white">{subChild.name}</span>
                                    <Pin className="w-4 h-4 text-gray-400" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de instancias abiertas */}
      {showInstancesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#1C1C24] rounded-lg w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <Layers className="w-5 h-5 mr-2" style={{ color: primaryColor }} />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Instancias abiertas</h2>
              </div>
              <button 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={() => setShowInstancesModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              {/* Lista de instancias abiertas por módulo */}
              <div className="space-y-3">
                <div className="cursor-pointer bg-gray-50 dark:bg-[#252530] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-sm">
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{division.charAt(0).toUpperCase() + division.slice(1)}</span>
                        <span className="mx-2 text-gray-400 dark:text-gray-600">›</span>
                        <span className="text-sm text-gray-800 dark:text-white">{module.charAt(0).toUpperCase() + module.slice(1)}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="flex items-center justify-center w-5 h-5 text-xs text-white rounded-md" style={{backgroundColor: primaryColor}}>
                          {instances.length}
                        </span>
                        <span className="ml-2 text-sm text-blue-600 dark:text-blue-400 font-medium">Instancias abiertas</span>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                
                {/* Ejemplo de otra instancia abierta */}
                <div className="cursor-pointer bg-white dark:bg-[#1C1C24] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-sm">
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Nucleares</span>
                        <span className="mx-2 text-gray-400 dark:text-gray-600">›</span>
                        <span className="text-sm text-gray-800 dark:text-white">Llantas</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="flex items-center justify-center w-5 h-5 text-xs text-white rounded-md" style={{backgroundColor: primaryColor}}>
                          1
                        </span>
                        <span className="ml-2 text-sm text-blue-600 dark:text-blue-400 font-medium">Instancias abiertas</span>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                
                {/* Ejemplo de otra instancia abierta */}
                <div className="cursor-pointer bg-white dark:bg-[#1C1C24] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-sm">
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Financieros</span>
                        <span className="mx-2 text-gray-400 dark:text-gray-600">›</span>
                        <span className="text-sm text-gray-800 dark:text-white">Contabilidad</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="flex items-center justify-center w-5 h-5 text-xs text-white rounded-md" style={{backgroundColor: primaryColor}}>
                          1
                        </span>
                        <span className="ml-2 text-sm text-blue-600 dark:text-blue-400 font-medium">Instancias abiertas</span>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}