"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Copy,
  Newspaper,
  Network,
  Menu,
  Users,
  Video,
  Shield,
  Settings,
  Bell,
  Gift,
  HelpCircle,
  FileText as DocumentIcon,
  BarChart3,
  Truck,
  Building2,
  UserCheck,
  Activity,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import Cookies from "js-cookie";

import { useTheme } from "@/context/theme";
import { useAuth } from "@/context/auth";
import { useCompany } from "@/context/CompanyContext";

import IconModulos from "@/components/icons/sidebar/IconModulos";
import IconNucleares from "@/components/icons/sidebar/IconNucleares";
import IconFinancieros from "@/components/icons/sidebar/IconFinancieros";
import IconAuxiliares from "@/components/icons/sidebar/IconAuxiliares";

const DefaultIcon = Menu;

// Function to determine active item based on route
function getActiveItemFromPath(pathname, customOptions = []) {
  if (pathname === "/" || pathname === "") {
    return "Dashboard";
  } else if (pathname.includes("/admin/news") || pathname.includes("/news")) {
    return "Noticias";
  } else if (pathname.includes("/admin/menus")) {
    return "AdminMenus";
  } else if (pathname.includes("/admin/users")) {
    return "AdminUsers";
  } else if (pathname.includes("/admin/videos")) {
    return "AdminVideos";
  } else if (pathname.includes("/admin/documents")) {
    return "AdminDocumentos";
  } else if (pathname.includes("/admin/notifications")) {
    return "AdminNotifications";
  } else if (pathname.includes("/admin/promociones")) {
    return "AdminPromociones";
  } else if (pathname.includes("/admin/create-company")) {
    return "AdminCreateCompany";
  }else if (pathname.includes("/admin/conexioneserp")) {
    return "conexioneserp";
  } else if (pathname.includes("/admin/menu-tracking")) {
    return "AdminMenuTracking";
  } else if (pathname.includes("/advanpac/pacs")) {
    return "AdvanPacPacs";
  } else if (pathname.includes("/advanpac/clientes")) {
    return "AdvanPacClientes";
  } else if (pathname.includes("/nucleares")) {
    return "NUCLEARES";
  } else if (pathname.includes("/financieros")) {
    return "FINANCIAL";
  } else if (pathname.includes("/auxiliares")) {
    return "AUXILIARES";
  } else if (pathname.includes("/tableros/")) {
    // Extract dashboard name from path
    const segments = pathname.split("/");
    const dashboardSegment = segments[segments.length - 1];
    return dashboardSegment.charAt(0).toUpperCase() + dashboardSegment.slice(1);
  } else if (pathname.startsWith("/custom/")) {
    return pathname;
  }

  // Check if pathname matches any custom option URL
  const matchingCustomOption = customOptions.find((option) =>
    pathname.includes(option.url)
  );

  if (matchingCustomOption) {
    return `custom_${matchingCustomOption.id}`;
  }

  return null; // Return null instead of 'Dashboard' for unknown routes
}

// Helper function to format internal URL
function formatInternalUrl(url) {
  if (url.startsWith("/")) return url;
  return `/${url}`;
}

const SidebarItem = ({
  icon: Icon,
  text,
  active = false,
  onClick,
  indent = false,
}) => (
  <button
    onClick={onClick}
    className={clsx(
      "font-[Poppins] w-full py-2 px-5 flex items-center gap-3 text-[12px] rounded-md transition-all duration-150 font-medium",
      active
        ? "bg-[var(--primary-color)] text-white shadow-sm"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
      indent && "pl-8"
    )}
  >
    {typeof Icon === "function" ? (
      <Icon size={16} color={active ? "#FFFFFF" : "#6B7280"} />
    ) : (
      <Icon
        size={16}
        className={active ? "text-white" : "text-gray-500 dark:text-gray-400"}
      />
    )}
    <span className="flex-1 text-left">{text}</span>
  </button>
);

const ExpandableItem = ({
  icon: Icon,
  text,
  children,
  defaultOpen = false,
  isChildActive = false,
  indent = false,
}) => {
  const [open, setOpen] = useState(defaultOpen || isChildActive);

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
            ? "bg-[#F2F6FD] dark:bg-[#31313e]"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#31313e]",
          indent && "pl-8"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon
            size={16}
            className={
              open || isChildActive
                ? "text-[var(--primary-color)]"
                : "text-gray-500 dark:text-gray-400"
            }
          />
          <span
            className={
              open || isChildActive
                ? "text-[var(--primary-color)] dark:text-white"
                : ""
            }
          >
            {text}
          </span>
        </div>
        {open ? (
          <ChevronDown size={16} className="text-[var(--primary-color)]" />
        ) : (
          <ChevronRight
            size={16}
            className="text-gray-500 dark:text-gray-400"
          />
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
      <p className="font-medium text-gray-800 dark:text-gray-200 mt-0.5 text-[11px]">
        {value}
      </p>
    </div>
    <button
      onClick={() => navigator.clipboard.writeText(value)}
      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
    >
      <Copy
        size={14}
        className="text-gray-400 hover:text-gray-600 dark:text-gray-500"
      />
    </button>
  </div>
);

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { selectedCompany } = useCompany();
  const { user, isAdmin, isAdvan } = useAuth();
  const [customParents, setCustomParents] = useState([]);
  const [dashboards, setDashboards] = useState([]);
  const [customOptions, setCustomOptions] = useState([]);
  const [activeItem, setActiveItem] = useState(() =>
    getActiveItemFromPath(pathname, [])
  );
  const [launcherVersion, setLauncherVersion] = useState(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("launcherVersion");
      const cacheTime = localStorage.getItem("launcherVersionTime");

      if (cached && cacheTime) {
        const fiveMinutes = 5 * 60 * 1000;
        const now = Date.now();
        if (now - parseInt(cacheTime) < fiveMinutes) {
          return cached;
        }
      }
    }
    return "---";
  });

  // Ref para controlar las llamadas duplicadas
  const trackingInProgress = useRef(new Set());

  const profileName = Cookies.get("profileName");
  const isUserAdvan = profileName?.includes("USERADVAN");
  const isAdminAdvan = profileName?.includes("ADMINADVAN");

  // Check if user has access to AdvanPAC (ADMINADVAN or USERADVAN)
  const hasAdvanPacAccess = isAdminAdvan || isUserAdvan;

  // Fetch user dashboards
  const fetchUserDashboards = useCallback(async () => {
    const userId = Cookies.get("idUser");

    if (!userId) {
      console.log("Missing userId for dashboard fetch");
      return;
    }

    try {
      const response = await fetch(`/api/dashboards/user/${userId}`);
      const data = await response.json();

      if (data.statusCode === "200") {
        setDashboards(data.data || []);
      } else {
        console.error("Error fetching dashboards:", data.message);
        setDashboards([]);
      }
    } catch (error) {
      console.error("Error fetching user dashboards:", error);
      setDashboards([]);
    }
  }, []);

  // Fetch custom options
  const fetchCustomOptions = useCallback(async () => {
    const userId = Cookies.get("idUser");

    if (!userId) {
      console.log("Missing userId for custom options fetch");
      return;
    }

    try {
      const response = await fetch(`/api/custom-options/user/${userId}`);
      const data = await response.json();

      if (data.statusCode === "200") {
        // Filter only available options
        const availableOptions = (data.data || []).filter(
          (option) => option.available
        );
        setCustomOptions(availableOptions);
      } else {
        console.error("Error fetching custom options:", data.message);
        setCustomOptions([]);
      }
    } catch (error) {
      console.error("Error fetching custom options:", error);
      setCustomOptions([]);
    }
  }, []);

  // Fetch launcher version
  const fetchLauncherVersion = useCallback(async () => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("launcherVersion");
      const cacheTime = localStorage.getItem("launcherVersionTime");

      if (cached && cacheTime) {
        const fiveMinutes = 5 * 60 * 1000;
        const now = Date.now();
        if (now - parseInt(cacheTime) < fiveMinutes) {
          return;
        }
      }
    }

    try {
      const response = await fetch("/api/configurations");
      const data = await response.json();

      if (data.statusCode === "200" && data.data) {
        const versionConfig = data.data.find(
          (config) => config.configName === "VERSION_LAUNCHER"
        );
        if (versionConfig) {
          const version = versionConfig.configValue;
          setLauncherVersion(version);
          localStorage.setItem("launcherVersion", version);
          localStorage.setItem("launcherVersionTime", Date.now().toString());
        } else {
          const noAvailable = "No disponible";
          setLauncherVersion(noAvailable);
          localStorage.setItem("launcherVersion", noAvailable);
          localStorage.setItem("launcherVersionTime", Date.now().toString());
        }
      } else {
        const error = "Error";
        setLauncherVersion(error);
        localStorage.setItem("launcherVersion", error);
        localStorage.setItem("launcherVersionTime", Date.now().toString());
      }
    } catch (error) {
      console.error("Error fetching launcher version:", error);
      const noAvailable = "No disponible";
      setLauncherVersion(noAvailable);
      localStorage.setItem("launcherVersion", noAvailable);
      localStorage.setItem("launcherVersionTime", Date.now().toString());
    }
  }, []);

  // Function to get user's IP address
  const getUserIP = useCallback(async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error getting IP:", error);
      return "unknown";
    }
  }, []);

  // Function to track menu access with duplicate protection
  const trackMenuAccess = useCallback(
    async (customOption) => {
      const userId = Cookies.get("idUser");

      if (!userId) {
        console.log("Missing userId for tracking");
        return;
      }

      // Crear una clave única para este tracking
      const trackingKey = `${userId}-custom-${customOption.id}`;

      // Si ya está en progreso, ignorar
      if (trackingInProgress.current.has(trackingKey)) {
        return;
      }

      // Marcar como en progreso
      trackingInProgress.current.add(trackingKey);

      try {
        const userIP = await getUserIP();

        const trackingData = {
          idUser: parseInt(userId),
          idMenu: 0, // Default value as shown in the example
          idCustomOption: customOption.id,
          ipName: userIP,
        };

        const response = await fetch("/api/menu-tracking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(trackingData),
        });

        if (!response.ok) {
          console.error("Error sending menu tracking:", response.statusText);
        }
        // Silent operation - no success message shown

        // Remover de la lista después de un breve delay
        setTimeout(() => {
          trackingInProgress.current.delete(trackingKey);
        }, 1000); // 1 segundo de cooldown
      } catch (error) {
        console.error("Error tracking menu access:", error);
        // En caso de error, también remover de la lista
        trackingInProgress.current.delete(trackingKey);
      }
    },
    [getUserIP]
  );

  // Load data on component mount
  useEffect(() => {
    fetchLauncherVersion();
    fetchUserDashboards();
    fetchCustomOptions();
  }, [fetchLauncherVersion, fetchUserDashboards, fetchCustomOptions]);

  // Update active item when pathname or customOptions change
  useEffect(() => {
    const newActiveItem = getActiveItemFromPath(pathname, customOptions);
    setActiveItem(newActiveItem);
  }, [pathname, customOptions]);

  // Navigate function
  const navigateTo = useCallback(
    (route, itemName) => {
      if (pathname === route) {
        if (onClose) onClose();
        return;
      }

      setActiveItem(itemName);
      router.push(route);
      if (onClose) onClose();
    },
    [pathname, router, onClose]
  );

  // Handle custom option click with tracking protection
  const handleCustomOptionClick = useCallback(
    (option) => {
      const internalUrl = formatInternalUrl(option.url);

      // SI YA ESTAMOS EN LA RUTA, NO HACER TRACKING NI NAVEGACIÓN
      if (pathname === internalUrl) {
        if (onClose) onClose();
        return;
      }

      // Navigate immediately for instant visual feedback
      navigateTo(internalUrl, `custom_${option.id}`);

      // Track menu access in background (fire and forget) CON PROTECCIÓN
      trackMenuAccess(option);

      if (onClose) onClose();
    },
    [pathname, navigateTo, onClose, trackMenuAccess]
  );

  // Check if dashboard-related items are active
  const isDashboardActive = dashboards.some((dashboard) => {
    const dashboardName = dashboard.boardname;
    return activeItem === dashboardName;
  });

  const isDivisionActive = ["NUCLEARES", "FINANCIAL", "AUXILIARES"].includes(
    activeItem
  );
  const isHelpCenterActive = ["AdminVideos", "AdminDocumentos"].includes(
    activeItem
  );
  const isAdminActive =
    [
      "AdminUsers",
      "conexioneserp",
      "AdminVideos",
      "AdminDocumentos",
      "AdminMenus",
      "AdminNotifications",
      "AdminPromociones",
      "AdminMenuTracking",
    ].includes(activeItem) ||
    (isAdmin && activeItem === "Noticias");
  const isAdvanPacActive = ["AdvanPacPacs", "AdvanPacClientes"].includes(
    activeItem
  );

  // Check if any custom option is active
  const isCustomOptionActive = customOptions.some(
    (option) =>
      activeItem === `custom_${option.id}` ||
      (pathname && pathname.includes(option.url))
  );

  function formatServer(server) {
    if (!server) return "";
    let hostPart = server;
    let portOrInstance = "";
    if (server.includes(":")) {
      [hostPart, portOrInstance] = server.split(":");
      portOrInstance = ":" + portOrInstance;
    } else if (server.includes("\\")) {
      [hostPart, portOrInstance] = server.split("\\");
      portOrInstance = "\\" + portOrInstance;
    }
    const parts = hostPart.split(".");
    const last = parts.pop();
    const maskedParts = parts.map((part) => "*".repeat(part.length));
    return maskedParts.concat(last).join(".") + portOrInstance;
  }

  return (
    <div className="w-60 h-screen flex flex-col bg-white dark:bg-[#1c1c24] fixed top-0 left-0 z-10 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="h-24 flex items-center justify-center border-b border-gray-100 dark:border-gray-700">
        <Link href="/" onClick={() => setActiveItem("Dashboard")}>
          <Image
            src="/logoAdvan.svg"
            alt="Logo"
            width={200}
            height={70}
            priority
          />
        </Link>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar">
        <p className="text-[12px] text-gray-400 dark:text-gray-500">Menú</p>

        <SidebarItem
          icon={LayoutGrid}
          text="Dashboard"
          active={activeItem === "Dashboard"}
          onClick={() => navigateTo("/", "Dashboard")}
        />

        {!isUserAdvan && (
          <ExpandableItem
            icon={IconModulos}
            text="Divisiones"
            defaultOpen={true}
            isChildActive={isDivisionActive}
          >
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
              onClick={() => navigateTo("/divisiones/nucleares", "NUCLEARES")}
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
              onClick={() => navigateTo("/divisiones/financieros", "FINANCIAL")}
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
              onClick={() => navigateTo("/divisiones/auxiliares", "AUXILIARES")}
            />
          </ExpandableItem>
        )}

        {/* Show Noticias for regular users */}
        {!isAdmin && !isAdvan && (
          <SidebarItem
            icon={Newspaper}
            text="Noticias"
            active={activeItem === "Noticias"}
            onClick={() => navigateTo("/news", "Noticias")}
          />
        )}

        {/* Admin dropdown section */}
        {(isAdmin || isAdvan) && (
          <ExpandableItem
            icon={Settings}
            text="Administración"
            defaultOpen={false}
            isChildActive={isAdminActive}
          >
            {isAdvan && (
              <>
                <SidebarItem
                  icon={Newspaper}
                  text="Noticias"
                  indent
                  active={activeItem === "Noticias"}
                  onClick={() => navigateTo("/admin/news", "Noticias")}
                />
              </>
            )}

            <SidebarItem
              icon={Users}
              text="Usuarios"
              indent
              active={activeItem === "AdminUsers"}
              onClick={() => navigateTo("/admin/users", "AdminUsers")}
            />
            {isAdminAdvan && (
              <>
                <SidebarItem
                  icon={Building2}
                  text="Crear Empresa"
                  indent
                  active={activeItem === "AdminCreateCompany"}
                  onClick={() =>
                    navigateTo("/admin/create-company", "AdminCreateCompany")
                  }
                />
                <SidebarItem
                  icon={Network}
                  text="Conexiones ERP"
                  indent
                  active={activeItem === "conexioneserp"}
                  onClick={() =>
                    navigateTo("/admin/conexioneserp", "conexioneserp")
                  }
                />
              </>
            )}

            {/* Centro de Ayuda sub-dropdown */}
            {isAdvan && (
              <ExpandableItem
                icon={HelpCircle}
                text="Centro Ayuda"
                indent={true}
                defaultOpen={false}
                isChildActive={isHelpCenterActive}
              >
                <SidebarItem
                  icon={Video}
                  text="Videos"
                  indent
                  active={activeItem === "AdminVideos"}
                  onClick={() => navigateTo("/admin/videos", "AdminVideos")}
                />
                <SidebarItem
                  icon={DocumentIcon}
                  text="Documentos"
                  indent
                  active={activeItem === "AdminDocumentos"}
                  onClick={() =>
                    navigateTo("/admin/documents", "AdminDocumentos")
                  }
                />
              </ExpandableItem>
            )}

            {/* Menu Tracking - Solo para ADMINADVAN y USERADVAN */}
            {(isAdminAdvan || isUserAdvan) && (
              <SidebarItem
                icon={Activity}
                text="Menu Tracking"
                indent
                active={activeItem === "AdminMenuTracking"}
                onClick={() =>
                  navigateTo("/admin/menu-tracking", "AdminMenuTracking")
                }
              />
            )}

            {isAdvan && (
              <SidebarItem
                icon={Bell}
                text="Notificaciones"
                indent
                active={activeItem === "AdminNotifications"}
                onClick={() =>
                  navigateTo("/admin/notifications", "AdminNotifications")
                }
              />
            )}
            {isAdvan && (
              <SidebarItem
                icon={Gift}
                text="Promociones"
                indent
                active={activeItem === "AdminPromociones"}
                onClick={() =>
                  navigateTo("/admin/promociones", "AdminPromociones")
                }
              />
            )}
          </ExpandableItem>
        )}

        {/* AdvanPAC Section - Only for ADMINADVAN and USERADVAN */}
        {hasAdvanPacAccess && (
          <ExpandableItem
            icon={Shield}
            text="AdvanPAC"
            defaultOpen={false}
            isChildActive={isAdvanPacActive}
          >
            <SidebarItem
              icon={Building2}
              text="PAC's"
              indent
              active={activeItem === "AdvanPacPacs"}
              onClick={() => navigateTo("/advanpac/pacs", "AdvanPacPacs")}
            />
            <SidebarItem
              icon={UserCheck}
              text="Clientes"
              indent
              active={activeItem === "AdvanPacClientes"}
              onClick={() =>
                navigateTo("/advanpac/clientes", "AdvanPacClientes")
              }
            />
          </ExpandableItem>
        )}

        {/* Dynamic Dashboards Section */}
        {dashboards.length > 0 && (
          <ExpandableItem
            icon={BarChart3}
            text="Tableros Gerenc."
            defaultOpen={false}
            isChildActive={isDashboardActive}
          >
            {dashboards.map((dashboard) => (
              <SidebarItem
                key={dashboard.idManagementDashboard}
                icon={Truck}
                text={dashboard.boardname}
                indent
                active={activeItem === dashboard.boardname}
                onClick={() =>
                  navigateTo(`/${dashboard.url}`, dashboard.boardname)
                }
              />
            ))}
          </ExpandableItem>
        )}

        {/* Custom Options Section */}
        {customOptions.length > 0 && (
          <ExpandableItem
            icon={Settings}
            text="Opciones"
            defaultOpen={false}
            isChildActive={isCustomOptionActive}
          >
            {customOptions.map((option) => (
              <SidebarItem
                key={option.id}
                icon={DefaultIcon}
                text={option.text}
                indent
                active={activeItem === `custom_${option.id}`}
                onClick={() => handleCustomOptionClick(option)}
              />
            ))}
          </ExpandableItem>
        )}

        {/* CUSTOM PARENTS at the end */}
        {customParents.map((p) => (
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
          <InfoItem label="Versión Launcher" value={launcherVersion} />
          <InfoItem
            label="IP"
            value={formatServer(selectedCompany?.serverErpDb) || "Desconocido"}
          />
          {user && user.profileName && (
            <InfoItem label="Perfil" value={user.profileName} />
          )}
        </div>
        <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex items-center justify-between text-[11px] font-medium text-gray-600 dark:text-gray-300">
          <button
            onClick={() => setTheme("light")}
            className={clsx(
              "w-1/2 py-1.5 text-center rounded-full transition-all",
              theme === "light" && "bg-white text-gray-800 shadow"
            )}
          >
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={clsx(
              "w-1/2 py-1.5 text-center rounded-full transition-all",
              theme === "dark" && "bg-white text-gray-800 shadow"
            )}
          >
            Dark
          </button>
        </div>
      </div>
    </div>
  );
}
