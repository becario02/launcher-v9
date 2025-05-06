'use client';

import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Notification from '@/components/Notification';
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

        <div className="bg-[#F2F6FD] dark:bg-[#13131a] flex-1 pt-2 px-4 sm:px-6 lg:px-8 xl:px-16">
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
          <div className="flex justify-between items-center px-4 py-3 mb-[8px]">
            {/* Breadcrumb */}
            <div className="flex items-center text-p text-gray-400 dark:text-gray-500">
              {breadcrumbItems.map((item, idx) => (
                <div key={idx} className="flex items-center">
                  <Link
                    href={item.path}
                    className={` hover:text-gray-500 dark:hover:text-gray-400 ${
                      idx === breadcrumbItems.length - 1
                        ? 'text-gray-8 dark:text-gray-300 font-medium'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </Link>
                  {idx < breadcrumbItems.length - 1 && (
                    <span className="mx-2 text-gray-500 dark:text-gray-600">›</span>
                  )}
                </div>
              ))}
            </div>

            {/* Botón de instancias abiertas */}
            <button
              onClick={() => setShowInstancesModal(true)}
              className="
                flex items-center gap-2
                w-[289px] h-[60px] bg-white
                dark:bg-[#1c1c24] border border-gray-300 dark:border-[#31313e] rounded-[10px]
                shadow-[0_25px_50px_0_rgba(169,169,169,0.17)]
                px-[10px] pr-[20px]
              "
            >
              {/* Rectángulo azul con número */}
              <div
                className="
                  flex items-center justify-center
                  w-[44px] h-[40px]
                  bg-primary text-white text-[14px] font-bold
                  rounded-[5px]
                "
              >
                {instances.length}
              </div>

              {/* Texto */}
              <p
                className=" text-gray-8
                  dark:text-[#f5f7fa]
                  font-poppins text-[14px] font-medium leading-[1.5]
                "
              >
                Instancias abiertas
              </p>

              {/* Ícono */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="ml-auto"
              >
                <path
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                  stroke="#92929d"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12c1.6-4.097 5.336-7 10-7s8.4 2.903 10 7c-1.6 4.097-5.336 7-10 7s-8.4-2.903-10-7z"
                  stroke="#92929d"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Header del módulo */}
          <div className="w-full bg-white dark:bg-[#1c1c24] border border-gray-300 dark:border-gray-700 rounded-t-[20px] shadow-sm">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center">
                <Flag className="w-5 h-5 mr-2" style={{ color: primaryColor || '#FF4081' }} />
                <h1 className="text-xl font-semibold text-gray-300 dark:text-white">
                  {moduleParam.charAt(0).toUpperCase() + moduleParam.slice(1)}
                </h1>
              </div>
              <div className="relative w-[360px] dark:bg-[#13131a] rounded-md">
                <input
                  type="text"
                  placeholder="Buscar"
                  className="
                    w-full h-[40px]
                    pl-4 pr-9 bg-[#F2F6FD] border-gray-300
                    dark:bg-[#13131a] border dark:border-[#31313e]
                    rounded-md text-p text-white
                    placeholder:text-gray-400
                    font-medium
                    focus:outline-none
                  "
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Pestañas de instancias */}
            <div className="flex border-t border-gray-200 dark:border-gray-700 overflow-x-auto">
              {instances.map((inst, index) => (
                <div
                  key={inst.id}
                  onClick={() => setActiveInstance(inst.id)}
                  className={`
                    flex items-center px-4 py-2.5 text-p cursor-pointer border-r border-gray-300 dark:border-gray-700
                    ${
                      activeInstance === inst.id
                        ? 'font-medium bg-[#F2F6FD]  dark:bg-[#13131a]'
                        : 'text-gray-400 dark:text-gray-400'
                    }
                  `}
                  style={
                    activeInstance === inst.id
                      ? { color: primaryColor || '#FF4081' }
                      : {}
                  }
                >
                  {/* Icono de Instancia */}
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                  >
                    <path 
                      d="M3 9h18M3 5h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z" 
                      stroke={activeInstance === inst.id ? (primaryColor || '#FF4081') : '#92929d'} 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{inst.name}</span>
                  <button 
                      onClick={e => removeInstance(inst.id, e)} 
                      className="ml-2 hover:bg-gray-700/20 dark:hover:bg-gray-700/40 rounded-full p-0.5"
                    >
                      <svg 
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M17 7 7 17M7 7l10 10" 
                          stroke={activeInstance === inst.id ? (primaryColor || '#FF4081') : '#92929d'} 
                          strokeWidth="1.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                </div>
              ))}
              <button
                onClick={addNewInstance}
                className="flex items-center justify-center w-12 py-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-300 dark:hover:text-gray-400 border-r border-gray-300 dark:border-gray-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contenedor principal */}
          <div className="flex min-h-[50vh] overflow-auto bg-white dark:bg-[#1c1c24] rounded-b-[20px] border-r border-l border-b border-gray-300 dark:border-gray-700">
            {/* Menú lateral */}
            <div className="min-w-56 border-r border-gray-300 dark:border-gray-700 border-t-0 overflow-y-auto py-4 overflow-x-hidden">
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
                    className={`flex w-56 items-center px-4 py-3 text-p cursor-pointer rounded-[10px] mx-3 ${
                      selectedMenuItem === item.id
                        ? 'font-medium bg-primary text-white'
                        : 'hover:bg-gray-700/20 text-gray-400'
                    }`}
                                        
                    style={
                      selectedMenuItem === item.id
                        ? {
                            borderColor: primaryColor || '#FF4081',
                          }
                        : {}
                    }
                  >
                    <IconComponent
                      className={`w-5 h-5 mr-3 ${
                        selectedMenuItem === item.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    />
                    {item.name}
                  </div>
                );
              })}
            </div>

            {/* Panel principal */}
            <div className="flex-1 border-t-0 overflow-y-auto">
              <div className="p-3">
                {isLoading ? (
                  <div className="flex justify-center items-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#FF4081]"></div>
                  </div>
                ) : (
                  selectedMenuItem && (
                    <SubMenu
                      items={subMenuItems[selectedMenuItem] || []}
                      expandedItems={expandedItems}
                      toggleItemExpansion={id => setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }))}
                      handleAddShortcut={handleAddShortcut}
                      isItemInShortcuts={isItemInShortcuts}
                      primaryColor={primaryColor || '#FF4081'}
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