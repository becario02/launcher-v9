"use client";

import React, { useState } from "react";
import { Check, X } from "lucide-react";

export default function AssignConnectionModal({
  isOpen,
  onClose,
  onAssign,
  connection,
  users,
}) {
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !connection) return null;

  const handleToggle = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAssign = async () => {
    const toAssign = selectedUserIds.filter((id) => {
      const user = users.find((u) => u.idUser === id);
      return user && !user.connections?.some((c) => c.id === connection.id);
    });

    if (toAssign.length > 0) {
      setLoading(true);
      await onAssign(toAssign, connection);
      setLoading(false);
      setSelectedUserIds([]);
    }
  };

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

  const translateEnvironment = (env) => {
    switch (env?.toLowerCase()) {
      case "production":
        return "PRODUCCIÓN";
      case "development":
        return "Desarrollo";
      case "test":
      case "testing":
        return "PRUEBAS";
      case "staging":
        return "Preproducción";
      default:
        return env || "-";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white dark:bg-[#1c1c24] p-6 rounded-md w-[600px] max-h-[85vh] overflow-y-auto shadow-lg border dark:border-[#353542]">
        <h2 className="text-lg font-semibold mb-4 text-[#171725] dark:text-white">
          Asignar conexión
        </h2>

        {/* Información de la conexión */}
        <div className="text-sm text-[#696974] dark:text-[#A0A0AB] space-y-1 mb-4 border border-[#E6E8EC] dark:border-[#353542] rounded p-3 bg-[#F9FAFB] dark:bg-[#2C2C38]">
          <p>
            <strong>📂 Base de datos:</strong> {connection.name}
          </p>
          <p>
            <strong>🖥 Servidor:</strong> {formatServer(connection.server)}
          </p>
          <p>
            <strong>🌐 Entorno:</strong>{" "}
            {translateEnvironment(connection.environment)}
          </p>
        </div>

        {/* Lista de usuarios */}
        <div className="space-y-2 max-h-[280px] overflow-y-auto mb-4">
          {users.map((user) => {
            const isSelected = selectedUserIds.includes(user.idUser);
            const hasConnection = user.connections?.some(
              (c) =>
                c.companyIdentifier === connection.companyIdentifier &&
                c.db === connection.name &&
                c.server === connection.server &&
                c.env === connection.environment
            );

            return (
              <div
                key={user.idUser}
                className="flex items-center justify-between px-3 py-2 rounded bg-[#F4F4F5] dark:bg-[#2C2C38] border border-[#E6E8EC] dark:border-[#353542]"
              >
                <div className="flex flex-col text-sm text-[#171725] dark:text-white w-full">
                  <span className="font-medium truncate">{user.fullname}</span>
                  <span className="text-xs text-[#696974] dark:text-[#A0A0AB] truncate">
                    {user.email}
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={hasConnection || isSelected}
                    disabled={hasConnection}
                    onChange={() => handleToggle(user.idUser)}
                  />
                  <div
                    className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${
                      hasConnection
                        ? "bg-green-400 opacity-50 cursor-not-allowed"
                        : "bg-gray-300 dark:bg-[#444] peer-checked:bg-green-500"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md transform transition-all duration-300 flex items-center justify-center text-white ${
                        hasConnection || isSelected
                          ? "translate-x-4 bg-white text-green-500"
                          : "translate-x-0 bg-white text-pink-500"
                      }`}
                    >
                      {hasConnection || isSelected ? (
                        <Check size={14} />
                      ) : (
                        <X size={14} />
                      )}
                    </div>
                  </div>
                </label>
              </div>
            );
          })}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm px-3 py-1 border rounded-[10px] text-gray-600 dark:text-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={selectedUserIds.length === 0 || loading}
            className={`text-sm px-3 py-1 rounded-[10px] text-white ${
              selectedUserIds.length > 0 && !loading
                ? "bg-primary hover:bg-primary"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Asignando..." : "Asignar"}
          </button>
        </div>
      </div>
    </div>
  );
}
