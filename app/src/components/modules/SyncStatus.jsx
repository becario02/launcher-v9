"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info, AlertTriangle } from "lucide-react";
import { useCompany } from "@/context/CompanyContext";

const SyncStatus = () => {
  const { syncingModules, selectedCompany, syncError } = useCompany();
  const [notifications, setNotifications] = useState([]);
  const [wasSyncing, setWasSyncing] = useState(false);

  useEffect(() => {
    if (!syncingModules && syncError && !wasSyncing) {
      const notificationId = Date.now();
      addNotification({
        id: notificationId,
        type: "error",
        message: syncError,
        duration: 20000,
      });
    }
  }, [syncError, syncingModules, wasSyncing]);

  useEffect(() => {
    // Detectar cuando termina la sincronización
    if (wasSyncing && !syncingModules) {
      const notificationId = Date.now();

      if (syncError) {
        addNotification({
          id: notificationId,
          type: "error",
          message: syncError,
          duration: 20000,
        });
      } else {
        addNotification({
          id: notificationId,
          type: "success",
          message: `Módulos de ${selectedCompany?.name} sincronizados correctamente`,
          duration: 4000,
        });
      }
    }

    setWasSyncing(syncingModules);
  }, [syncingModules, syncError, selectedCompany, wasSyncing]);

  const addNotification = (notification) => {
    setNotifications((prev) => {
      const alreadyExists = prev.some(
        (n) => n.message === notification.message
      );
      if (alreadyExists) return prev;
      return [...prev, notification];
    });

    setTimeout(() => {
      removeNotification(notification.message);
    }, notification.duration);
  };

  const removeNotification = (idOrMessage) => {
    setNotifications((prev) =>
      prev.filter((n) =>
        typeof idOrMessage === "string"
          ? n.message !== idOrMessage
          : n.id !== idOrMessage
      )
    );
  };

  // Colores por tipo
  const getColors = (type) => {
    const colorMap = {
      success: {
        border: "#0a9101",
        bg: "#edffec",
        text: "#0a9101",
      },
      error: {
        border: "red",
        bg: "#ffecec",
        text: "red",
      },
      info: {
        border: "#007bff",
        bg: "#e7f3ff",
        text: "#007bff",
      },
    };
    return colorMap[type] || colorMap.info;
  };

  // Iconos por tipo
  const getIcon = (type) => {
    const colors = getColors(type);

    if (type === "success") {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke={colors.text}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            stroke={colors.text}
            strokeWidth="2"
            strokeLinejoin="round"
            d="M9 9.5h.01v.01H9zM15 9.5h.01v.01H15z"
          />
          <path
            d="M15.465 14A3.998 3.998 0 0 1 12 16a3.998 3.998 0 0 1-3.465-2"
            stroke={colors.text}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    } else if (type === "error") {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke={colors.text}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            stroke={colors.text}
            strokeWidth="3"
            strokeLinejoin="round"
            d="M9 9.5h.01v.01H9zM15 9.5h.01v.01H15z"
          />
          <path
            d="M8.535 16A3.998 3.998 0 0 1 12 14c1.48 0 2.773.804 3.465 2"
            stroke={colors.text}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    } else {
      return <Info size={20} color={colors.text} />;
    }
  };

  const SyncIcon = () => {
    const colors = getColors("info");
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/SVG"
        className="animate-spin"
      >
        <path
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          stroke={colors.text}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return createPortal(
    <div className="fixed top-[100px] right-5 z-[2147483647] space-y-3">
      {syncingModules && (
        <div
          className="flex items-center gap-3 p-4 rounded-[10px] shadow-md transition-all duration-300 opacity-100 translate-x-0"
          style={{
            border: `1px solid ${getColors("info").border}`,
            backgroundColor: getColors("info").bg,
            color: getColors("info").text,
          }}
        >
          <SyncIcon />
          <h4
            style={{
              fontFamily: "Poppins",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            Sincronizando módulos de {selectedCompany?.name || "la empresa"}...
          </h4>
        </div>
      )}

      {notifications.map((notification) => {
        const colors = getColors(notification.type);
        return (
          <div
            key={notification.id}
            className="flex items-center gap-3 p-4 rounded-[10px] shadow-md transition-all duration-300 opacity-100 translate-x-0 animate-fadeIn"
            style={{
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.bg,
              color: colors.text,
            }}
          >
            {getIcon(notification.type)}
            <h4
              style={{
                fontFamily: "Poppins",
                fontSize: "12px",
                fontWeight: 500,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxWidth: "500px",
              }}
            >
              {notification.message}
            </h4>
          </div>
        );
      })}
    </div>,
    typeof window !== "undefined" ? document.body : null
  );
};

export default SyncStatus;
