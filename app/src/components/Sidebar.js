"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Copy,
  FolderTree,
  FileText,
  Shield,
  LayoutGrid,
  Newspaper,
} from "lucide-react";
import Image from 'next/image';

const SidebarItem = ({ icon: Icon, text, active = false, onClick, indent = false }) => (
  <button
    onClick={onClick}
    className={`font-[Poppins] w-full py-2 px-5 flex items-center gap-3 text-[12px] rounded-md transition-all duration-150 font-medium
      ${active ? 'bg-[#007BFF] text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}
      ${indent ? 'pl-8' : ''}`}
  >
    <Icon size={16} className={`${active ? 'text-white' : 'text-gray-500'}`} />
    {text}
  </button>
);

const ExpandableItem = ({ icon: Icon, text, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`font-[Poppins] w-full px-5 py-2 flex items-center justify-between text-[12px] font-medium rounded-md transition-colors duration-150 text-gray-700 hover:bg-gray-100 ${open ? 'bg-[#F2F6FD] text-[#007BFF]' : ''}`}
      >
        <div className="flex items-center gap-3">
          <Icon size={16} className={open ? 'text-[#007BFF]' : 'text-gray-500'} />
          {text}
        </div>
        {open ? <ChevronDown size={16} className="text-[#007BFF]" /> : <ChevronRight size={16} className="text-gray-500" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="py-1 space-y-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="flex items-center justify-between text-[11px] text-gray-700">
    <div>
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className="font-medium text-gray-800 mt-0.5 text-[11px]">{value}</p>
    </div>
    <button
      onClick={() => navigator.clipboard.writeText(value)}
      className="p-1 hover:bg-gray-100 rounded"
    >
      <Copy size={14} className="text-gray-400 hover:text-gray-600" />
    </button>
  </div>
);

const Sidebar = () => {
  const [theme, setTheme] = useState("light");
  const [activeItem, setActiveItem] = useState("Dashboard");

  return (
    <div className="w-60 h-screen flex flex-col bg-white text-gray-800 fixed top-0 left-0 z-10 border-r border-gray-200">
      {/* Header */}
      <div className="h-24 w-60 flex items-center justify-center border-b border-gray-100">
        <Image
          src="/logoAdvan.svg"
          alt="Advan Logo"
          width={200}
          height={70}
          className="h-auto"
          priority
        />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-thin">
        <p className="text-[12px] text-gray-400 px-4 pt-1 px-0">Menú</p>

        <SidebarItem
          icon={LayoutGrid}
          text="Dashboard"
          active={activeItem === "Dashboard"}
          onClick={() => setActiveItem("Dashboard")}
        />

        <ExpandableItem icon={FolderTree} text="Divisiones" defaultOpen>
          <SidebarItem
            icon={FileText}
            text="Nucleares"
            indent
            active={activeItem === "Nucleares"}
            onClick={() => setActiveItem("Nucleares")}
          />
          <SidebarItem
            icon={FileText}
            text="Financieros"
            indent
            active={activeItem === "Financieros"}
            onClick={() => setActiveItem("Financieros")}
          />
          <SidebarItem
            icon={Shield}
            text="Auxiliares"
            indent
            active={activeItem === "Auxiliares"}
            onClick={() => setActiveItem("Auxiliares")}
          />
        </ExpandableItem>

        <SidebarItem
          icon={Newspaper}
          text="Noticias"
          active={activeItem === "Noticias"}
          onClick={() => setActiveItem("Noticias")}
        />
      </div>

      {/* Footer info */}
      <div className="mt-auto border-t border-gray-100 px-4 py-5">
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 space-y-3">
          <InfoItem label="Versión de licencia" value="12345" />
          <InfoItem label="Versión de BD" value="12345" />
          <InfoItem label="IP" value="12345" />
        </div>

        {/* Theme toggle (estático) */}
        <div className="mt-4 bg-gray-100 rounded-full p-1 flex items-center justify-between w-full text-[11px] font-medium text-gray-600">
          <div
            className={`w-1/2 py-1.5 text-center rounded-full transition-all duration-200 ${theme === 'light' ? 'bg-white text-gray-800 shadow' : ''}`}
          >
            Light
          </div>
          <div
            className={`w-1/2 py-1.5 text-center rounded-full transition-all duration-200 ${theme === 'dark' ? 'bg-white text-gray-800 shadow' : ''}`}
          >
            Dark
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
