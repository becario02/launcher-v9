'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Save,
  Plus,
  ArrowUp,
  ArrowDown,
  MoveVertical,
  X
} from 'lucide-react';
import { useCompany } from '@/context/CompanyContext';
import Notification from '@/components/admin/news/Notification';

// Organiza un array plano en jerarquía
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

// Aplana la jerarquía para guardar
const flattenHierarchy = (hier) => {
  const out = [];
  const dfs = (nodes, parent = null) => {
    nodes.forEach(n => {
      const { children, ...flat } = n;
      flat.pKey = parent;
      out.push(flat);
      if (children) dfs(children, n.keyValue);
    });
  };
  dfs(hier);
  return out;
};

export default function MenuHierarchyEditor() {
  const { selectedCompany } = useCompany();
  const [hierarchyData, setHierarchyData] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [newMenuText, setNewMenuText] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newParentId, setNewParentId] = useState('');
  const [dragItem, setDragItem] = useState(null);

  const originalDataRef = useRef([]);

  const [changedItems, setChangedItems] = useState(new Set());

  const [availableRoutes, setAvailableRoutes] = useState([]);

  const [notification, setNotification] = useState({
    visible: false,
    type: 'info',
    message: '',
    style: 'inline'
  });
  const showNotification = (type, message, style = 'inline') => {
    setNotification({ visible: false, type: 'info', message: '', style });
    setTimeout(() => setNotification({ visible: true, type, message, style }), 50);
  };
  const closeNotification = () => setNotification(n => ({ ...n, visible: false }));

  const [confirmModal, setConfirmModal] = useState({ open: false, type: '' });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  const openConfirm = (type) => {
    setConfirmModal({ open: true, type });
    setConfirmMessage(type === 'save' ? 'Guardando cambios…' : 'Creando opción…');
  };
  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmModal({ open: false, type: '' });
  };

  useEffect(() => {
    fetch('/api/routes')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setAvailableRoutes)
      .catch(err => {
        console.error('Error cargando rutas:', err);
        showNotification('error', 'No se pudieron cargar rutas', 'toast');
      });
  }, []);

  const loadMenuData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/menu-custom-option', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idCompany: selectedCompany.idCompany })
      });
      const { data } = await res.json();
      const builtIn = data.options.builtIn || [];
      const custom  = data.options.custom  || [];

      const allOptions = [...builtIn];
      const menuIdMap = {};
      builtIn.forEach(i => menuIdMap[i.idMenu] = i.keyValue);

      custom.forEach(c => {
        const key = `custom-${c.idCustomOption}`;
        const p = c.idMenuParent !== null
          ? (menuIdMap[c.idMenuParent] || `custom-${c.idMenuParent}`)
          : null;
        allOptions.push({
          idMenu: c.idCustomOption,
          moduleGroup: 'PERSONALIZADOS',
          moduleName: '',
          textOption: c.textOption,
          keyValue: key,
          pKey: p,
          resourceUrl: c.resourceUrl
        });
      });

      const organized = organizeMenuHierarchy(allOptions);
      setHierarchyData(organized);
      originalDataRef.current = organized;
      setChangedItems(new Set());
      const exp = {};
      allOptions.forEach(i => exp[i.keyValue] = true);
      setExpandedItems(exp);
    } catch (e) {
      console.error(e);
      showNotification('error', 'Error cargando menú', 'toast');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedCompany?.idCompany) loadMenuData();
  }, [selectedCompany, loadMenuData]);

  const markChanged = (key) => setChangedItems(prev => new Set(prev).add(key));
  const clearChanges = () => {
    setHierarchyData(originalDataRef.current);
    setChangedItems(new Set());
  };

  const saveChanges = async () => {
    const flat = flattenHierarchy(hierarchyData);
    const toSave = flat.filter(i => i.moduleGroup === 'PERSONALIZADOS' && changedItems.has(i.keyValue));
    for (const i of toSave) {
      const p = flat.find(x => x.keyValue === i.pKey);
      await fetch('/api/menu-custom-option/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idCustomOption: i.idMenu,
          idMenuParent: p ? p.idMenu : null
        })
      });
    }
    showNotification('success', 'Cambios guardados', 'toast');
    setChangedItems(new Set());
  };

  const handleAdd = async () => {
    await fetch('/api/menu-custom-option/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idMenuParent: newParentId ? Number(newParentId) : null,
        textOption: newMenuText,
        resourceUrl: newResourceUrl
      })
    });
    setNewMenuText('');
    setNewResourceUrl('');
    setNewParentId('');
    await loadMenuData();
    showNotification('success', 'Opción agregada', 'toast');
  };

  const handleConfirm = async () => {
    setConfirmLoading(true);
    try {
      if (confirmModal.type === 'save') await saveChanges();
      else await handleAdd();
      closeConfirm();
    } catch {
      showNotification('error', 'Operación fallida', 'toast');
    } finally {
      setConfirmLoading(false);
    }
  };

  const toggleExpand = k => setExpandedItems(e => ({ ...e, [k]: !e[k] }));
  const moveUp = (it, path = []) => {
    const h = JSON.parse(JSON.stringify(hierarchyData));
    let lvl = h; path.forEach(i => lvl = lvl[i].children);
    const idx = lvl.findIndex(x => x.idMenu === it.idMenu);
    if (idx > 0) {
      [lvl[idx - 1], lvl[idx]] = [lvl[idx], lvl[idx - 1]];
      setHierarchyData(h);
      markChanged(it.keyValue);
    }
  };
  const moveDown = (it, path = []) => {
    const h = JSON.parse(JSON.stringify(hierarchyData));
    let lvl = h; path.forEach(i => lvl = lvl[i].children);
    const idx = lvl.findIndex(x => x.idMenu === it.idMenu);
    if (idx < lvl.length - 1) {
      [lvl[idx + 1], lvl[idx]] = [lvl[idx], lvl[idx + 1]];
      setHierarchyData(h);
      markChanged(it.keyValue);
    }
  };
  const onDragStart = (e, it) => {
    if (it.moduleGroup === 'PERSONALIZADOS') {
      setDragItem(it);
      e.currentTarget.classList.add('bg-blue-50','border-blue-300');
    }
  };
  const onDragOver = e => { if (dragItem?.moduleGroup === 'PERSONALIZADOS') e.preventDefault(); };
  const onDrop = (e, target) => {
    if (!dragItem) return;
    e.preventDefault();
    const flat = flattenHierarchy(hierarchyData);
    flat.find(x => x.keyValue === dragItem.keyValue).pKey = target.keyValue;
    setHierarchyData(organizeMenuHierarchy(flat));
    markChanged(dragItem.keyValue);
    setDragItem(null);
  };
  const makeRoot = it => {
    const flat = flattenHierarchy(hierarchyData);
    const u = flat.find(x => x.keyValue === it.keyValue);
    if (u) {
      u.pKey = null;
      setHierarchyData(organizeMenuHierarchy(flat));
      markChanged(it.keyValue);
    }
  };

  // Función de traducción de los nombres de grupos
  const translateModuleGroup = (group) => {
    const translations = {
      'AUXILIARIES': 'AUXILIARES',
      'FINANCIAL': 'FINANCIEROS',
      'OPERATIVES': 'NUCLEARES',
      'CUSTOM': 'PERSONALIZADOS'
    };
    return translations[group] || group;
  };

  const renderItem = (item, idx, path = []) => {
    const exp = expandedItems[item.keyValue];
    const has = !!item.children?.length;
    const custom = item.moduleGroup === 'PERSONALIZADOS';
    return (
      <div key={item.keyValue} className="menu-item">
        <div
          draggable={custom}
          onDragStart={e => onDragStart(e, item)}
          onDragOver={onDragOver}
          onDrop={e => onDrop(e, item)}
          onDragEnd={() => setDragItem(null)}
          className="flex items-center py-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition border-b border-gray-100 dark:border-gray-800 last:border-b-0"
        >
          <div style={{ width: path.length * 24 }} />
          {has
            ? <button onClick={() => toggleExpand(item.keyValue)}>
                {exp ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
              </button>
            : <div style={{ width: 16 }} />
          }
          {changedItems.has(item.keyValue) && <span className="inline-block h-2 w-2 bg-red-500 rounded-full mr-1"/>}
          <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">{item.textOption}</span>
          <div className="ml-4 flex items-center">
            <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-semantic.blue dark:bg-primary-blue dark:text-white rounded">{translateModuleGroup(item.moduleGroup)}</span>
            <span className="mx-1 text-sm text-gray-500 dark:text-gray-400">→</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{item.moduleName}</span>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <button onClick={() => makeRoot(item)} title="Hacer raíz"><MoveVertical size={16}/></button>
          </div>
        </div>
        {has && exp && <div className="pl-6">{item.children.map((c,i) => renderItem(c,i,[...path,idx]))}</div>}
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
      {/* Toast */}
      {notification.visible && notification.style === 'toast' && (
        <div className="fixed top-4 right-4 z-[9999]">
          <Notification visible type={notification.type} message={notification.message} style="toast" onClose={closeNotification}/>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1c1c24] rounded-lg w-80 shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="font-medium text-gray-800 dark:text-gray-200 text-h3">
                {confirmModal.type === 'save' ? 'Confirmar actualización' : 'Confirmar creación'}
              </span>
              <button onClick={closeConfirm} disabled={confirmLoading}><X size={20} className="text-gray-500 dark:text-gray-400"/></button>
            </div>
            {confirmLoading ? (
              <div className="px-4 py-6 flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mb-3"></div>
                <span className="text-gray-700 dark:text-gray-300">{confirmMessage}</span>
              </div>
            ) : (
              <>
                <div className="px-4 py-4 text-gray-600 dark:text-gray-300 text-p">
                  {confirmModal.type === 'save'
                    ? '¿Deseas guardar los cambios realizados en la jerarquía?'
                    : '¿Deseas agregar esta nueva opción al menú?'}
                </div>
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2 text-p">
                  <button onClick={closeConfirm} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400">
                    Cancelar
                  </button>
                  <button onClick={handleConfirm} className="px-4 py-2 bg-primary-blue text-white rounded flex items-center gap-2 hover:bg-blue-600">
                    <Save size={16}/> Guardar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-h2 font-bold text-gray-800 dark:text-white">Agregar opciones personalizadas</h2>
      </div>

      {/* Inline Add */}
      
        <div className="mb-4 bg-white dark:bg-[#1c1c24] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex bg-gray-100 dark:bg-gray-800 px-4 py-2 text-h3 text-gray-500 dark:text-gray-400	border-b border-gray-200 dark:border-gray-700">
            <span className="font-medium">Nueva Opción</span>
          </div>
          <div className="p-4 text-p grid grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nombre del menú"
              value={newMenuText}
              onChange={e => setNewMenuText(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900	border border-gray-300 dark:border-gray-600 rounded"
            />
            <select
              value={newParentId}
              onChange={e => setNewParentId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900	border border-gray-300 dark:border-gray-600 rounded"
            >
              <option value="">-- raíz --</option>
              {flattenHierarchy(hierarchyData).map(opt => (
                <option key={opt.keyValue} value={opt.idMenu}>{opt.idName}</option>
              ))}
            </select>
            <input
              list="route-list"
              placeholder="URL recurso"
              value={newResourceUrl}
              onChange={e => setNewResourceUrl(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900	border border-gray-300 dark:border-gray-600 rounded"
            />
            <datalist id="route-list">
              {availableRoutes.map(rt => {
                const url = rt.url.startsWith('/') ? rt.url : `/${rt.url}`;
                return <option key={url} value={url} />;
              })}
            </datalist>
          </div>
          <div className="px-4 py-2 flex text-p justify-end space-x-2	border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setInlineAdd(false)}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 flex items-center gap-1"
            >
              <X size={16}/> Cancelar
            </button>
            <button onClick={() => openConfirm('add')} className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2 hover:bg-blue-600">
              <Save size={16}/> Guardar
            </button>
          </div>
        </div>
    </div>
  );
}