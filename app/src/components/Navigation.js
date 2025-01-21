'use client'

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from "./Sidebar";

export default function Navigation({ children }) {
  const pathname = usePathname();
  
  if (pathname === '/') {
    return children;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}