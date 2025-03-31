'use client';

import { Trash2, GripVertical, MoreHorizontal } from 'lucide-react';

const directAccesses = [
  {
    id: 1,
    category: 'Nucleares',
    name: 'Nombre de módulo',
    isSubmodule: false,
  },
  {
    id: 2,
    category: 'Financieros',
    name: 'Nombre de módulo',
    isSubmodule: false,
  },
  {
    id: 3,
    category: 'Nucleares',
    name: 'Nombre de sub módulo',
    isSubmodule: true,
  },
];

const DirectAccessSection = () => {
  return (
    <section className="bg-white border border-gray-200 rounded-md px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase">
          Mis accesos directos
        </h2>
        <MoreHorizontal className="w-5 h-5 text-gray-400 cursor-pointer" />
      </div>

      <div className="space-y-2">
        {directAccesses.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded border border-gray-100 hover:bg-gray-100"
          >
            {/* Left side: order handle */}
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />

              {/* Path */}
              <div className="flex items-center gap-1 text-sm text-gray-700">
                <span className="font-medium">{item.category}</span>
                {item.isSubmodule && (
                  <>
                    <span>{'>'}</span>
                    <span className="text-gray-400">...</span>
                  </>
                )}
                <span>{'>'}</span>
                <span>{item.name}</span>
              </div>
            </div>

            {/* Right side: delete */}
            <button className="text-gray-400 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DirectAccessSection;
