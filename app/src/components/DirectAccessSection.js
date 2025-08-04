"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCompany } from "@/context/CompanyContext";
import Notification from "./Notification";
import { useRouter } from "next/navigation";
import { useModulePage } from "@/hooks/useModulePage";
import Cookies from "js-cookie";

const translateModuleGroup = (moduleGroup) => {
  const translations = {
    OPERATIVES: "NUCLEARES",
    FINANCIAL: "FINANCIEROS",
    AUXILIARIES: "AUXILIARES",
  };
  return translations[moduleGroup] || moduleGroup;
};

const SortableItem = ({ item, onDelete, onClick }) => {
  const {
    attributes,
    setNodeRef,
    transform,
    transition,
    isDragging,
    listeners,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const translatedCategory = translateModuleGroup(item.category);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C24] rounded-md border border-gray-200 dark:border-[#2C2C38] hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-3 text-[13px] text-gray-500 dark:text-gray-400">
        <div {...listeners}>
          <GripVertical className="w-4 h-4 cursor-grab" />
        </div>
        <div className="flex items-center gap-4">
          <span>{translatedCategory}</span>
          <span className="text-gray-300 dark:text-gray-500">{">"}</span>
          <span>{item.subcategory}</span>
          <span className="text-gray-300 dark:text-gray-500">{">"}</span>
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {item.name}
          </span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item.id);
        }}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

const DirectAccessSection = () => {
  const router = useRouter();
  const { selectedCompany } = useCompany();
  const { getGlobalInstances, addNewInstance, showNotification, acronym } = useModulePage();
  const [items, setItems] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [wasDragging, setWasDragging] = useState(false);

  const [selectedShortcut, setSelectedShortcut] = useState(null);
  const [matchingInstances, setMatchingInstances] = useState([]);
  const [showInstancesModal, setShowInstancesModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const [notification, setNotification] = useState({
    visible: false,
    type: "success",
    message: "",
    style: "toast",
  });

  // Function to get user's IP address
  const getUserIP = useCallback(async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting IP:', error);
      return 'unknown';
    }
  }, []);

  // Function to send menu tracking to endpoint
  const sendMenuTracking = useCallback(async (idMenu) => {
    try {
      const userId = Cookies.get('idUser');
      const userIP = await getUserIP();

      if (!userId) {
        console.error('User ID not found in cookies');
        return;
      }

      const response = await fetch('/api/menu-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idUser: parseInt(userId),
          idMenu: idMenu,
          idCustomOption: 0,
          ipName: userIP
        })
      });

      if (!response.ok) {
        console.error('Error sending menu tracking:', response.statusText);
      }
      // Silent operation - no success message shown
    } catch (error) {
      console.error('Error sending menu tracking:', error);
    }
  }, [getUserIP]);

  useEffect(() => {
    const fetchAccesses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/menu-shortcuts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idUser: selectedCompany.idUser }),
        });

        const data = await response.json();

        const mappedData = data.data.data.map((access) => ({
          id: access.idMenuShortCut,
          category: access.moduleGroup || "Sin Categoría",
          subcategory: access.moduleName || "Sin Módulo",
          name: access.textOption || "Sin Nombre",
          idName: access.idName || "Sin ID",
          idMenu: access.idMenu || null,
        }));

        setItems(mappedData);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedCompany?.idUser) {
      fetchAccesses();
    }
  }, [selectedCompany]);

  const handleShortcutClick = useCallback((item) => {
    if (wasDragging) return;

    // ENVIAR TRACKING SILENCIOSO ANTES DE NAVEGAR
    if (item.idMenu) {
      sendMenuTracking(item.idMenu);
    }

    const division = translateModuleGroup(item.category).toLowerCase();
    const moduleName = item.subcategory.toLowerCase();
    const idName = item.idName;
    const targetPath = `/divisiones/${division}/${moduleName}`;
    const textOption = item.name;

    localStorage.setItem(
      "shortcutIntent",
      JSON.stringify({
        division,
        moduleName,
        idName,
        acronym,
        textOption,
      })
    );

    if (window.location.pathname !== targetPath) {
      router.push(targetPath);
    } else {
      handleShortcutIntent();
    }
  }, [wasDragging, sendMenuTracking, acronym, router]);

  const handleDragStart = (event) => {
    setWasDragging(true);
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(items, oldIndex, newIndex);
        const updatedItems = reordered.map((item, index) => ({
          ...item,
          sequence: index + 1,
        }));
        setItems(updatedItems);

        updatedItems.forEach(async (item) => {
          try {
            await fetch("/api/menu-shortcuts/sequence", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                idMenuShortCut: item.id,
                sequence: item.sequence,
              }),
            });
          } catch (error) {}
        });
      }
    }
    setActiveId(null);

    setTimeout(() => setWasDragging(false), 0);
  };

  const confirmDelete = (id) => {
    setIdToDelete(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!idToDelete) return;
    setIsDeleting(true);
    try {
      await fetch("/api/menu-shortcuts/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idMenuShortCut: idToDelete }),
      });

      setItems((prevItems) =>
        prevItems.filter((item) => item.id !== idToDelete)
      );
      setNotification({
        visible: true,
        type: "success",
        message: "Acceso directo eliminado correctamente.",
        style: "toast",
      });
    } catch (error) {
      setNotification({
        visible: true,
        type: "error",
        message: "Hubo un problema al eliminar el acceso directo.",
        style: "toast",
      });
    } finally {
      setIsDeleting(false);
      setShowModal(false);
      setIdToDelete(null);
    }
  };

  const visibleItems = expanded ? items : items.slice(0, 3);
  const hasMore = items.length > 3;

  return (
    <>
      {notification.visible && notification.style === "toast" && (
        <div className="fixed top-4 right-4 z-[9999]">
          <Notification
            visible
            type={notification.type}
            message={notification.message}
            style="toast"
            onClose={() =>
              setNotification((prev) => ({ ...prev, visible: false }))
            }
          />
        </div>
      )}

      <section className="font-[Poppins] bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-xl px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-medium text-gray-800 dark:text-gray-100">
            Mis accesos directos
          </h2>
          {hasMore && !isLoading && (
            <button
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C24] rounded-md border border-gray-200 dark:border-[#2C2C38]"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                  <div className="flex flex-col gap-2 w-full">
                    <div className="h-3 w-3/4 bg-gray-300 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence>
                <div className="space-y-2">
                  {visibleItems.map((item) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      onDelete={confirmDelete}
                      onClick={() => handleShortcutClick(item)}
                    />
                  ))}
                </div>
              </AnimatePresence>
            </SortableContext>

            <DragOverlay>
              {activeId && (
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.05 }}
                  exit={{ scale: 1, opacity: 0 }}
                  transition={{
                    type: "spring",
                    bounce: 0.3,
                    duration: 0.3,
                  }}
                  className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C24] rounded-md border border-gray-200 dark:border-[#2C2C38] shadow-lg"
                >
                  <div className="flex items-center gap-3 text-[13px] text-gray-500 dark:text-gray-400">
                    <GripVertical className="w-4 h-4" />
                    <div className="flex items-center gap-4">
                      <span>
                        {translateModuleGroup(
                          items.find((i) => i.id === activeId)?.category
                        )}
                      </span>
                      <span className="text-gray-300 dark:text-gray-500">
                        {">"}
                      </span>
                      <span>
                        {items.find((i) => i.id === activeId)?.subcategory}
                      </span>
                      <span className="text-gray-300 dark:text-gray-500">
                        {">"}
                      </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {items.find((i) => i.id === activeId)?.name}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-[#1C1C24] rounded-xl shadow-lg p-8 w-full max-w-sm text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-[#FFEFEF] dark:bg-[#402020] rounded-full p-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-red-500"
                >
                  <path
                    d="M14 11v6M10 11v6M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M4 7h16M7 7l2-4h6l2 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="text-h3 font-regular text-gray-800 dark:text-gray-100">
                ¿Eliminar acceso directo?
              </h2>
            </div>

            <p className="text-p font-regular text-gray-600 dark:text-gray-400 mb-4">
              Estás a punto de eliminar este acceso directo, ya no aparecerá en
              tu lista.
            </p>

            <p className="text-p text-gray-600 dark:text-gray-400 font-regular mb-6">
              ¿Estás seguro de ejecutar esta acción?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 text-p rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`px-5 py-2 rounded-md text-white flex items-center text-p justify-center gap-2 ${
                  isDeleting
                    ? "bg-primary cursor-not-allowed"
                    : "bg-primary hover:bg-primary-dark"
                }`}
              >
                {isDeleting && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                )}
                {isDeleting ? "Eliminando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DirectAccessSection;