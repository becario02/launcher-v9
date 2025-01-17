'use client'

import React, { useState } from 'react';
import { Search, User } from 'lucide-react';
import Image from 'next/image';
import ProfilePopup from './ProfilePopup';

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <nav className="w-full bg-white shadow-sm px-4 py-2 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left section - Logo */}
        <div className="flex items-center gap-2">
          <div className="h-12 w-44 relative">
            <Image
              src="/advan-logo.png"
              alt="ADVAN"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Middle section - Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar módulos"
              className="w-full px-4 py-1.5 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Right section - User Avatar */}
        <div className="flex items-center">
          <button 
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <User className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Profile Popup */}
      <ProfilePopup 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;