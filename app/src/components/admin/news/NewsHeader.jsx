"use client";

import ThemeToggle from '@/components/admin/news/ThemeToggle';

export default function NewsHeader() {
  return (
    <header className="bg-gray-900 text-white py-3 sm:py-4 relative z-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 flex justify-between items-center">
        <h1 className="text-lg sm:text-xl font-medium">Panel de Noticias</h1>
        <ThemeToggle />
      </div>
    </header>
  );
}