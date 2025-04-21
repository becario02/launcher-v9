"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Copy,
  Newspaper,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import clsx from 'clsx';

import { useTheme } from "@/context/theme";

import IconModulos from "@/components/icons/sidebar/IconModulos";
import IconNucleares from "@/components/icons/sidebar/IconNucleares";
import IconFinancieros from "@/components/icons/sidebar/IconFinancieros";
import IconAuxiliares from "@/components/icons/sidebar/IconAuxiliares";
import { useCompany } from '@/context/CompanyContext';

const SidebarItem = ({ icon: Icon, text, active = false, onClick, indent = false }) => (
  <button
    onClick={onClick}
    className={`font-[Poppins] w-full py-2 px-5 flex items-center gap-3 text-[12px] rounded-md transition-all duration-150 font-medium
      ${active ? 'bg-[var(--primary-color)] text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
      ${indent ? 'pl-8' : ''}`}
  >
    {typeof Icon === "function" ? (
      <Icon size={16} color={active ? "#FFFFFF" : "#6B7280"} />
    ) : (
      <Icon size={16} className={`${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
    )}
    {text}
  </button>
);

const ExpandableItem = ({ icon: Icon, text, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`font-[Poppins] w-full px-5 py-2 flex items-center justify-between text-[12px] font-medium rounded-md transition-colors duration-150
          text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#31313e]
          ${open ? 'bg-[#F2F6FD] dark:bg-[#31313e] text-[#007BFF]' : ''}`}
      >
        <div
          className={clsx(
            'flex items-center gap-3',
            open ? 'text-[var(--primary-color)] dark:text-[#f5f7fa]' : 'text-gray-700 dark:text-gray-300'
          )}
        >
          <Icon className={clsx(open ? 'text-[var(--primary-color)]' : 'text-gray-500 dark:text-gray-400')} size={16} />
          <span className="font-medium">{text}</span>
        </div>
        {open ? (
          <ChevronDown size={16} className="text-[var(--primary-color)]" />
        ) : (
          <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="py-1 space-y-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="flex items-center justify-between text-[11px] text-gray-700 dark:text-gray-300">
    <div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500">{label}</p>
      <p className="font-medium text-gray-800 dark:text-gray-200 mt-0.5 text-[11px]">{value}</p>
    </div>
    <button
      onClick={() => navigator.clipboard.writeText(value)}
      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
    >
      <Copy size={14} className="text-gray-400 hover:text-gray-600 dark:text-gray-500" />
    </button>
  </div>
);

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const { theme, setTheme } = useTheme();
  const { selectedCompany } = useCompany();
  const router = useRouter();
  
  return (
    <div className="w-60 h-screen flex flex-col bg-white dark:bg-[#1c1c24] text-gray-800 dark:text-gray-100 fixed top-0 left-0 z-10 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="h-24 w-60 flex items-center justify-center border-b border-gray-100 dark:border-gray-700">
        <Link href="/">
          <Image
            src="/logoAdvan.svg"
            alt="Advan Logo"
            width={200}
            height={70}
            className="h-auto"
            priority
          />
        </Link>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-thin">
        <p className="text-[12px] text-gray-400 dark:text-gray-500 px-4 pt-1 px-0">Menú</p>

        <SidebarItem
          icon={LayoutGrid}
          text="Dashboard"
          active={activeItem === "Dashboard"}
          onClick={() => setActiveItem("Dashboard")}
        />

        <ExpandableItem icon={IconModulos} text="Divisiones" defaultOpen>
          <SidebarItem
            icon={({ size }) => (
              <IconNucleares
                size={size}
                color={activeItem === "Nucleares" ? "#FFFFFF" : "#6B7280"}
              />
            )}
            text="Nucleares"
            indent
            active={activeItem === "Nucleares"}
            onClick={() => setActiveItem("Nucleares")}
          />

          <SidebarItem
            icon={({ size }) => (
              <IconFinancieros
                size={size}
                color={activeItem === "Financieros" ? "#FFFFFF" : "#6B7280"}
              />
            )}
            text="Financieros"
            indent
            active={activeItem === "Financieros"}
            onClick={() => setActiveItem("Financieros")}
          />

          <SidebarItem
            icon={({ size }) => (
              <IconAuxiliares
                size={size}
                color={activeItem === "Auxiliares" ? "#FFFFFF" : "#6B7280"}
              />
            )}
            text="Auxiliares"
            indent
            active={activeItem === "Auxiliares"}
            onClick={() => setActiveItem("Auxiliares")}
          />
        </ExpandableItem>

        <SidebarItem
          icon={Newspaper}
          text="Noticias"
          active={activeItem === 'Noticias'}
          onClick={() => {
            setActiveItem('Noticias');
            router.push('/admin/news');
          }}
        />
      </div>

      {/* Footer info */}
      <div className="mt-auto border-t border-gray-100 dark:border-gray-700 px-4 py-5">
        <div className="bg-white dark:bg-[#1c1c24] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 space-y-3">
          <InfoItem label="Versión de licencia" value="12345" />
          <InfoItem label="Versión de BD" value="12345" />
          <InfoItem label="IP" value={selectedCompany?.serverErpDb || 'Desconocido'} />
        </div>

        {/* Theme toggle */}
        <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex items-center justify-between w-full text-[11px] font-medium text-gray-600 dark:text-gray-300">
          <button
            onClick={() => setTheme("light")}
            className={`w-1/2 py-1.5 text-center rounded-full transition-all duration-200 ${theme === 'light' ? 'bg-white text-gray-800 shadow' : ''}`}
          >
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`w-1/2 py-1.5 text-center rounded-full transition-all duration-200 ${theme === 'dark' ? 'bg-white text-gray-800 shadow' : ''}`}
          >
            Dark
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
