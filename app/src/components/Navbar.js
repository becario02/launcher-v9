'use client';

import React, { useState } from 'react';
import { Search, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ProfilePopup from './ProfilePopup';
import ModuleTabs from './ModuleTabs';
import { useTabs } from '@/context/tabs';

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { tabs } = useTabs();
  const showTabs = tabs.length > 0;

  return (
    <nav className={`w-full bg-white shadow-sm relative ${showTabs ? 'pb-0' : 'py-2'}`}>
      <div className="w-full h-full">
        {/* Main navbar content */}
        <div className="px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between py-2">
            {/* Left section - Logo */}
            <div className="flex items-center gap-2">
              <Link href="/" className="h-12 w-44 relative">
                <Image
                  src="/advan-logo.png"
                  alt="ADVAN"
                  fill
                  className="object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Middle section - Search */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar módulos"
                  className="w-full px-4 py-1.5 pl-10 bg-gray-50 border border-gray-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Right section - User Avatar */}
            <div className="flex items-center">
              <button 
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center 
                  cursor-pointer hover:bg-gray-200"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <User className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs section */}
        <ModuleTabs />
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