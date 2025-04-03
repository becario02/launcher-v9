'use client';

import { ImageIcon } from 'lucide-react';

const modules = [
  {
    name: 'Nucleares',
    description: 'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
  },
  {
    name: 'Financieros',
    description: 'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
  },
  {
    name: 'Auxiliares',
    description: 'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
  },
];

const ModuleGridSection = () => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {modules.map((mod) => (
        <div
          key={mod.name}
          className="bg-white border border-gray-200 rounded-md p-6 hover:shadow-sm transition cursor-pointer h-[300px] flex"
        >
          <div className="flex flex-col items-start justify-center">
            <div className="mb-3">
              <div className="w-14 h-14 text-gray-600">
                <ImageIcon className="w-full h-full" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-lg font-normal text-gray-900 mb-2">{mod.name}</h3>
            <p className="text-xs text-gray-500 leading-normal">
              Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.
            </p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default ModuleGridSection;
