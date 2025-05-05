'use client';

import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Notification from '@/components/admin/news/Notification';
import SubMenu from '@/components/SubMenu';
import InstanceModal from '@/components/InstanceModal';

import { Flag, Search, Eye, X, Plus } from 'lucide-react';
import { useModulePage } from '@/hooks/useModulePage';

export default function ModulePage() {
  const {
    division,
    moduleParam,
    primaryColor,
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
    isLoading,
    subMenuItems,
    menuOrdenado,
    notification,
    closeNotification,
    isItemInShortcuts,
    handleAddShortcut,
    addNewInstance,
    removeInstance,
  } = useModulePage();

  const breadcrumbItems = [
    { name: division, path: `/divisiones/${division}` },
    { name: moduleParam, path: `/divisiones/${division}/${moduleParam}` }
  ];

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
                  onClick={() => setActiveInstance(inst.id)}
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

          {/* Contenedor principal */}
          <div className="flex h-[calc(100vh-15rem)] mt-4">
            {/* Menú lateral */}
            <div className="w-56 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C1C24] rounded-l-md overflow-y-auto py-4">
              {menuOrdenado.map(menuName => {
                const existingItem = menuData.find(item => item.name === menuName);
                const item = existingItem || {
                  id: `default-${menuName}`,
                  name: menuName,
                  icon: existingItem?.icon || 'FileText'
                };
                const IconComponent = typeof item.icon === 'string' ? require('lucide-react')[item.icon] : item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMenuItem(item.id)}
                    className={`flex items-center px-4 py-3 text-sm cursor-pointer border-l-4 ${
                      selectedMenuItem === item.id
                        ? 'font-medium bg-opacity-10'
                        : 'border-transparent hover:bg-opacity-5'
                    }`}
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
                    <IconComponent
                      className={`w-5 h-5 mr-3 ${
                        selectedMenuItem === item.id ? '' : 'text-gray-500 dark:text-gray-400'
                      }`}
                      style={selectedMenuItem === item.id ? { color: primaryColor } : {}}
                    />
                    {item.name}
                  </div>
                );
              })}
            </div>

            {/* Panel principal */}
            <div className="flex-1 border border-t border-r border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C1C24] rounded-r-md overflow-y-auto">
              <div className="p-3">
                {isLoading ? (
                  <div className="flex justify-center items-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  selectedMenuItem && (
                    <SubMenu
                      items={subMenuItems[selectedMenuItem] || []}
                      expandedItems={expandedItems}
                      toggleItemExpansion={id => setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }))}
                      handleAddShortcut={handleAddShortcut}
                      isItemInShortcuts={isItemInShortcuts}
                      primaryColor={primaryColor}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <InstanceModal
        isOpen={showInstancesModal}
        onClose={() => setShowInstancesModal(false)}
        instances={instances}
        division={division}
        moduleParam={moduleParam}
        primaryColor={primaryColor}
      />
    </div>
  );
}