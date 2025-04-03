'use client';

import { Component } from 'react';
import Image from 'next/image';

const modules = [
  {
    name: 'Nucleares',
    description: 'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
    icon: '/icons/module-placeholder.svg', // Usa un icono personalizado o un emoji
  },
  {
    name: 'Financieros',
    description: 'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
    icon: '/icons/module-placeholder.svg',
  },
  {
    name: 'Auxiliares',
    description: 'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
    icon: '/icons/module-placeholder.svg',
  },
];

const ModuleGridSection = () => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {modules.map((mod) => (
        <div
          key={mod.name}
          className="bg-white border border-gray-200 rounded-md px-4 py-6 text-center hover:shadow-sm transition"
        >
          <div className="mx-auto mb-4 h-10 w-10">
            <Image
              src={mod.icon}
              alt={mod.name}
              width={40}
              height={40}
              className="mx-auto object-contain opacity-80"
            />
          </div>
          <h3 className="text-base font-semibold text-gray-800">{mod.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{mod.description}</p>
        </div>
      ))}
    </section>
  );
};

export default ModuleGridSection;
