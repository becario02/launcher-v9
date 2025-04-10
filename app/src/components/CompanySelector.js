'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const companies = ['Express Logistics S.A de C.V', 'Logística del Bajío S.A'];

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
    <div ref={dropdownRef} className="font-[Poppins] relative w-full sm:w-72 text-sm font-medium text-gray-700">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between border ${
          open ? 'border-[#0080ff] border-b-transparent' : 'border-gray-300'
        } ${open ? 'rounded-t-lg' : 'rounded-lg'}
          px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 bg-white transition-all z-20 relative`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 overflow-hidden">
            <Image
              src="/assets/company-selector/company-picture.jpg"
              alt="Company"
              width={36}
              height={36}
              className="object-cover"
            />
          </div>
          <span className="text-[13px] font-medium">{selected}</span>
        </div>
        <Image
          src={open ? '/assets/company-selector/icon-contrae-2.svg' : '/assets/company-selector/icon-expand.svg'}
          alt="Toggle Icon"
          width={16}
          height={16}
        />
      </button>

      {open && (
        <ul className="absolute top-full w-full bg-white border border-[#0080ff] border-t-0 rounded-b-lg shadow z-10 overflow-hidden">
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
                <div className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 overflow-hidden">
                  <Image
                    src="/assets/company-selector/company-picture2.jpg"
                    alt="Company"
                    width={36}
                    height={36}
                    className="object-cover"
                  />
                </div>
                <span className="text-[13px] font-medium">{company}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
