"use client";

import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import Notification from "@/components/Notification";

export default function CategoryPermissionsModal({
  isOpen,
  onClose,
  userId,
  type, // 'custom' o 'dashboard'
  options = [],
  permissions,
  setPermissions,
}) {
  const [localPerms, setLocalPerms] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    type: "success",
    message: "",
    style: "toast",
  });

  const getKey = (item, index) => {
    if (type === "custom") {
      return `custom_${item.idCustomOption ?? index}`;
    } else {
      return `dashboard_${item.idManagementDashboard ?? index}`;
    }
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!isOpen || !userId) return;
      setIsLoading(true);

      try {
        const url =
          type === "custom"
            ? "/api/user-custom-option-by-user"
            : "/api/user-dashboard-by-user";

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ IdUser: userId }),
        });

        const json = await response.json();
        const data = json?.data?.permisos || [];

        const initial = {};

        data.forEach((item) => {
          const key =
            type === "custom"
              ? `custom_${item.idCustomOption}`
              : `dashboard_${item.idManagementDashboard}`;

          initial[key] = {
            enabled: true,
            relationId:
              type === "custom"
                ? item.idProfileCustomOption
                : item.idUserManagementDashboard,
          };
        });

        options.forEach((opt) => {
          const key = getKey(opt);
          if (!initial[key]) {
            initial[key] = { enabled: false, relationId: null };
          }
        });

        setLocalPerms(initial);

        setPermissions((prev) => ({
          ...prev,
          [userId]: initial,
        }));
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [isOpen, userId, type, options]);

  const handleToggle = (key) => {
    setLocalPerms((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        enabled: !prev[key].enabled,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    const addEndpoint =
      type === "custom"
        ? "/api/add-user-custom-option"
        : "/api/add-profile-dashboard";

    const deleteEndpoint =
      type === "custom"
        ? "/api/delete-user-custom-option-by-user"
        : "/api/delete-user-dashboard-by-user";

    const original = permissions[userId] || {};
    const current = localPerms;
    const keys = Object.keys(current);

    const addRequests = [];
    const deleteRequests = [];

    keys.forEach((key) => {
      const id = parseInt(key.split("_")[1], 10);
      const wasEnabled = original[key]?.enabled;
      const isNowEnabled = current[key]?.enabled;

      if (!wasEnabled && isNowEnabled) {
        const payload =
          type === "custom"
            ? { idCustomOption: id, idUser: userId }
            : { idManagementDashboard: id, idUser: userId };

        addRequests.push(axios.post(addEndpoint, payload));
      }

      if (wasEnabled && !isNowEnabled) {
        const relationId = original[key]?.relationId;
        if (relationId) {
          const payload =
            type === "custom"
              ? { idProfileCustomOption: relationId }
              : { idUserManagementDashboard: relationId };

          deleteRequests.push(axios.delete(deleteEndpoint, { data: payload }));
        }
      }
    });

    try {
      await Promise.all([...addRequests, ...deleteRequests]);

      setPermissions((prev) => ({
        ...prev,
        [userId]: current,
      }));

      showNotification(
        "success",
        "Permisos actualizados correctamente",
        "toast"
      );

      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error al guardar cambios:", err);
      alert("Ocurrió un error al guardar los permisos.");
    }
  };

  const showNotification = (type, message, style = "toast") => {
    setNotification({
      visible: false,
      type: "info",
      message: "",
      style: "inline",
    });
    setTimeout(
      () => setNotification({ visible: true, type, message, style }),
      50
    );
  };

  const closeNotification = () =>
    setNotification((prev) => ({ ...prev, visible: false }));

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
      >
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="relative bg-white dark:bg-[#1c1c24] rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-h4 font-semibold text-gray-900 dark:text-white">
              {type === "custom"
                ? "Permisos: Opciones personalizadas"
                : "Permisos: Dashboards"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-64 pr-1 mb-4">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg animate-pulse"
                  >
                    <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-600 rounded-md" />
                    <div className="h-6 w-11 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  </div>
                ))
              : (() => {
                  const validOptions = options.filter((opt) =>
                    type === "custom"
                      ? opt.idCustomOption !== undefined
                      : opt.idManagementDashboard !== undefined
                  );

                  return validOptions.length === 0 ? (
                    <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M4 6h16M4 10h16M4 14h16M4 18h16"
                          />
                        </svg>
                        No hay opciones disponibles
                      </span>
                    </div>
                  ) : (
                    validOptions.map((item, index) => {
                      const key =
                        type === "custom"
                          ? `custom_${item.idCustomOption ?? index}`
                          : `dashboard_${item.idManagementDashboard ?? index}`;

                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg"
                        >
                          <span className="text-p text-gray-900 dark:text-white">
                            {item.textOption || item.boardname || "Sin nombre"}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={localPerms[key]?.enabled || false}
                              onChange={() => handleToggle(key)}
                            />
                            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:bg-primary transition" />
                            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-5" />
                          </label>
                        </div>
                      );
                    })
                  );
                })()}
          </div>

          {options.length > 0 && !isLoading && (
            <div className="flex justify-end gap-3 mt-6 text-p">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-[20px] bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-4 py-2 rounded-[20px] font-semibold text-white transition ${
                  isSaving
                    ? "bg-primary cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          )}
        </div>
      </Dialog>

      {notification.visible && notification.style === "toast" && (
        <div className="fixed top-4 right-4 z-[2147483647]">
          <Notification
            visible
            type={notification.type}
            message={notification.message}
            style="toast"
            onClose={closeNotification}
          />
        </div>
      )}

      {notification.visible && notification.style === "inline" && (
        <Notification
          visible
          type={notification.type}
          message={notification.message}
          style="inline"
          onClose={closeNotification}
        />
      )}
    </>
  );
}
