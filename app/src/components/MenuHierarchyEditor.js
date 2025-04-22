// Guarda este archivo como: components/MenuHierarchyEditor.js
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Save, Plus, Trash2, ArrowUp, ArrowDown, MoveVertical } from 'lucide-react';

// Función para organizar los datos en jerarquías
const organizeMenuHierarchy = (items) => {
  // Clone the items to avoid mutation
  const itemsCopy = JSON.parse(JSON.stringify(items));
  
  // First, create a map for quick lookups
  const itemMap = {};
  itemsCopy.forEach(item => {
    itemMap[item.keyValue] = {...item, children: []};
  });
  
  // Then, create the hierarchy
  const rootItems = [];
  
  itemsCopy.forEach(item => {
    if (!item.pKey) {
      // This is a root item
      rootItems.push(itemMap[item.keyValue]);
    } else {
      // This is a child item, add it to its parent
      if (itemMap[item.pKey]) {
        itemMap[item.pKey].children.push(itemMap[item.keyValue]);
      }
    }
  });
  
  return rootItems;
};

// Función para convertir la jerarquía de vuelta a una lista plana (para guardar)
const flattenHierarchy = (hierarchy) => {
  const result = [];
  
  const flatten = (items, parentKey = null) => {
    items.forEach(item => {
      const flatItem = { ...item };
      delete flatItem.children;
      flatItem.pKey = parentKey;
      result.push(flatItem);
      
      if (item.children && item.children.length > 0) {
        flatten(item.children, item.keyValue);
      }
    });
  };
  
  flatten(hierarchy);
  return result;
};

const MenuHierarchyEditor = () => {
  const [hierarchyData, setHierarchyData] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [dragItem, setDragItem] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  useEffect(() => {
    // Función para cargar los datos del menú desde la API
    const loadMenuData = async () => {
      try {
        setIsLoading(true);
        
        // En producción, descomentar esto y eliminar los datos de ejemplo
        // const response = await fetch('/api/menu-hierarchy');
        // const data = await response.json();
        
        // Datos de ejemplo (solo para desarrollo)
        const initialMenuData = [
          { idMenu: 1, idModule: 1, moduleGroup: 'FINANCIAL', moduleName: 'CONTABILIDAD', idName: 'mnuModulos', keyValue: '1000', pKey: null },
          { idMenu: 2, idModule: 2, moduleGroup: 'FINANCIAL', moduleName: 'CONTABILIDAD', idName: 'mnuConvenios', keyValue: '1001', pKey: '1000' },
          { idMenu: 3, idModule: 3, moduleGroup: 'FINANCIAL', moduleName: 'CONTABILIDAD', idName: 'mnuCatTabulador', keyValue: '1002', pKey: '1000' },
          { idMenu: 4, idModule: 4, moduleGroup: 'FINANCIAL', moduleName: 'CONTABILIDAD', idName: 'mnuCatAdminProyectos', keyValue: '1003', pKey: '1000' },
          { idMenu: 5, idModule: 5, moduleGroup: 'AUXILIARES', moduleName: 'ALMACENES', idName: 'mnuConsultas', keyValue: '2000', pKey: null },
          { idMenu: 6, idModule: 6, moduleGroup: 'AUXILIARES', moduleName: 'ALMACENES', idName: 'mnuStatus', keyValue: '2001', pKey: '2000' },
        ];
        
        const hierarchy = organizeMenuHierarchy(initialMenuData);
        setHierarchyData(hierarchy);
        
        // Expandir todos los nodos por defecto
        const expanded = {};
        initialMenuData.forEach(item => {
          expanded[item.keyValue] = true;
        });
        setExpandedItems(expanded);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar datos de menú:', error);
        setIsLoading(false);
      }
    };
    
    loadMenuData();
  }, []);

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const moveItemUp = (item, parentPath = []) => {
    const newHierarchy = JSON.parse(JSON.stringify(hierarchyData));
    let currentLevel = newHierarchy;
    
    // Navigate to the parent level
    for (const pathIndex of parentPath) {
      currentLevel = currentLevel[pathIndex].children;
    }
    
    // Find the item's index
    const itemIndex = currentLevel.findIndex(i => i.idMenu === item.idMenu);
    if (itemIndex > 0) {
      // Swap with the previous item
      [currentLevel[itemIndex], currentLevel[itemIndex - 1]] = 
      [currentLevel[itemIndex - 1], currentLevel[itemIndex]];
      
      setHierarchyData(newHierarchy);
      setSaveStatus('Cambios pendientes de guardar');
    }
  };
  
  const moveItemDown = (item, parentPath = []) => {
    const newHierarchy = JSON.parse(JSON.stringify(hierarchyData));
    let currentLevel = newHierarchy;
    
    // Navigate to the parent level
    for (const pathIndex of parentPath) {
      currentLevel = currentLevel[pathIndex].children;
    }
    
    // Find the item's index
    const itemIndex = currentLevel.findIndex(i => i.idMenu === item.idMenu);
    if (itemIndex < currentLevel.length - 1) {
      // Swap with the next item
      [currentLevel[itemIndex], currentLevel[itemIndex + 1]] = 
      [currentLevel[itemIndex + 1], currentLevel[itemIndex]];
      
      setHierarchyData(newHierarchy);
      setSaveStatus('Cambios pendientes de guardar');
    }
  };

  const handleDragStart = (e, item) => {
    setDragItem(item);
    e.currentTarget.classList.add('bg-blue-50', 'border-blue-300');
  };

  const handleDragOver = (e, targetItem) => {
    e.preventDefault();
    setDropTarget(targetItem);
    e.currentTarget.classList.add('bg-yellow-50', 'border-yellow-300');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-yellow-50', 'border-yellow-300');
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-yellow-50', 'border-yellow-300');
    
    if (!dragItem || !targetItem || dragItem.idMenu === targetItem.idMenu) {
      return;
    }
    
    // Recreate the hierarchy with the item moved
    const flatData = flattenHierarchy(hierarchyData);
    
    // Find the dragged item in the flat data
    const draggedItem = flatData.find(item => item.idMenu === dragItem.idMenu);
    if (!draggedItem) return;
    
    // Update the parent key to move it under the target
    draggedItem.pKey = targetItem.keyValue;
    
    // Rebuild the hierarchy
    const newHierarchy = organizeMenuHierarchy(flatData);
    setHierarchyData(newHierarchy);
    setSaveStatus('Cambios pendientes de guardar');
    
    // Reset drag state
    setDragItem(null);
    setDropTarget(null);
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');
    // Reset drag state if not already reset by drop
    if (dragItem) {
      setDragItem(null);
      setDropTarget(null);
    }
  };

  const makeItemParent = (item) => {
    const flatData = flattenHierarchy(hierarchyData);
    const itemToUpdate = flatData.find(i => i.idMenu === item.idMenu);
    
    if (itemToUpdate) {
      itemToUpdate.pKey = null;
      const newHierarchy = organizeMenuHierarchy(flatData);
      setHierarchyData(newHierarchy);
      setSaveStatus('Cambios pendientes de guardar');
    }
  };

  const saveChanges = async () => {
    setSaveStatus('Guardando...');
    
    // Convertir la jerarquía a formato plano para guardar
    const flatData = flattenHierarchy(hierarchyData);
    
    try {
      // En producción, descomentar esto:
      // await fetch('/api/menu-hierarchy', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(flatData),
      // });
      
      // Simulación de guardado para desarrollo
      console.log('Datos a guardar:', flatData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('Cambios guardados correctamente');
      
      // Resetear el mensaje después de unos segundos
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      setSaveStatus('Error al guardar los cambios');
    }
  };

  const renderItem = (item, index, parentPath = []) => {
    const isExpanded = expandedItems[item.keyValue];
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <div key={item.idMenu} className="menu-item">
        <div 
          draggable
          onDragStart={(e) => handleDragStart(e, item)}
          onDragOver={(e) => handleDragOver(e, item)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, item)}
          onDragEnd={handleDragEnd}
          className="flex items-center py-2 px-2 border border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center w-full group">
            <div style={{ width: `${parentPath.length * 24}px` }} className="flex-shrink-0" />
            
            {hasChildren ? (
              <button 
                onClick={() => toggleExpand(item.keyValue)}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <div className="flex-shrink-0 w-6 h-6" />
            )}
            
            <div className="flex-grow px-2 flex items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {/* Extraer el nombre del menú de idName si tiene formato "mnuNombre" */}
                {item.idName.startsWith('mnu') 
                  ? item.idName.substring(3) 
                  : item.idName}
              </span>
              <div className="ml-2 flex items-center">
                <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                  {item.moduleGroup}
                </span>
                <span className="mx-1 text-sm text-gray-500 dark:text-gray-400">→</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.moduleName}</span>
              </div>
              <span className="ml-auto mr-2 text-xs text-gray-400 dark:text-gray-500">ID: {item.idMenu}</span>
            </div>
            
            <div className="flex-shrink-0 flex items-center space-x-1">
              <button
                onClick={() => moveItemUp(item, parentPath)}
                className="p-1 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                title="Mover arriba"
              >
                <ArrowUp size={16} />
              </button>
              <button
                onClick={() => moveItemDown(item, parentPath)}
                className="p-1 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                title="Mover abajo"
              >
                <ArrowDown size={16} />
              </button>
              <button
                onClick={() => makeItemParent(item)}
                className="p-1 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                title="Convertir en elemento principal"
              >
                <MoveVertical size={16} />
              </button>
              <button
                className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                title="Eliminar elemento"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="pl-6">
            {item.children.map((child, childIndex) => 
              renderItem(child, childIndex, [...parentPath, index])
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Organizar Jerarquía</h2>
        <div className="flex items-center gap-2">
          {saveStatus && (
            <span className={`text-sm ${saveStatus.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
              {saveStatus}
            </span>
          )}
          <button
            onClick={saveChanges}
            className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            <Save size={16} />
            <span>Guardar</span>
          </button>
          <button className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
            <Plus size={16} />
            <span>Nuevo</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-[#1c1c24] rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex font-medium text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2">
          <div className="w-1/3">Nombre del Menú</div>
          <div className="w-1/3">Grupo / Módulo</div>
          <div className="w-1/3">Acciones</div>
        </div>
        
        <div className="p-2">
          {hierarchyData.map((item, index) => renderItem(item, index))}
        </div>
      </div>
    </div>
  );
};

export default MenuHierarchyEditor;