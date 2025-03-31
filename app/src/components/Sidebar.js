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
  CornerDownRight,
  LayoutGrid,
  Newspaper,
} from "lucide-react";
import Image from 'next/image';

const SidebarItem = ({ icon: Icon, text, active = false, onClick, indent = false }) => (
  <button
    onClick={onClick}
    className={`w-full py-2 px-4 flex items-center gap-3 text-sm rounded-md transition-colors
      ${active ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-100'}
      ${indent ? 'pl-8' : ''}
    `}
  >
    <Icon size={18} />
    <span className="uppercase">{text}</span>
  </button>
);

const ExpandableItem = ({ icon: Icon, text, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-100 rounded-md"
      >
        <div className="flex items-center gap-3">
          <Icon size={18} />
          <span className="uppercase text-[13px] font-medium">{text}</span>
        </div>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
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
  <div className="flex items-center justify-between text-sm text-gray-700">
    <div>
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
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
    <div className="w-64 h-screen flex flex-col border-r border-gray-200 bg-white fixed top-0 left-0 z-10">
      {/* Header */}
      <div
        className="h-16 w-64 flex items-center justify-center"
        style={{ backgroundColor: '#757575' }}
      >
        <Image
          src="/logoAdvan-white.svg"
          alt="Advan Logo"
          width={160}
          height={50}
          className="h-auto"
          priority
        />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-1 py-8 space-y-2 scrollbar-thin">
        <SidebarItem
          icon={LayoutGrid}
          text="Dashboard"
          active={activeItem === "Dashboard"}
          onClick={() => setActiveItem("Dashboard")}
        />

        <ExpandableItem icon={FolderTree} text="Módulos" defaultOpen>
          <SidebarItem
            icon={CornerDownRight}
            text="Nucleares"
            indent
            active={activeItem === "Nucleares"}
            onClick={() => setActiveItem("Nucleares")}
          />
          <SidebarItem
            icon={CornerDownRight}
            text="Financieros"
            indent
            active={activeItem === "Financieros"}
            onClick={() => setActiveItem("Financieros")}
          />
          <SidebarItem
            icon={CornerDownRight}
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
      <div className="border-t px-4 py-4 space-y-3 text-sm text-gray-700">
        <InfoItem label="Versión de licencia" value="12345" />
        <InfoItem label="Versión de BD" value="12345" />
        <InfoItem label="IP" value="12345" />

        {/* Divider */}
        <div className="my-3 border-t border-gray-200 mx-2" />

        {/* Theme toggle */}
        <div className="bg-gray-100 rounded-full p-1 flex">
          <button
            onClick={() => setTheme("light")}
            className={`flex items-center justify-center gap-1 w-1/2 py-1.5 text-xs rounded-full transition-colors ${
              theme === "light"
                ? "bg-white shadow-sm text-gray-800"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Sun size={12} />
            <span>Light</span>
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex items-center justify-center gap-1 w-1/2 py-1.5 text-xs rounded-full transition-colors ${
              theme === "dark"
                ? "bg-white shadow-sm text-gray-800"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Moon size={12} />
            <span>Dark</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
