import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { MenuItem } from './MenuItem';
import { menuStructure } from './data/menuStructure';

export const SideMenu = ({ onDrop, onDragOver, onDragStart, onTouchStart }) => {
  const [expandedSections, setExpandedSections] = useState(['transacciones']);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-white shadow-md"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Sidebar */}
      <div 
        className={`fixed lg:static inset-y-0 left-0 z-20 w-64
          bg-gray-100 border-r border-gray-200 shadow-lg lg:shadow-sm 
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        data-drop-zone="menu"
      >
        {/* Menu Items */}
        <div 
          className="py-16 lg:py-4 space-y-1 h-full overflow-y-auto"
          onDrop={onDrop} 
          onDragOver={onDragOver}
        >
          {menuStructure.map(section => (
            <MenuItem
              key={section.id}
              section={section}
              expanded={expandedSections.includes(section.id)}
              onToggle={toggleSection}
              onDragStart={onDragStart}
              onTouchStart={onTouchStart}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default SideMenu;