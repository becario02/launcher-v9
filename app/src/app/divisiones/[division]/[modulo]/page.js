"use client";

import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Notification from "@/components/Notification";
import SubMenu from "@/components/SubMenu";
import InstanceModal from "@/components/InstanceModal";
import { useEffect, useCallback, useRef } from "react";
import { Flag, Search, Eye, X, Plus, Award, Layers } from "lucide-react";
import { useModulePage } from "@/hooks/useModulePage";
import { useCompany } from "@/context/CompanyContext";
import Cookies from "js-cookie";

export default function ModulePage() {
  const { selectedCompany } = useCompany();

  const {
    division,
    moduleParam,
    primaryColor,
    acronym,
    sidebarOpen,
    setSidebarOpen,
    menuData,
    selectedMenuItem,
    setSelectedMenuItem,
    expandedItems,
    setExpandedItems,
    instances,
    activeInstance,
    setActiveInstance,
    showInstancesModal,
    setShowInstancesModal,
    searchTerm,
    setSearchTerm,
    isLoading,
    subMenuItems,
    menuOrdenado,
    notification,
    closeNotification,
    isItemInShortcuts,
    handleAddShortcut,
    addNewInstance,
    removeInstance,
    getGlobalInstances,
    getIconForMenu,
    showNotification,
    // Nuevas props para privilegios
    hasPrivilege,
    setHasPrivilege,
    hasMenuPermission,
    hasAnyChildPermission,
    getCurrentSession,
    selectedShortcut,
    matchingInstances,
    setSelectedShortcut,
    setMatchingInstances,
    shortcuts,
  } = useModulePage();

  const formatModuleName = (moduleName) => {
    if (!moduleName) return "";
    try {
      return decodeURIComponent(moduleName).replace(/-/g, " ");
    } catch (e) {
      return moduleName.replace(/-/g, " ");
    }
  };

  const breadcrumbItems = [
    { name: division, path: `/divisiones/${division}` },
    {
      name: formatModuleName(moduleParam),
      path: `/divisiones/${division}/${moduleParam}`,
    },
  ];

  const handleCopyToClipboard = ({ success, message, text }) => {
    if (success) {
      showNotification("success", message, "toast", 5000);
    } else {
      const notificationType =
        message.includes("privilegios") || message.includes("permisos")
          ? "warning"
          : "error";
      showNotification(notificationType, message, "toast", 5000);
    }
  };

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

  const trackingInProgress = useRef(new Set());

  const sendMenuTracking = useCallback(
    async (idMenu) => {
      try {
        const userId = Cookies.get("idUser");

        if (!userId) {
          console.error("User ID not found in cookies");
          return;
        }

        const trackingKey = `${userId}-${idMenu}`;

        if (trackingInProgress.current.has(trackingKey)) {
          return;
        }

        trackingInProgress.current.add(trackingKey);

        const userIP = await getUserIP();

        const response = await fetch("/api/menu-tracking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idUser: parseInt(userId),
            idMenu: idMenu,
            idCustomOption: 0,
            ipName: userIP,
          }),
        });

        if (!response.ok) {
          console.error("Error sending menu tracking:", response.statusText);
        }

        setTimeout(() => {
          trackingInProgress.current.delete(trackingKey);
        }, 1000);
      } catch (error) {
        const userId = Cookies.get("idUser");
        const trackingKey = `${userId}-${idMenu}`;
        trackingInProgress.current.delete(trackingKey);
      }
    },
    [getUserIP]
  );

  const handleItemClick = useCallback(
    (item) => {
      sendMenuTracking(item.idMenu);
    },
    [sendMenuTracking]
  );

  const handleShortcutIntent = async () => {
    const intentRaw = localStorage.getItem("shortcutIntent");
    if (!intentRaw) return;

    const parsedIntent = JSON.parse(intentRaw);
    localStorage.removeItem("shortcutIntent");

    const waitForModuleLoad = () => {
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          const data = localStorage.getItem("currentModuleData");
          if (data) {
            clearInterval(interval);
            resolve(JSON.parse(data));
          }
        }, 100);

        setTimeout(() => {
          clearInterval(interval);
          reject(new Error("Timeout al esperar currentModuleData"));
        }, 3000);
      });
    };

    let parsed;
    try {
      parsed = await waitForModuleLoad();
    } catch (e) {
      return;
    }

    const idCompanyModule = parsed.idCompanyModule;
    const exeName = parsed.exeName;

    const normalizeExe = (exe) => exe?.replace(/\.exe$/i, "").toLowerCase();
    const globalInstances = getGlobalInstances();
    const matching = globalInstances.filter(
      (inst) =>
        inst.idCompanyModule === idCompanyModule &&
        normalizeExe(inst.exeName) === normalizeExe(exeName) &&
        inst.idUserCompanyConnection === selectedCompany.idUserCompanyConnection
    );

    if (matching.length === 0) {
      showNotification(
        "info",
        "No hay instancias abiertas, creando una nueva...",
        "toast"
      );

      const newInst = await addNewInstance();

      if (newInst && newInst.session) {
        const padded = newInst.idSession.toString().padStart(10, "0");
        const combined = padded + parsedIntent.acronym + parsedIntent.idName;
        const encoded = btoa(combined);
        await navigator.clipboard.writeText(encoded);
        showNotification(
          "success",
          `"${parsedIntent.textOption}" copiado correctamente`,
          "toast"
        );
      }

      return;
    }

    if (matching.length === 1) {
      const inst = matching[0];
      const padded = inst.idSession.toString().padStart(10, "0");
      const combined = padded + parsedIntent.acronym + parsedIntent.idName;
      const encoded = btoa(combined);
      navigator.clipboard.writeText(encoded);
      showNotification(
        "success",
        `"${parsedIntent.textOption}" copiado en instancia`,
        "toast"
      );
      return;
    }

    setSelectedShortcut(parsedIntent);
    setMatchingInstances(matching);
    setShowInstancesModal(true);
  };

  useEffect(() => {
    handleShortcutIntent();
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar fijo md+ */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Sidebar slide-over en móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="relative z-50 w-60 h-full bg-white dark:bg-[#1C1C24] shadow-lg">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 md:ml-60 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="bg-[#F2F6FD] dark:bg-[#13131a] flex-1 pt-2">
          {notification.visible && notification.style === "toast" && (
            <div className="fixed top-4 right-4 z-[9999]">
              <Notification
                visible
                type={notification.type}
                message={notification.message}
                style="toast"
                onClose={closeNotification}
              />
            </div>
          )}

          <div className="px-4 sm:px-6 lg:px-16 xl:px-20">
            {/* Breadcrumb + contador de instancias */}
            <div className="flex justify-between items-center py-3 mb-[8px]">
              {/* Breadcrumb */}
              <div className="flex items-center text-p text-gray-400 dark:text-gray-500">
                {breadcrumbItems.map((item, idx) => (
                  <div key={idx} className="flex items-center">
                    <Link
                      href={item.path}
                      className={` hover:text-gray-500 dark:hover:text-gray-400 ${
                        idx === breadcrumbItems.length - 1
                          ? "text-gray-8 dark:text-gray-300 font-medium"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                    </Link>
                    {idx < breadcrumbItems.length - 1 && (
                      <span className="mx-2 text-gray-500 dark:text-gray-600">
                        ›
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Botón de instancias abiertas */}
              <button
                onClick={() => setShowInstancesModal(true)}
                className="
                  flex items-center gap-2
                  w-[289px] h-[60px] bg-white
                  dark:bg-[#1c1c24] border border-gray-300 dark:border-[#31313e] rounded-[10px]
                  shadow-[0_25px_50px_0_rgba(169,169,169,0.17)]
                  px-[10px] pr-[20px]
                "
              >
                <div
                  className="
                    flex items-center justify-center
                    w-[44px] h-[40px]
                    bg-primary text-white text-[14px] font-bold
                    rounded-[5px]
                  "
                >
                  {getGlobalInstances().length}
                </div>

                <p
                  className=" text-gray-8
                    dark:text-[#f5f7fa]
                    font-poppins text-[14px] font-medium leading-[1.5]
                  "
                >
                  Instancias abiertas
                </p>

                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-auto"
                >
                  <path
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                    stroke="#92929d"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12c1.6-4.097 5.336-7 10-7s8.4 2.903 10 7c-1.6 4.097-5.336 7-10 7s-8.4-2.903-10-7z"
                    stroke="#92929d"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="w-full bg-white dark:bg-[#1c1c24] border border-gray-300 dark:border-gray-700 rounded-t-[20px] shadow-sm">
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center">
                  <Flag
                    className="w-5 h-5 mr-2"
                    style={{ color: primaryColor || "#FF4081" }}
                  />
                  <h1 className="text-xl font-semibold text-gray-300 dark:text-white">
                    {formatModuleName(moduleParam).charAt(0).toUpperCase() +
                      formatModuleName(moduleParam).slice(1)}
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  {/* Selector de privilegio */}
                  <div className="relative flex items-center w-[300px] h-[44px] bg-[#F2F6FD] dark:bg-[#13131a] rounded-lg p-1 shadow-inner">
                    {/* Fondo deslizable */}
                    <div
                      className={`
                                  absolute top-1 bottom-1
                                  w-[calc(50%-8px)]
                                  transition-all duration-300 rounded-md
                                  bg-white dark:bg-[#1c1c24] shadow-md
                                `}
                      style={{
                        left: hasPrivilege ? "4px" : "calc(50% + 4px)",
                        transform: hasPrivilege
                          ? "translateX(0)"
                          : "translateX(0)",
                        transition: "all 0.3s",
                      }}
                    />

                    <button
                      onClick={() => setHasPrivilege(true)}
                      className="relative z-10 flex items-center justify-center gap-2 w-1/2 h-full rounded-md transition-colors"
                      tabIndex={0}
                    >
                      <Award
                        className={`w-5 h-5 transition-colors
                                    ${
                                      hasPrivilege
                                        ? "text-primary"
                                        : "text-gray-400 dark:text-gray-500"
                                    }
                                  `}
                      />
                      <span
                        className={`text-p font-medium transition-colors
                                    ${
                                      hasPrivilege
                                        ? "text-gray-700 dark:text-white"
                                        : "text-gray-400 dark:text-gray-500"
                                    }
                                  `}
                      >
                        Con privilegio
                      </span>
                    </button>

                    <button
                      onClick={() => setHasPrivilege(false)}
                      className="relative z-10 flex items-center justify-center gap-2 w-1/2 h-full rounded-md transition-colors"
                      tabIndex={0}
                    >
                      <Award
                        className={`w-5 h-5 transition-colors
                                    ${
                                      !hasPrivilege
                                        ? "text-primary"
                                        : "text-gray-400 dark:text-gray-500"
                                    }
                                  `}
                      />
                      <span
                        className={`text-p font-medium transition-colors
                                    ${
                                      !hasPrivilege
                                        ? "text-gray-700 dark:text-white"
                                        : "text-gray-400 dark:text-gray-500"
                                    }
                                  `}
                      >
                        Sin privilegio
                      </span>
                    </button>
                  </div>

                  {/* Búsqueda */}
                  <div className="relative w-[360px] dark:bg-[#13131a] rounded-md">
                    <input
                      type="text"
                      placeholder="Buscar"
                      className="
                        w-full h-[40px]
                        pl-4 pr-9 bg-[#F2F6FD] border-gray-300
                        dark:bg-[#13131a] border dark:border-[#31313e]
                        rounded-md text-p
                        text-gray-800 dark:text-white
                        placeholder:text-gray-400
                        font-medium
                        focus:outline-none
                      "
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="flex border-t border-gray-200 dark:border-gray-700 overflow-x-auto">
                {instances.map((inst, index) => (
                  <div
                    key={inst.id}
                    onClick={() => {
                      setActiveInstance(inst.id);
                      localStorage.setItem(
                        `activeInstance-${division}-${moduleParam}`,
                        inst.id.toString()
                      );
                    }}
                    className={`
                      flex items-center px-4 py-2.5 text-p cursor-pointer border-r border-gray-300 dark:border-gray-700
                      ${
                        activeInstance === inst.id
                          ? "font-medium bg-[#F2F6FD]  dark:bg-[#13131a]"
                          : "text-gray-400 dark:text-gray-400"
                      }
                    `}
                    style={
                      activeInstance === inst.id
                        ? { color: primaryColor || "#FF4081" }
                        : {}
                    }
                  >
                    {/* Icono de Instancia */}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2"
                    >
                      <path
                        d="M3 9h18M3 5h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z"
                        stroke={
                          activeInstance === inst.id
                            ? primaryColor || "#FF4081"
                            : "#92929d"
                        }
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{inst.name}</span>
                    <button
                      onClick={(e) => removeInstance(inst.id, e)}
                      className="ml-2 hover:bg-gray-700/20 dark:hover:bg-gray-700/40 rounded-full p-0.5"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17 7 7 17M7 7l10 10"
                          stroke={
                            activeInstance === inst.id
                              ? primaryColor || "#FF4081"
                              : "#92929d"
                          }
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={addNewInstance}
                  className="flex items-center justify-center w-12 py-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-300 dark:hover:text-gray-400 border-r border-gray-300 dark:border-gray-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contenedor principal */}
            <div className="flex min-h-[50vh] overflow-auto bg-white dark:bg-[#1c1c24] rounded-b-[20px] border-r border-l border-b border-gray-300 dark:border-gray-700 mb-8">
              {/* Menú lateral */}
              <div className="min-w-56 border-r border-gray-300 dark:border-gray-700 border-t-0 overflow-y-auto py-4 overflow-x-hidden">
                {menuOrdenado.map((menuName) => {
                  const norm = (s) =>
                    (s || "")
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "");

                  const singular = (s) => s.replace(/(es|s)$/i, "");

                  const existingItem = menuData.find((item) => {
                    const a = singular(norm(item.name));
                    const b = singular(norm(menuName));
                    return a === b || a.includes(b) || b.includes(a);
                  });

                  const iconComponent =
                    existingItem?.icon || getIconForMenu(menuName);

                  const item = existingItem || {
                    id: `default-${menuName}`,
                    name: menuName,
                    icon: iconComponent,
                  };

                  const isCustomIcon = typeof item.icon === "function";
                  const IconComponent = isCustomIcon
                    ? item.icon
                    : require("lucide-react")[item.icon];

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedMenuItem(item.id)}
                      className={`flex w-56 items-center px-4 py-3 text-p cursor-pointer rounded-[10px] mx-3 transition-colors ${
                        selectedMenuItem === item.id
                          ? "font-medium bg-primary text-white"
                          : "hover:bg-gray-700/20 text-gray-400"
                      }`}
                      style={
                        selectedMenuItem === item.id
                          ? {
                              borderColor: primaryColor || "#FF4081",
                            }
                          : {}
                      }
                    >
                      <IconComponent
                        className={`w-5 h-5 mr-3 ${
                          selectedMenuItem === item.id
                            ? "text-white"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                        {...(isCustomIcon && {
                          color:
                            selectedMenuItem === item.id
                              ? "white"
                              : "currentColor",
                        })}
                      />
                      {item.name}
                    </div>
                  );
                })}
              </div>

              {/* Panel principal */}
              <div className="flex-1 border-t-0 overflow-y-auto">
                <div className="p-3">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-20">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#FF4081]"></div>
                    </div>
                  ) : (
                    selectedMenuItem && (
                      <SubMenu
                        items={subMenuItems[selectedMenuItem] || []}
                        expandedItems={expandedItems}
                        toggleItemExpansion={(id) =>
                          setExpandedItems((prev) => ({
                            ...prev,
                            [id]: !prev[id],
                          }))
                        }
                        handleAddShortcut={handleAddShortcut}
                        isItemInShortcuts={isItemInShortcuts}
                        primaryColor={primaryColor || "#FF4081"}
                        onCopyToClipboard={handleCopyToClipboard}
                        hasPrivilege={hasPrivilege}
                        hasMenuPermission={hasMenuPermission}
                        hasAnyChildPermission={hasAnyChildPermission}
                        searchTerm={searchTerm}
                        acronym={acronym}
                        currentSession={getCurrentSession()}
                        shortcuts={shortcuts}
                        onItemClick={handleItemClick}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!selectedShortcut && (
        <InstanceModal
          isOpen={showInstancesModal}
          onClose={() => setShowInstancesModal(false)}
          instances={getGlobalInstances()}
          division={division}
          moduleParam={moduleParam}
          primaryColor={primaryColor}
        />
      )}

      {showInstancesModal && selectedShortcut && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#1C1C24] rounded-lg w-full max-w-lg mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <Layers className="w-5 h-5 mr-2 text-primary" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  ¿En qué instancia deseas abrir{" "}
                  <span className="font-bold text-primary">
                    {selectedShortcut.textOption}
                  </span>
                  ?
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowInstancesModal(false);
                  setSelectedShortcut(null);
                  setMatchingInstances([]);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de opciones */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {matchingInstances.map((inst) => {
                const padded = inst.idSession.toString().padStart(10, "0");
                const combined =
                  padded + selectedShortcut.acronym + selectedShortcut.idName;
                const encoded = btoa(combined);

                return (
                  <button
                    key={`${inst.session}-${inst.name || "no-name"}-${
                      inst.exeName || "exe"
                    }`}
                    onClick={async () => {
                      await navigator.clipboard.writeText(encoded);
                      showNotification(
                        "success",
                        `"${selectedShortcut.textOption}" copiado`,
                        "toast"
                      );
                      setActiveInstance(inst.id);
                      localStorage.setItem(
                        `activeInstance-${division}-${moduleParam}`,
                        inst.id.toString()
                      );
                      setShowInstancesModal(false);
                      setSelectedShortcut(null);
                      setMatchingInstances([]);
                    }}
                    className={`
                      group w-full px-4 py-3 rounded-lg border transition flex justify-between items-center
                      bg-gray-50 dark:bg-[#252530] border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white
                      hover:bg-primary dark:hover:bg-primary dark:hover:text-white hover:text-white hover:border-transparent
                    `}
                  >
                    <span>
                      Instancia {inst.id} - {inst.name || "sin nombre"}
                    </span>
                    <svg
                      className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>

            {/* Botón Cancelar */}
            <div className="p-4 pt-0">
              <button
                onClick={() => {
                  setShowInstancesModal(false);
                  setSelectedShortcut(null);
                  setMatchingInstances([]);
                }}
                className="w-full mt-3 py-2 border border-primary dark:border-primary dark:hover:border-primary rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 hover:border-primary dark:hover:bg-[#2a2a3b] transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
