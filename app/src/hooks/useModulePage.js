"use client";

import { useMemo } from "react";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { usePrimaryColor } from "@/context/primaryColor";
import { useCompany } from "@/context/CompanyContext";
import { useAuth } from "@/context/auth";
import { TransaccionesIcon } from "@/components/icons/TransaccionesIcon";
import { ConsultasIcon } from "@/components/icons/ConsultasIcon";
import { ReportesIcon } from "@/components/icons/ReportesIcon";
import { CatalogoIcon } from "@/components/icons/CatalogoIcon";
import { AdministracionIcon } from "@/components/icons/AdministracionIcon";
import { DashboardIcon } from "@/components/icons/DashboardIcon";
import { useModule } from "@/context/ModuleContext";
import { decryptAES } from "@/utils/aesDecrypt";
import { usePathname } from "next/navigation";

export function useModulePage() {
  const { division, modulo: moduleParam } = useParams();
  const { primaryColor } = usePrimaryColor();
  const { selectedCompany } = useCompany();
  const { currentModule } = useModule();
  const { user } = useAuth();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuData, setMenuData] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState("");
  const [expandedItems, setExpandedItems] = useState({});
  const [instances, setInstances] = useState([]);
  const [activeInstance, setActiveInstance] = useState(null);
  const [showInstancesModal, setShowInstancesModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subMenuItems, setSubMenuItems] = useState({});
  const [shortcuts, setShortcuts] = useState([]);
  const [notification, setNotification] = useState({
    visible: false,
    type: "info",
    message: "",
    style: "toast",
  });

  // Nuevos estados para privilegios
  const [hasPrivilege, setHasPrivilege] = useState(true);
  const [menuPermissions, setMenuPermissions] = useState([]);
  const [idCompanyModule, setIdCompanyModule] = useState(null);
  const [selectedShortcut, setSelectedShortcut] = useState(null);
  const [matchingInstances, setMatchingInstances] = useState([]);

  const getModuleId = useCallback(() => {
    if (currentModule?.idModule) {
      return currentModule.idModule;
    }

    try {
      const storedModuleData = localStorage.getItem("currentModuleData");
      if (storedModuleData) {
        const moduleData = JSON.parse(storedModuleData);
        return moduleData.idModule;
      }
    } catch (error) {
    }

    return null;
  }, [currentModule]);

  const getAcronym = useCallback(() => {
    if (currentModule?.acronym) {
      return currentModule.acronym;
    }

    try {
      const storedModuleData = localStorage.getItem("currentModuleData");
      if (storedModuleData) {
        const moduleData = JSON.parse(storedModuleData);
        return moduleData.acronym;
      }
    } catch (error) {
    }

    return null;
  }, [currentModule]);

  const getExeName = useCallback(() => {
    let exeName = null;

    if (currentModule?.exeName) {
      exeName = currentModule.exeName;
    } else {
      try {
        const storedModuleData = localStorage.getItem("currentModuleData");
        if (storedModuleData) {
          const moduleData = JSON.parse(storedModuleData);
          exeName = moduleData.exeName;
        }
      } catch (error) {
      }
    }

    // Quitar la extensión .exe si existe
    return exeName ? exeName.replace(/\.exe$/i, "") : null;
  }, [currentModule]);

  const getIdCompanyModule = useCallback(() => {
    if (currentModule?.idCompanyModule) {
      return currentModule.idCompanyModule;
    }

    try {
      const storedModuleData = localStorage.getItem("currentModuleData");
      if (storedModuleData) {
        const moduleData = JSON.parse(storedModuleData);
        return moduleData.idCompanyModule;
      }
    } catch (error) {
    }

    return null;
  }, [currentModule]);

  const moduleId = getModuleId();
  const acronym = getAcronym();
  const exeName = getExeName();

  useEffect(() => {
    const companyModuleId = getIdCompanyModule();
    setIdCompanyModule(companyModuleId);
  }, [getIdCompanyModule]);

  const menuOrdenado = useMemo(
    () => [
      "Transacciones",
      "Consultas",
      "Reportes",
      "Catálogo",
      "Administración",
    ],
    []
  );

  const showNotification = useCallback(
    (type, message, style = "toast", duration = 4000) => {
      setNotification({
        visible: false,
        type: "info",
        message: "",
        style: "toast",
      });

      setTimeout(() => {
        setNotification({
          visible: true,
          type,
          message,
          style,
        });
      }, 50);

      setTimeout(() => {
        closeNotification();
      }, duration + 50);
    },
    []
  );

  const closeNotification = () =>
    setNotification((n) => ({ ...n, visible: false }));

  // Función para obtener permisos de menú
  const fetchMenuPermissions = useCallback(async () => {
    if (!idCompanyModule) return;

    try {
      const response = await fetch("/api/menu-permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idCompanyModule }),
      });

      if (!response.ok) {
        setMenuPermissions([]);
        return;
      }

      const data = await response.json();
      setMenuPermissions(data.data || []);
    } catch (error) {
      setMenuPermissions([]);
    }
  }, [idCompanyModule]);

  // Función para verificar si un menú tiene permisos
  const hasMenuPermission = useCallback(
    (idMenu) => {
      // Esta función siempre verifica si el menú tiene permisos, independientemente del estado hasPrivilege
      return menuPermissions.some((permission) => permission.idMenu === idMenu);
    },
    [menuPermissions]
  );

  // Función recursiva para verificar permisos en jerarquía de menús
  const hasAnyChildPermission = useCallback(
    (item) => {
      // Esta función siempre verifica permisos, independientemente del estado hasPrivilege

      // Si el item actual tiene permiso, retorna true
      if (hasMenuPermission(item.idMenu)) {
        return true;
      }

      // Si tiene hijos, verifica recursivamente
      if (item.children && item.children.length > 0) {
        return item.children.some((child) => hasAnyChildPermission(child));
      }

      return false;
    },
    [hasMenuPermission]
  );

  useEffect(() => {
    try {
      const storedModuleData = localStorage.getItem("currentModuleData");
    } catch (error) {}
  }, [currentModule, selectedCompany, moduleId, acronym, exeName]);

  // Cargar permisos cuando cambie idCompanyModule
  useEffect(() => {
    if (idCompanyModule) {
      fetchMenuPermissions();
    }
  }, [idCompanyModule, fetchMenuPermissions]);

  // Efecto para expandir automáticamente items que coinciden con la búsqueda
  useEffect(() => {
    if (searchTerm && searchTerm.trim() !== "") {
      const expandMatchingItems = (items) => {
        const newExpanded = {};

        const searchInItems = (itemList, parentKey = null) => {
          itemList.forEach((item) => {
            const itemText = (
              item.textOption ||
              item.idName ||
              ""
            ).toLowerCase();
            const searchLower = searchTerm.toLowerCase().trim();

            // Si el item coincide con la búsqueda, expandir su padre
            if (itemText.includes(searchLower) && parentKey) {
              newExpanded[parentKey] = true;
            }

            // Si tiene hijos, buscar recursivamente
            if (item.children && item.children.length > 0) {
              searchInItems(item.children, item.keyValue);

              // Si algún hijo coincide, expandir este item también
              const hasMatchingChild = item.children.some((child) => {
                const childText = (
                  child.textOption ||
                  child.idName ||
                  ""
                ).toLowerCase();
                return childText.includes(searchLower);
              });

              if (hasMatchingChild) {
                newExpanded[item.keyValue] = true;
              }
            }
          });
        };

        // Buscar en todos los submenus
        Object.values(subMenuItems).forEach((items) => {
          searchInItems(items);
        });

        return newExpanded;
      };

      const matchingExpanded = expandMatchingItems();
      setExpandedItems((prev) => ({ ...prev, ...matchingExpanded }));
    }
  }, [searchTerm, subMenuItems]);

  const getStorageKey = useCallback(() => {
    const company = selectedCompany?.name || "default";
    const user = selectedCompany?.fullname || "default";
    return `${company}-${user}-${moduleParam}-instances`;
  }, [selectedCompany, moduleParam]);

  const getGlobalInstances = useCallback(() => {
    try {
      const company = selectedCompany?.name || "default";
      const user = selectedCompany?.fullname || "default";
      const globalKey = `${company}-${user}-global-instances`;

      const storedData = localStorage.getItem(globalKey);
      if (storedData) {
        return JSON.parse(storedData);
      }
      return [];
    } catch (error) {
      return [];
    }
  }, [selectedCompany]);

  const saveGlobalInstance = useCallback(
    (division, module, instanceData) => {
      try {
        const company = selectedCompany?.name || "default";
        const user = selectedCompany?.fullname || "default";
        const globalKey = `${company}-${user}-global-instances`;

        const globalInstances = getGlobalInstances();
        const newInstance = {
          ...instanceData,
          division,
          module,
          timestamp: Date.now(),
        };

        const updatedInstances = [...globalInstances, newInstance];
        localStorage.setItem(globalKey, JSON.stringify(updatedInstances));

        return updatedInstances;
      } catch (error) {
        return [];
      }
    },
    [selectedCompany, getGlobalInstances]
  );

  const removeGlobalInstance = useCallback(
    (division, module, instanceId) => {
      try {
        const company = selectedCompany?.name || "default";
        const user = selectedCompany?.fullname || "default";
        const globalKey = `${company}-${user}-global-instances`;

        const globalInstances = getGlobalInstances();
        const updatedInstances = globalInstances.filter(
          (inst) =>
            !(
              inst.division === division &&
              inst.module === module &&
              inst.id === instanceId
            )
        );

        localStorage.setItem(globalKey, JSON.stringify(updatedInstances));
        return updatedInstances;
      } catch (error) {
        return [];
      }
    },
    [selectedCompany, getGlobalInstances]
  );

  const saveInstancesToStorage = useCallback(
    (instancesData, activeInstanceId) => {
      try {
        localStorage.setItem(
          getStorageKey(),
          JSON.stringify({
            instances: instancesData,
            activeInstance: activeInstanceId,
          })
        );
      } catch (error) {}
    },
    [getStorageKey]
  );

  const saveInstanceWithSession = useCallback(
    (instanceId, sessionData, isActive = false) => {
      try {
        const storageKey = getStorageKey();
        const storedData = localStorage.getItem(storageKey);
        let instancesData = { instances: [], activeInstance: null };

        if (storedData) {
          instancesData = JSON.parse(storedData);
        }

        const { idUser, session } = sessionData.data || sessionData;

        const updatedInstances = instancesData.instances.map((inst) => {
          if (inst.id === instanceId) {
            return {
              ...inst,
              idUser,
              session,
              active: isActive,
            };
          }
          return inst;
        });

        localStorage.setItem(
          storageKey,
          JSON.stringify({
            instances: updatedInstances,
            activeInstance: isActive
              ? instanceId
              : instancesData.activeInstance,
          })
        );
      } catch (error) {
      }
    },
    [getStorageKey]
  );

  const reloadInstances = () => {
    try {
      const storageKey = getStorageKey();
      const storedData = localStorage.getItem(storageKey);

      if (storedData) {
        const parsed = JSON.parse(storedData);
        setInstances(parsed.instances || []);
        setActiveInstance(parsed.activeInstance || null);
      } else {
        setInstances([]);
        setActiveInstance(null);
      }
    } catch (error) {
      showNotification("error", "Error al recargar instancias", "toast");
    }
  };

  useEffect(() => {
    const tryReload = () => {
      const key = getStorageKey();

      if (
        !key ||
        !selectedCompany?.name ||
        !selectedCompany?.fullname ||
        !moduleParam
      ) {
        return;
      }


      try {
        const storedData = localStorage.getItem(key);
        let parsed;

        if (storedData) {
          parsed = JSON.parse(storedData);
        }

        const isEmpty =
          !parsed ||
          !Array.isArray(parsed.instances) ||
          parsed.instances.length === 0;

        if (isEmpty) {

          const global = getGlobalInstances();
          const filtered = global.filter(
            (inst) =>
              inst.division === division &&
              inst.module === moduleParam &&
              inst.idUserCompanyConnection ===
                selectedCompany.idUserCompanyConnection
          );

          if (filtered.length > 0) {
            setInstances(filtered);
            setActiveInstance(filtered[0].id);
          } else {
            setInstances([]);
            setActiveInstance(null);
          }
        } else {
          setInstances(parsed.instances || []);
          setActiveInstance(parsed.activeInstance || null);
        }
      } catch (err) {
        showNotification("error", "Error al recargar instancias", "toast");
      }
    };

    /*console.log("📍 useEffect ejecutado con:", {
      name: selectedCompany?.name,
      fullname: selectedCompany?.fullname,
      moduleParam,
      pathname,
    });*/

    tryReload();
  }, [
    selectedCompany,
    moduleParam,
    pathname,
    getStorageKey,
    getGlobalInstances,
  ]);

  useEffect(() => {
    if (instances.length > 0) {
      const savedId = localStorage.getItem(
        `activeInstance-${division}-${moduleParam}`
      );
      const parsedId = Number(savedId);
      if (savedId && instances.some((inst) => inst.id === parsedId)) {
        setActiveInstance(parsedId);
      } else {
        setActiveInstance(instances[0].id);
      }
    }
  }, [instances, division, moduleParam]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === getStorageKey()) {
        try {
          const newData = JSON.parse(event.newValue);
          if (newData) {
            setInstances(newData.instances || []);
            setActiveInstance(newData.activeInstance || null);
          }
        } catch (error) {}
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [getStorageKey]);

  const fetchShortcuts = useCallback(async () => {
    if (!selectedCompany?.idUser) return;
    try {
      const response = await fetch("/api/menu-shortcuts-by-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idUser: selectedCompany.idUser }),
      });
      const data = await response.json();
      setShortcuts(data.data.data || []);
    } catch (error) {
    }
  }, [selectedCompany]);

  const isItemInShortcuts = (item) => {
    const itemId =
      item.originalData.moduleGroup === "CUSTOM"
        ? item.originalData.idMenuParent
        : item.originalData.idMenu;
    const customId =
      item.originalData.moduleGroup === "CUSTOM" ? item.originalData.idMenu : 0;

    return shortcuts.some(
      (shortcut) =>
        (shortcut.idMenu === itemId && shortcut.idCustomOption === customId) ||
        (shortcut.idCustomOption === customId && customId !== 0)
    );
  };

  const handleAddShortcut = async (item) => {
    if (!hasPrivilege) {
      showNotification(
        "warning",
        "Necesitas privilegios para agregar accesos directos",
        "toast"
      );
      return;
    }

    if (isItemInShortcuts(item)) {
      showNotification(
        "info",
        "Este elemento ya está en tus accesos directos",
        "toast"
      );
      return;
    }

    // 🚫 Validar si ya hay 5
    if (shortcuts.length >= 5) {
      showNotification(
        "warning",
        "Solo puedes tener hasta 5 accesos directos",
        "toast"
      );
      return;
    }

    const payload = {
      idMenu:
        item.originalData.moduleGroup === "CUSTOM"
          ? item.originalData.idMenuParent
          : item.originalData.idMenu,
      idCustomOption:
        item.originalData.moduleGroup === "CUSTOM"
          ? item.originalData.idMenu
          : 0,
      idUser: selectedCompany.idUser,
    };

    try {
      const res = await fetch("/api/menu-shortcuts/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error agregando shortcut");

      await res.json();
      await fetchShortcuts();
      showNotification("success", "Acceso directo agregado con éxito", "toast");
    } catch (e) {
      showNotification(
        "error",
        "No se pudo agregar el acceso directo",
        "toast"
      );
    }
  };

  const getIconForMenu = (name) => {
    if (!name) return "FileText";

    const iconMap = {
      Transacciones: TransaccionesIcon,
      Consultas: ConsultasIcon,
      Reportes: ReportesIcon,
      Catálogo: CatalogoIcon,
      Administración: AdministracionIcon,
      Dashboard: DashboardIcon,
    };

    for (const [key, IconComponent] of Object.entries(iconMap)) {
      if (name.includes(key)) return IconComponent;
    }

    return "FileText";
  };

  const organizeMenuHierarchy = (items) => {
    const copy = JSON.parse(JSON.stringify(items));
    const map = {};
    copy.forEach((item) => {
      const parent = item.pKey || null;
      map[item.keyValue] = {
        ...item,
        pKey: parent,
        children: [],
      };
    });

    const roots = [];
    copy.forEach((item) => {
      const parent = item.pKey || null;

      if (!parent) {
        roots.push(map[item.keyValue]);
      } else if (map[parent]) {
        map[parent].children.push(map[item.keyValue]);
      } else {
        
        roots.push(map[item.keyValue]);
      }
    });

    return roots;
  };

  const loadMenuData = useCallback(async () => {
    if (!selectedCompany?.idCompany) {
      return;
    }

    if (!moduleId) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = { idModule: moduleId };

      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const response = await res.json();

      const allOptions = response.data || [];

      allOptions.forEach((item) => {
        if (item.pKey === "" || item.pKey === undefined) {
          item.pKey = null;
        }
        if (!item.textOption && item.idName) {
          item.textOption = item.idName;
        }
      });

      const hierarchy = organizeMenuHierarchy(allOptions);

      const topLevelMenus = hierarchy.map((item) => ({
        id: item.keyValue,
        name: item.textOption || item.idName,
        icon: getIconForMenu(item.textOption || item.idName),
        originalData: item,
      }));

      setMenuData(topLevelMenus);

      const subMenus = {};
      hierarchy.forEach((item) => {
        subMenus[item.keyValue] = item.children || [];
      });

      setSubMenuItems(subMenus);

      // Seleccionar el primer menú si no hay uno seleccionado
      if (!selectedMenuItem) {
        if (topLevelMenus.length > 0) {
          setSelectedMenuItem(topLevelMenus[0].id);
        } else {
          // Si no hay datos, seleccionar el primer menú por defecto
          const defaultMenuId = `default-${menuOrdenado[0]}`;
          setSelectedMenuItem(defaultMenuId);
        }
      }

      const expandedMap = {};
      const expandAll = (items) => {
        items.forEach((item) => {
          if (item.children && item.children.length > 0) {
            expandedMap[item.keyValue] = true;
            expandAll(item.children);
          }
        });
      };
      expandAll(hierarchy);
    } catch (error) {
      showNotification("error", "Error al cargar los datos del menú", "toast");
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedCompany,
    moduleId,
    selectedMenuItem,
    showNotification,
    menuOrdenado,
  ]);

  useEffect(() => {
    if (moduleId && selectedCompany?.idCompany && instances.length > 0) {
      loadMenuData();
    } else {
      if (instances.length === 0) {
        setMenuData([]);
        setSubMenuItems({});
        setSelectedMenuItem("");
        setIsLoading(false);
      }
    }
  }, [
    moduleId,
    selectedCompany?.idCompany,
    instances.length,
    activeInstance,
    loadMenuData,
  ]);

  useEffect(() => {
    fetchShortcuts();
  }, [fetchShortcuts]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const addNewInstance = async () => {
    try {
      const allGlobal = getGlobalInstances();

      // Filtrar solo las instancias de este módulo y división
      const moduleInstances = allGlobal.filter(
        (i) => i.division === division && i.module === moduleParam
      );

      // Obtener el siguiente ID por módulo/división
      const nextId = moduleInstances.length
        ? Math.max(...moduleInstances.map((i) => i.id)) + 1
        : 1;

      const newInst = {
        id: nextId,
        name: `Instancia ${nextId}`,
        active: true,
      };

      setInstances((prev) => [...prev, newInst]);
      setActiveInstance(nextId);

      const parsedData = JSON.parse(localStorage.getItem("currentModuleData"));

      // 🔐 Crear sesión
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idCompanyModule: parsedData.idCompanyModule }),
      });

      const data = await res.json();

      const instanceWithSession = {
        ...newInst,
        idCompanyModule: parsedData.idCompanyModule,
        exeName: exeName,
        session: data.data.session,
        idSession: data.data.idSession,
        division,
        module: moduleParam,
        timestamp: Date.now(),
        idUserCompanyConnection: selectedCompany.idUserCompanyConnection,
        serverErpDb: selectedCompany.serverErpDb,
      };

      // Verificar duplicado antes de guardar
      const existing = allGlobal.some(
        (inst) =>
          inst.id === instanceWithSession.id &&
          inst.division === division &&
          inst.module === moduleParam
      );

      const globalUpdated = existing
        ? allGlobal
        : [...allGlobal, instanceWithSession];

      localStorage.setItem(
        `${selectedCompany.name}-${selectedCompany.fullname}-global-instances`,
        JSON.stringify(globalUpdated)
      );

      saveInstanceWithSession(nextId, data, true);

      localStorage.setItem(
        "sessionData",
        JSON.stringify({
          idCompanyModule: parsedData.idCompanyModule,
          exeName: exeName,
          session: data.data.session,
        })
      );

      showNotification(
        "success",
        `Nueva instancia de ${moduleParam} creada exitosamente`,
        "toast"
      );

      //document.cookie = `menuPermisos=0; path=/; SameSite=Lax`;

      const encryptedPassword = selectedCompany.passwordErpDb;
      const decodedPassword = decryptAES(encryptedPassword);

      setTimeout(() => {
        window.location.href = `advanerpconnect://${exeName}?session=${data.data.idSession}?server=${selectedCompany.serverErpDb}?database=${selectedCompany.nameErpDb}?user=${selectedCompany.userErpDb}?password=${decodedPassword}?idSession=${data.data.idSession}`;
      }, 2500);

      let attempts = 0;
      const intervalId = setInterval(() => {
        fetchMenuPermissions();
        attempts++;
        if (attempts >= 10) clearInterval(intervalId);
      }, 5000);

      return instanceWithSession;
    } catch (err) {
      showNotification(
        "error",
        "Ocurrió un error al crear la instancia",
        "toast"
      );
    }
  };

  const removeInstance = async (id, e) => {
    e.stopPropagation();

    const globalInstances = getGlobalInstances();
    const instanceToRemove = globalInstances.find(
      (inst) =>
        inst.id === id &&
        inst.division === division &&
        inst.module === moduleParam
    );
    const session = instanceToRemove?.session;
    const idSession = instanceToRemove?.idSession;
    const idCompanyModule = instanceToRemove?.idCompanyModule;

    const updated = instances.filter((i) => i.id !== id);
    if (activeInstance === id && updated.length) {
      setActiveInstance(updated[0].id);
    } else if (updated.length === 0) {
      setActiveInstance(null);
    }

    setInstances(updated);
    removeGlobalInstance(division, moduleParam, id);

    if (idSession && idCompanyModule) {
      try {
        const response = await fetch("/api/session", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idSession: idSession,
            idCompanyModule: idCompanyModule,
          }),
        });

        if (!response.ok) {
        }
      } catch (error) {
      }
    }

    if (exeName && session) {
      setTimeout(() => {
        window.location.href = `advanerpconnect://close/${exeName}?session=${idSession}`;
        showNotification(
          "success",
          `Instancia de ${moduleParam} cerrada exitosamente`,
          "toast"
        );
      }, 500);
    } else {
      showNotification(
        "error",
        "No se encontró el acrónimo del módulo para cerrar.",
        "toast"
      );
    }

    let attempts = 0;
    const intervalId = setInterval(() => {
      fetchMenuPermissions();
      attempts++;
      if (attempts >= 2) {
        clearInterval(intervalId);
      }
    }, 2000);
  };

  const setInstanceActive = (id) => {
    const storageKey = getStorageKey();
    const storedData = localStorage.getItem(storageKey);

    if (storedData) {
      const instancesData = JSON.parse(storedData);
      const instance = instancesData.instances.find((inst) => inst.id === id);

      if (instance && instance.idUser && instance.session) {
        const sessionInfo = {
          idUser: instance.idUser,
          session: instance.session,
        };
        localStorage.setItem("sessionData", JSON.stringify(sessionInfo));
      }
    }

    setActiveInstance(id);
  };

  const getCurrentSession = useCallback(() => {
    if (!activeInstance) return null;

    const globalInstances = getGlobalInstances();
    const currentInstance = globalInstances.find(
      (inst) =>
        inst.id === activeInstance &&
        inst.division === division &&
        inst.module === moduleParam
    );

    return currentInstance?.idSession || null;
  }, [activeInstance, getGlobalInstances, division, moduleParam]);

  return {
    division,
    moduleParam,
    primaryColor,
    user,
    moduleId,
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
    showNotification,
    setShowInstancesModal,
    searchTerm,
    setSearchTerm,
    isMobile,
    isLoading,
    subMenuItems,
    shortcuts,
    menuOrdenado,
    notification,
    showNotification,
    closeNotification,
    fetchShortcuts,
    isItemInShortcuts,
    handleAddShortcut,
    getIconForMenu,
    organizeMenuHierarchy,
    loadMenuData,
    addNewInstance,
    removeInstance,
    setInstanceActive,
    getGlobalInstances,
    saveGlobalInstance,
    removeGlobalInstance,
    currentModule,
    hasPrivilege,
    setHasPrivilege,
    hasMenuPermission,
    hasAnyChildPermission,
    menuPermissions,
    fetchMenuPermissions,
    getCurrentSession,
    matchingInstances,
    setMatchingInstances,
    selectedShortcut,
    setSelectedShortcut,
    shortcuts,
  };
}
