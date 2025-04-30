'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  Flag,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Layers,
  HelpCircle,
  FileText,
  PieChart,
  Box,
  Pin,
  Eye
} from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useCompany } from '@/context/CompanyContext';
import { useAuth } from '@/context/auth';
import Notification from '@/components/admin/news/Notification';

export default function ModulePage() {
  const { division, modulo: moduleParam } = useParams();
  const router = useRouter();
  const { primaryColor } = usePrimaryColor();
  const { selectedCompany } = useCompany();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuData, setMenuData] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const [instances, setInstances] = useState([{ id: 1, name: 'Instancia 1', active: true }]);
  const [activeInstance, setActiveInstance] = useState(1);
  const [showInstancesModal, setShowInstancesModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subMenuItems, setSubMenuItems] = useState({});
  const menuOrdenado = ['Transacciones', 'Consultas', 'Reportes', 'Catálogo', 'Administración']

  // Estado para las notificaciones
  const [notification, setNotification] = useState({ 
    visible: false, 
    type: 'info', 
    message: '', 
    style: 'toast' 
  });

  // Función para mostrar notificaciones
  const showNotification = (type, message, style = 'toast') => {
    setNotification({ visible: false, type: 'info', message: '', style: 'toast' });
    setTimeout(() => setNotification({ visible: true, type, message, style }), 50);
  };

  // Función para cerrar notificaciones
  const closeNotification = () => setNotification(n => ({ ...n, visible: false }));

  // Función para agregar shortcut con notificaciones
  const handleAddShortcut = async (item) => {
    const payload = {
      idMenu: item.originalData.moduleGroup === 'CUSTOM' ? item.originalData.idMenuParent : item.originalData.idMenu,
      idCustomOption: item.originalData.moduleGroup === 'CUSTOM' ? item.originalData.idMenu : 0,
      idUser: selectedCompany.idUser,
    };
    try {
      const res = await fetch(
        'http://localhost:5173/mslauncher/api/v1/AddMenuShortcuts',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error('Error agregando shortcut');
      const data = await res.json();
      console.log('Shortcut agregado:', data);
      
      // Muestra notificación de éxito
      showNotification('success', 'Acceso directo agregado con éxito', 'toast');
    } catch (e) {
      console.error('No se pudo agregar shortcut:', e);
      
      // Muestra notificación de error
      showNotification('error', 'No se pudo agregar el acceso directo', 'toast');
    }
  };

  // Función para obtener datos del menú
  const loadMenuData = useCallback(async () => {
    if (!selectedCompany?.idCompany) return;

    setIsLoading(true);
    try {
      const res = await fetch(
        'http://localhost:5173/mslauncher/api/v1/MenuCustomOption',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idCompany: selectedCompany.idCompany }),
        }
      );
      const { data } = await res.json();
      const builtIn = data.options.builtIn || [];
      const custom = data.options.custom || [];

      const allOptions = [...builtIn];
      const menuIdMap = {};
      builtIn.forEach(i => (menuIdMap[i.idMenu] = i.keyValue));

      custom.forEach(c => {
        const key = `custom-${c.idCustomOption}`;
        const p = c.idMenuParent !== null
          ? (menuIdMap[c.idMenuParent] || `custom-${c.idMenuParent}`)
          : null;
        allOptions.push({
          idMenu: c.idCustomOption,
          moduleGroup: 'CUSTOM',
          moduleName: '',
          idMenuParent: c.idMenuParent,
          idName: c.textOption,
          textOption: c.textOption,
          keyValue: key,
          pKey: p,
          resourceUrl: c.resourceUrl
        });
      });

      const currentModule = moduleParam.toLowerCase();

      allOptions.forEach(item => {
        if (!item.textOption && item.idName) {
          item.textOption = item.idName;
        }
      });

      const filteredOptions = allOptions.filter(item => {
        const matchesModuleName = item.moduleName &&
          item.moduleName.toLowerCase().includes(currentModule);
        const matchesTextOption = item.textOption &&
          item.textOption.toLowerCase().includes(currentModule);
        const matchesIdName = item.idName &&
          item.idName.toLowerCase().includes(currentModule);

        return matchesModuleName || matchesTextOption || matchesIdName;
      });

      let relatedOptions = [...filteredOptions];

      const addParents = (options) => {
        let parentsToAdd = [];
        options.forEach(option => {
          if (option.pKey) {
            const parent = allOptions.find(p => p.keyValue === option.pKey);
            if (parent && !relatedOptions.some(o => o.keyValue === parent.keyValue)) {
              parentsToAdd.push(parent);
            }
          }
        });
        if (parentsToAdd.length > 0) {
          relatedOptions = [...relatedOptions, ...parentsToAdd];
          addParents(parentsToAdd);
        }
      };

      const addChildren = (options) => {
        let childrenToAdd = [];
        options.forEach(option => {
          const children = allOptions.filter(c => c.pKey === option.keyValue);
          children.forEach(child => {
            if (!relatedOptions.some(o => o.keyValue === child.keyValue)) {
              childrenToAdd.push(child);
            }
          });
        });
        if (childrenToAdd.length > 0) {
          relatedOptions = [...relatedOptions, ...childrenToAdd];
          addChildren(childrenToAdd);
        }
      };

      addParents(filteredOptions);
      addChildren(relatedOptions);

      const hierarchy = organizeMenuHierarchy(relatedOptions);

      const topLevelMenus = hierarchy.map(item => ({
        id: item.keyValue,
        name: item.textOption || item.idName,
        icon: getIconForMenu(item.textOption || item.idName),
        originalData: item
      }));
      setMenuData(topLevelMenus);

      const subMenus = {};
      hierarchy.forEach(item => {
        subMenus[item.keyValue] = item.children || [];
      });
      setSubMenuItems(subMenus);

      if (topLevelMenus.length > 0 && !selectedMenuItem) {
        setSelectedMenuItem(topLevelMenus[0].id);
      }

      const expandedMap = {};
      const expandAll = (items) => {
        items.forEach(item => {
          if (item.children && item.children.length > 0) {
            expandedMap[item.keyValue] = true;
            expandAll(item.children);
          }
        });
      };
      expandAll(hierarchy);
      setExpandedItems(expandedMap);

    } catch (e) {
      console.error('Error cargando datos del menú:', e);
      // Mostrar notificación de error al cargar el menú
      showNotification('error', 'Error al cargar los datos del menú', 'toast');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCompany, selectedMenuItem, moduleParam]);

  useEffect(() => {
    loadMenuData();
  }, [loadMenuData]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const getIconForMenu = (name) => {
    if (!name) return FileText;
    const iconMap = {
      'Transacciones': Layers,
      'Consultas': HelpCircle,
      'Reportes': PieChart,
      'Catálogo': FileText,
      'Administración': Box
    };
    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key)) return icon;
    }
    return FileText;
  };

  const organizeMenuHierarchy = (items) => {
    const copy = JSON.parse(JSON.stringify(items));
    const map = {};
    copy.forEach(item => {
      const parent = item.pKey || null;
      map[item.keyValue] = { ...item, pKey: parent, children: [] };
    });
    const roots = [];
    copy.forEach(item => {
      const parent = item.pKey || null;
      if (!parent) roots.push(map[item.keyValue]);
      else if (map[parent]) map[parent].children.push(map[item.keyValue]);
    });
    return roots;
  };

  const handleMenuItemClick = id => setSelectedMenuItem(id);
  const toggleItemExpansion = id => setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));

  const addNewInstance = () => {
    const newId = instances.length ? Math.max(...instances.map(i => i.id)) + 1 : 1;
    const newInst = { id: newId, name: `Instancia ${newId}`, active: true };
    setInstances([...instances, newInst]);
    setActiveInstance(newId);
  };

  const removeInstance = (id, e) => {
    e.stopPropagation();
    const updated = instances.filter(i => i.id !== id);
    if (activeInstance === id && updated.length) {
      setActiveInstance(updated[0].id);
    }
    setInstances(updated);
  };

  const setInstanceActive = id => setActiveInstance(id);

  const breadcrumbItems = [
    { name: division, path: `/divisiones/${division}` },
    { name: moduleParam, path: `/divisiones/${division}/${moduleParam}` }
  ];

  const renderSubMenu = (items) => {
    if (!items || items.length === 0) return null;

    return items.map(item => (
      <div key={item.keyValue}>
        <div
          onClick={() => (item.children?.length > 0) && toggleItemExpansion(item.keyValue)}
          className="flex items-center justify-between p-3 my-1 rounded-md cursor-pointer bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#252530]"
        >
          <span className="text-gray-800 dark:text-white">{item.textOption || item.idName}</span>
          <div className="flex items-center">
            {(!item.children || item.children.length === 0) && (
              <Pin
                className="w-4 h-4 text-gray-400 cursor-pointer"
                onClick={() => handleAddShortcut({ originalData: item })}
              />
            )}
            {(item.children && item.children.length > 0) && (
              expandedItems[item.keyValue] ? (
                <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )
            )}
          </div>
        </div>

        {item.children && item.children.length > 0 && expandedItems[item.keyValue] && (
          <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
            {renderSubMenu(item.children)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar fijo md+ */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Sidebar slide-over en móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="relative z-50 w-60 h-full bg-white dark:bg-[#1C1C24] shadow-lg">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 md:ml-60 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="bg-[#F2F6FD] dark:bg-[#13131a] flex-1 pt-14 px-4 sm:px-6 lg:px-8 xl:px-16">
          {/* Notificaciones tipo toast */}
          {notification.visible && notification.style === 'toast' && (
            <div className="fixed top-4 right-4 z-[9999]">
              <Notification
                visible
                type={notification.type}
                message={notification.message}
                style="toast"
                onClose={closeNotification}
              />
            </div>
          )}

          {/* Breadcrumb + contador de instancias */}
          <div className="flex justify-between items-center px-4 py-3">
            <div className="flex items-center text-sm">
              {breadcrumbItems.map((item, idx) => (
                <div key={idx} className="flex items-center">
                  <Link
                    href={item.path}
                    className={`hover:text-gray-700 dark:hover:text-gray-300 ${
                      idx === breadcrumbItems.length - 1
                        ? 'text-gray-800 dark:text-white font-medium'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </Link>
                  {idx < breadcrumbItems.length - 1 && (
                    <span className="mx-2 text-gray-400 dark:text-gray-600">›</span>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowInstancesModal(true)}
              className="flex items-center gap-2 bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <span
                className="flex items-center justify-center w-5 h-5 text-xs text-white rounded-md"
                style={{ backgroundColor: primaryColor }}
              >
                {instances.length}
              </span>
              <span className="text-sm font-medium dark:text-white">Instancias abiertas</span>
              <Eye className="w-4 h-4 ml-1 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Header del módulo */}
          <div className="w-full bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center">
                <Flag className="w-5 h-5 mr-2" style={{ color: primaryColor }} />
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {moduleParam.charAt(0).toUpperCase() + moduleParam.slice(1)}
                </h1>
              </div>
              {/* Buscador */}
              <div className="w-1/2 relative">
                <input
                  type="text"
                  placeholder="Buscar"
                  className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-[#252530] border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-800 dark:text-white"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Pestañas de instancias */}
            <div className="flex border-t border-gray-200 dark:border-gray-800 overflow-x-auto">
              {instances.map(inst => (
                <div
                  key={inst.id}
                  onClick={() => setInstanceActive(inst.id)}
                  className={`flex items-center px-3 py-2.5 text-sm cursor-pointer ${
                    activeInstance === inst.id
                      ? 'border-b-2 font-medium'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                  style={
                    activeInstance === inst.id
                      ? { borderColor: primaryColor, color: primaryColor }
                      : {}
                  }
                >
                  <span>{inst.name}</span>
                  {instances.length > 1 && (
                    <button onClick={e => removeInstance(inst.id, e)} className="ml-2">
                      <X className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addNewInstance}
                className="flex items-center px-3 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contenedor principal con dos columnas */}
          <div className="flex h-[calc(100vh-15rem)] mt-4">
            {/* Menú lateral interno */}
            <div className="w-56 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C1C24] rounded-l-md overflow-y-auto py-4">
              {menuOrdenado.map(menuName => {
                // Find existing menu item if it exists in menuData
                const existingItem = menuData.find(item => item.name === menuName);
                
                // If the menu item exists in data, use its properties
                // If not, create a default menu item
                const item = existingItem || {
                  id: `default-${menuName}`,
                  name: menuName,
                  icon: getIconForMenu(menuName)
                };
                
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMenuItem(item.id)}
                    className={`
                      flex items-center px-4 py-3 text-sm cursor-pointer border-l-4
                      ${selectedMenuItem === item.id
                        ? 'font-medium bg-opacity-10'
                        : 'border-transparent hover:bg-opacity-5'}
                    `}
                    style={
                      selectedMenuItem === item.id
                        ? {
                            borderColor: primaryColor,
                            backgroundColor: `${primaryColor}10`,
                            color: primaryColor
                          }
                        : {}
                    }
                  >
                    <item.icon
                      className={`w-5 h-5 mr-3 ${
                        selectedMenuItem === item.id
                          ? ''
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                      style={selectedMenuItem === item.id ? { color: primaryColor } : {}}
                    />
                    {item.name}
                  </div>
                );
              })}
            </div>
            {/* Panel principal con submenús */}
            <div className="flex-1 border border-t border-r border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C1C24] rounded-r-md overflow-y-auto">
              <div className="p-3">
                {isLoading ? (
                  <div className="flex justify-center items-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  selectedMenuItem && renderSubMenu(subMenuItems[selectedMenuItem] || [])
                )}
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
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Instancias abiertas
                </h2>
              </div>
              <button onClick={() => setShowInstancesModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto space-y-3">
              {/* Ejemplo: instancia actual */}
              <div className="cursor-pointer bg-gray-50 dark:bg-[#252530] rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {division.charAt(0).toUpperCase() + division.slice(1)}
                      </span>
                      <span className="mx-2 text-gray-400 dark:text-gray-600">›</span>
                      <span className="text-sm text-gray-800 dark:text-white">
                        {moduleParam.charAt(0).toUpperCase() + moduleParam.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <span
                        className="flex items-center justify-center w-5 h-5 text-xs text-white rounded-md"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {instances.length}
                      </span>
                      <span className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                        Instancias abiertas
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              {/* Ejemplos adicionales */}
              <div className="cursor-pointer bg-white dark:bg-[#1C1C24] rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Nucleares</span>
                      <span className="mx-2 text-gray-400 dark:text-gray-600">›</span>
                      <span className="text-sm text-gray-800 dark:text-white">Llantas</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <span
                        className="flex items-center justify-center w-5 h-5 text-xs text-white rounded-md"
                        style={{ backgroundColor: primaryColor }}
                      >
                        1
                      </span>
                      <span className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                        Instancias abiertas
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}