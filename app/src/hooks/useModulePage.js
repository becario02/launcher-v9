// hooks/useModulePage.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { usePrimaryColor } from '@/context/primaryColor';
import { useCompany } from '@/context/CompanyContext';
import { useAuth } from '@/context/auth';

export function useModulePage() {
  const { division, modulo: moduleParam } = useParams();
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
  const [shortcuts, setShortcuts] = useState([]);
  const [notification, setNotification] = useState({ visible: false, type: 'info', message: '', style: 'toast' });

  const menuOrdenado = ['Transacciones', 'Consultas', 'Reportes', 'Catálogo', 'Administración'];

  const showNotification = (type, message, style = 'toast') => {
    setNotification({ visible: false, type: 'info', message: '', style: 'toast' });
    setTimeout(() => setNotification({ visible: true, type, message, style }), 50);
  };

  const closeNotification = () => setNotification(n => ({ ...n, visible: false }));

  const fetchShortcuts = useCallback(async () => {
    if (!selectedCompany?.idUser) return;
    try {
      const response = await fetch('http://localhost:5173/mslauncher/api/v1/GetMenuShorcutsByUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUser: selectedCompany.idUser }),
      });
      const data = await response.json();
      setShortcuts(data.data.data || []);
    } catch (error) {
      console.error('Error obteniendo shortcuts:', error);
    }
  }, [selectedCompany]);

  const isItemInShortcuts = (item) => {
    const itemId = item.originalData.moduleGroup === 'CUSTOM' ? item.originalData.idMenuParent : item.originalData.idMenu;
    const customId = item.originalData.moduleGroup === 'CUSTOM' ? item.originalData.idMenu : 0;

    return shortcuts.some(shortcut =>
      (shortcut.idMenu === itemId && shortcut.idCustomOption === customId) ||
      (shortcut.idCustomOption === customId && customId !== 0)
    );
  };

  const handleAddShortcut = async (item) => {
    if (isItemInShortcuts(item)) {
      showNotification('info', 'Este elemento ya está en tus accesos directos', 'toast');
      return;
    }
    const payload = {
      idMenu: item.originalData.moduleGroup === 'CUSTOM' ? item.originalData.idMenuParent : item.originalData.idMenu,
      idCustomOption: item.originalData.moduleGroup === 'CUSTOM' ? item.originalData.idMenu : 0,
      idUser: selectedCompany.idUser,
    };
    try {
      const res = await fetch('http://localhost:5173/mslauncher/api/v1/AddMenuShortcuts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error agregando shortcut');
      await res.json();
      await fetchShortcuts();
      showNotification('success', 'Acceso directo agregado con éxito', 'toast');
    } catch (e) {
      console.error('No se pudo agregar shortcut:', e);
      showNotification('error', 'No se pudo agregar el acceso directo', 'toast');
    }
  };

  const getIconForMenu = (name) => {
    if (!name) return 'FileText';
    const iconMap = {
      'Transacciones': 'Layers',
      'Consultas': 'HelpCircle',
      'Reportes': 'PieChart',
      'Catálogo': 'FileText',
      'Administración': 'Box'
    };
    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key)) return icon;
    }
    return 'FileText';
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

  const loadMenuData = useCallback(async () => {
    if (!selectedCompany?.idCompany) return;
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5173/mslauncher/api/v1/MenuByUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUser: selectedCompany.idUser }),
      });
      const { data } = await res.json();
      const builtIn = data.options.builtIn || [];
      const custom = data.options.custom || [];
      const allOptions = [...builtIn];
      const menuIdMap = {};
      builtIn.forEach(i => (menuIdMap[i.idMenu] = i.keyValue));
      custom.forEach(c => {
        const key = `custom-${c.idCustomOption}`;
        const p = c.idMenuParent !== null ? (menuIdMap[c.idMenuParent] || `custom-${c.idMenuParent}`) : null;
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
        if (!item.textOption && item.idName) item.textOption = item.idName;
      });

      const filteredOptions = allOptions.filter(item => {
        const matchesModuleName = item.moduleName && item.moduleName.toLowerCase().includes(currentModule);
        const matchesTextOption = item.textOption && item.textOption.toLowerCase().includes(currentModule);
        const matchesIdName = item.idName && item.idName.toLowerCase().includes(currentModule);
        return matchesModuleName || matchesTextOption || matchesIdName;
      });

      let relatedOptions = [...filteredOptions];

      const addParents = (options) => {
        let parentsToAdd = [];
        options.forEach(option => {
          if (option.pKey) {
            const parent = allOptions.find(p => p.keyValue === option.pKey);
            if (parent && !relatedOptions.some(o => o.keyValue === parent.keyValue)) parentsToAdd.push(parent);
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
            if (!relatedOptions.some(o => o.keyValue === child.keyValue)) childrenToAdd.push(child);
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
      hierarchy.forEach(item => { subMenus[item.keyValue] = item.children || []; });
      setSubMenuItems(subMenus);

      if (topLevelMenus.length > 0 && !selectedMenuItem) setSelectedMenuItem(topLevelMenus[0].id);

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
      showNotification('error', 'Error al cargar los datos del menú', 'toast');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCompany, selectedMenuItem, moduleParam]);

  useEffect(() => { loadMenuData(); fetchShortcuts(); }, [loadMenuData, fetchShortcuts]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const addNewInstance = () => {
    const newId = instances.length ? Math.max(...instances.map(i => i.id)) + 1 : 1;
    const newInst = { id: newId, name: `Instancia ${newId}`, active: true };
    setInstances([...instances, newInst]);
    setActiveInstance(newId);
  };

  const removeInstance = (id, e) => {
    e.stopPropagation();
    const updated = instances.filter(i => i.id !== id);
    if (activeInstance === id && updated.length) setActiveInstance(updated[0].id);
    setInstances(updated);
  };

  const setInstanceActive = id => setActiveInstance(id);

  return {
    division,
    moduleParam,
    primaryColor,
    user,
    sidebarOpen,
    setSidebarOpen,
    menuData,
    selectedMenuItem,
    setSelectedMenuItem,
    expandedItems,
    setExpandedItems,
    instances,
    activeInstance,
    setActiveInstance,
    showInstancesModal,
    setShowInstancesModal,
    searchTerm,
    setSearchTerm,
    isMobile,
    isLoading,
    subMenuItems,
    shortcuts,
    menuOrdenado,
    notification,
    showNotification,
    closeNotification,
    fetchShortcuts,
    isItemInShortcuts,
    handleAddShortcut,
    getIconForMenu,
    organizeMenuHierarchy,
    loadMenuData,
    addNewInstance,
    removeInstance,
    setInstanceActive,
  };
}