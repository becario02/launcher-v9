'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import WelcomeSection from '@/components/WelcomeSection';
import DirectAccessSection from '@/components/DirectAccessSection';
import ModuleGridSection from '@/components/ModuleGridSection';
import NotificationsPanel from '@/components/NotificationsPanel';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      {/* Sidebar Desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="relative z-50 w-64 h-full bg-white shadow-lg">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      <div className="flex-1 md:ml-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-screen bg-[#f7f7f7] pt-14">
          <div className="max-w-5xl mx-auto px-6 space-y-6">
            <WelcomeSection />
            <DirectAccessSection />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              <div className="lg:col-span-3">
                <ModuleGridSection />
              </div>
              <div className="lg:col-span-1">
                <NotificationsPanel />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}