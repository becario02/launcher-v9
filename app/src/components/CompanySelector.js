'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Building2 } from 'lucide-react';

const companies = ['EMPRESA 1', 'EMPRESA 2'];

export default function CompanySelector() {
  const [selected, setSelected] = useState(companies[0]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full sm:w-56 text-sm font-medium text-gray-700">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between border border-gray-300 ${
          open ? 'rounded-t-lg border-b-0' : 'rounded-lg'
        } px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 bg-white ${
          open ? '' : 'overflow-hidden'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border border-gray-300">
            <Building2 size={16} className="text-gray-500" />
          </div>
          <span className="text-xs sm:text-[13px] font-medium">{selected}</span>
        </div>
        {open ? (
          <ChevronUp size={18} className="text-gray-500" />
        ) : (
          <ChevronDown size={18} className="text-gray-500" />
        )}
      </button>

      {open && (
        <ul className="absolute top-full w-full bg-white border border-gray-300 border-t-0 rounded-b-lg shadow z-10 overflow-hidden">
          {companies
            .filter((company) => company !== selected)
            .map((company, idx) => (
              <li
                key={idx}
                onClick={() => {
                  setSelected(company);
                  setOpen(false);
                }}
                className="cursor-pointer px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-100 flex items-center gap-2 sm:gap-3"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border border-gray-300">
                  <Building2 size={16} className="text-gray-500" />
                </div>
                <span className="text-xs sm:text-[13px] font-medium">{company}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
