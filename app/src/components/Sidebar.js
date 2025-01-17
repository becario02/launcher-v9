import React from 'react';
import { Home, Info, HelpCircle, LayoutGrid } from 'lucide-react';

const SidebarButton = ({ icon: Icon, text, className = "" }) => (
  <button className={`p-2 w-full rounded-lg hover:bg-gray-100 text-gray-600 flex flex-col items-center gap-1 ${className}`}>
    <Icon size={24} />
    <span className="text-xs">{text}</span>
  </button>
);

const Sidebar = () => {
  return (
    <div className="w-20 bg-white h-screen fixed left-0 top-0 shadow-sm flex flex-col items-center pt-20">
      <div className="flex flex-col gap-4 w-full px-2">
        <SidebarButton icon={Info} text="Info" />
        <SidebarButton icon={Home} text="Inicio" />
        <SidebarButton icon={LayoutGrid} text="Módulos" />
      </div>
      <SidebarButton 
        icon={HelpCircle} 
        text="Ayuda"
        className="mt-auto mb-4" 
      />
    </div>
  );
};

export default Sidebar;