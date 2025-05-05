"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Copy,
  Newspaper,
  Menu,
  Users,
  Video,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import clsx from 'clsx';

import { useTheme } from "@/context/theme";
import { useAuth } from "@/context/auth"; // Import useAuth hook
import { useCompany } from '@/context/CompanyContext';

import IconModulos from "@/components/icons/sidebar/IconModulos";
import IconNucleares from "@/components/icons/sidebar/IconNucleares";
import IconFinancieros from "@/components/icons/sidebar/IconFinancieros";
import IconAuxiliares from "@/components/icons/sidebar/IconAuxiliares";

const DefaultIcon = Menu;

// Función para determinar el elemento activo basado en la ruta
function getActiveItemFromPath(pathname) {
  if (pathname === '/' || pathname === '') {
    return 'Dashboard';
  } else if (pathname.includes('/admin/news') || pathname.includes('/news')) {
    return 'Noticias';
  } else if (pathname.includes('/admin/menus')) {
    return 'AdminMenus';
  } else if (pathname.includes('/admin/users')) {
    return 'AdminUsers';
  } else if (pathname.includes('/admin/videos')) {
    return 'AdminVideos';
  } else if (pathname.includes('/nucleares')) {
    return 'NUCLEARES';
  } else if (pathname.includes('/financieros')) {
    return 'FINANCIAL';
  } else if (pathname.includes('/auxiliares')) {
    return 'AUXILIARES';
  } else if (pathname.startsWith('/custom/')) {
    return pathname;
  }
  // Default fallback
  return 'Dashboard';
}

const SidebarItem = ({ icon: Icon, text, active = false, onClick, indent = false }) => (
  <button
    onClick={onClick}
    className={clsx(
      "font-[Poppins] w-full py-2 px-5 flex items-center gap-3 text-[12px] rounded-md transition-all duration-150 font-medium",
      active
        ? 'bg-[var(--primary-color)] text-white shadow-sm'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
      indent && 'pl-8'
    )}
  >
    {typeof Icon === "function" ? (
      <Icon size={16} color={active ? "#FFFFFF" : "#6B7280"} />
    ) : (
      <Icon size={16} className={active ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
    )}
    {text}
  </button>
);

const ExpandableItem = ({ icon: Icon, text, children, defaultOpen = false, isChildActive = false }) => {
  const [open, setOpen] = useState(defaultOpen || isChildActive);

  // Si algún hijo está activo, asegurarse de que este grupo esté abierto
  useEffect(() => {
    if (isChildActive && !open) {
      setOpen(true);
    }
  }, [isChildActive, open]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          "font-[Poppins] w-full px-5 py-2 flex items-center justify-between text-[12px] font-medium rounded-md transition-colors duration-150",
          open || isChildActive
            ? 'bg-[#F2F6FD] dark:bg-[#31313e]'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#31313e]'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon size={16} className={open || isChildActive ? 'text-[var(--primary-color)]' : 'text-gray-500 dark:text-gray-400'} />
          <span className={open || isChildActive ? 'text-[var(--primary-color)] dark:text-white' : ''}>{text}</span>
        </div>
        {open
          ? <ChevronDown size={16} className="text-[var(--primary-color)]" />
          : <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />}
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

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { selectedCompany } = useCompany();
  const { user, isAdmin } = useAuth();
  const [customParents, setCustomParents] = useState([]);
  const [activeItem, setActiveItem] = useState(() => getActiveItemFromPath(pathname));

  useEffect(() => {
    async function fetchCustomMenu() {
      try {
        const res = await fetch('http://localhost:5173/mslauncher/api/v1/MenuCustomOption', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ idCompany: selectedCompany.idCompany })
        });
        const { data } = await res.json();
        const custom = data.options.custom || [];

        setCustomParents(
          custom
            .filter(c => c.idMenuParent === null)
            .map(c => ({
              id: c.idCustomOption,
              label: c.textOption,
              route: c.resourceUrl || `/custom/${c.idCustomOption}`
            }))
        );
      } catch (err) {
        console.error('Sidebar: error fetching menu', err);
      }
    }
    if (selectedCompany?.idCompany) fetchCustomMenu();
  }, [selectedCompany]);

  useEffect(() => {
    const ai = getActiveItemFromPath(pathname);
    if (ai !== activeItem) setActiveItem(ai);
  }, [pathname, activeItem]);

  const navigateTo = (route, itemName) => {
    setActiveItem(itemName);
    router.push(route);
    if (onClose) onClose();
  };

  const isDivisionActive = ['NUCLEARES', 'FINANCIAL', 'AUXILIARES'].includes(activeItem);

  function formatServer(server) {
    if (!server) return '';
    let hostPart = server;
    let portOrInstance = '';
    if (server.includes(':')) {
      [hostPart, portOrInstance] = server.split(':');
      portOrInstance = ':' + portOrInstance;
    } else if (server.includes('\\')) {
      [hostPart, portOrInstance] = server.split('\\');
      portOrInstance = '\\' + portOrInstance;
    }
    const parts = hostPart.split('.');
    const last = parts.pop();
    const maskedParts = parts.map(part => '*'.repeat(part.length));
    return maskedParts.concat(last).join('.') + portOrInstance;
  }

  return (
    <div className="w-60 h-screen flex flex-col bg-white dark:bg-[#1c1c24] fixed top-0 left-0 z-10 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="h-24 flex items-center justify-center border-b border-gray-100 dark:border-gray-700">
        <Link href="/" onClick={() => setActiveItem('Dashboard')}>
          <Image src="/logoAdvan.svg" alt="Logo" width={200} height={70} priority/>
        </Link>
      </div>

      {/* Menú */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar">
        <p className="text-[12px] text-gray-400 dark:text-gray-500">Menú</p>

        <SidebarItem
          icon={LayoutGrid}
          text="Dashboard"
          active={activeItem === "Dashboard"}
          onClick={() => navigateTo('/', 'Dashboard')}
        />

        <ExpandableItem
          icon={IconModulos}
          text="Divisiones"
          defaultOpen={true}
          isChildActive={isDivisionActive}
        >
          {/* Ítems estáticos predefinidos */}
          <SidebarItem
            icon={({ size }) => (
              <IconNucleares
                size={size}
                color={activeItem === "NUCLEARES" ? "#FFFFFF" : "#6B7280"}
              />
            )}
            text="Nucleares"
            indent
            active={activeItem === "NUCLEARES"}
            onClick={() => navigateTo('/divisiones/nucleares', 'NUCLEARES')}
          />

          <SidebarItem
            icon={({ size }) => (
              <IconFinancieros
                size={size}
                color={activeItem === "FINANCIAL" ? "#FFFFFF" : "#6B7280"}
              />
            )}
            text="Financieros"
            indent
            active={activeItem === "FINANCIAL"}
            onClick={() => navigateTo('/divisiones/financieros', 'FINANCIAL')}
          />

          <SidebarItem
            icon={({ size }) => (
              <IconAuxiliares
                size={size}
                color={activeItem === "AUXILIARES" ? "#FFFFFF" : "#6B7280"}
              />
            )}
            text="Auxiliares"
            indent
            active={activeItem === "AUXILIARES"}
            onClick={() => navigateTo('/divisiones/auxiliares', 'AUXILIARES')}
          />
        </ExpandableItem>

        {/* Show Noticias for all users, but with different routes */}
        <SidebarItem
          icon={Newspaper}
          text="Noticias"
          active={activeItem === 'Noticias'}
          onClick={() => navigateTo(isAdmin ? '/admin/news' : '/news', 'Noticias')}
        />
        
        {/* Only show admin-specific menu items if user is an admin */}
        {isAdmin && (
          <>
            <SidebarItem
              icon={Menu}
              text="Admin Menús"
              active={activeItem === 'AdminMenus'}
              onClick={() => navigateTo('/admin/menus', 'AdminMenus')}
            />
            <SidebarItem
              icon={Users}
              text="Admin Usuarios"
              active={activeItem === 'AdminUsers'}
              onClick={() => navigateTo('/admin/users', 'AdminUsers')}
            />
            <SidebarItem
              icon={Video}
              text="Admin Videos"
              active={activeItem === 'AdminVideos'}
              onClick={() => navigateTo('/admin/videos', 'AdminVideos')}
            />
          </>
        )}

        {/* CUSTOM PARENTS al final */}
        {customParents.map(p => (
          <SidebarItem
            key={p.id}
            icon={DefaultIcon}
            text={p.label}
            active={activeItem === `/custom/${p.id}`}
            onClick={() => navigateTo(p.route, `/custom/${p.id}`)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-gray-100 dark:border-gray-700 px-4 py-5">
        <div className="bg-white dark:bg-[#1c1c24] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 space-y-3">
          <InfoItem label="Versión de licencia" value="12345" />
          <InfoItem label="Versión de BD" value="12345" />
          <InfoItem label="IP" value={formatServer(selectedCompany?.serverErpDb) || 'Desconocido'} />
          {/* Display user profile if available */}
          {user && user.profileName && (
            <InfoItem label="Perfil" value={user.profileName} />
          )}
        </div>
        <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex items-center justify-between text-[11px] font-medium text-gray-600 dark:text-gray-300">
          <button
            onClick={() => setTheme("light")}
            className={clsx("w-1/2 py-1.5 text-center rounded-full transition-all", theme === 'light' && 'bg-white text-gray-800 shadow')}
          >
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={clsx("w-1/2 py-1.5 text-center rounded-full transition-all", theme === 'dark' && 'bg-white text-gray-800 shadow')}
          >
            Dark
          </button>
        </div>
      </div>
    </div>
  );
}