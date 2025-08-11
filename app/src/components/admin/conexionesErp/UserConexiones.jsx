"use client";

import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import DeleteErpConnectionModal from "./DeleteErpConnectionModal";

export default function UserSlider({ users, setUsers, handleDelete, loading }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + users.length) % users.length);
  };

  const showNext = () => {
    setCurrentIndex((prev) => (prev + 1) % users.length);
  };

  const translateEnv = (env) =>
    env === "TEST" ? "Pruebas" : env === "PRODUCTION" ? "Producción" : env;

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    handleDelete(deleteTarget, users[currentIndex]?.idUser).finally(() => {
      setIsDeleting(false);
      setDeleteTarget(null);
    });
  };

  if (loading) {
    return (
      <div className="py-10 flex justify-center items-center w-full">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="text-center text-[#92929D] dark:text-[#A0A0AB] py-10">
        🧐 No hay usuarios con conexiones ERP disponibles.
      </div>
    );
  }

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
  

  const selectedUser = users[currentIndex];

  return (
    <>
      <div className="w-full flex flex-col items-center gap-6 min-h-[90vh]">
        {/* Slider */}
        <div className="relative w-[500px] h-60 flex items-center justify-center overflow-hidden mx-auto">
          <div className="relative w-full h-full flex items-center justify-center">
            {users.map((user, index) => {
              const offset = index - currentIndex;
              let style = "hidden";

              if (offset === 0) {
                style = "z-20 scale-100 opacity-100 blur-0 rotate-0";
              } else if (offset === -1 || offset === users.length - 1) {
                style =
                  "z-10 -translate-x-52 scale-90 opacity-90 blur-[1px] rotate-y-[6deg]";
              } else if (offset === 1 || offset === -(users.length - 1)) {
                style =
                  "z-10 translate-x-52 scale-90 opacity-90 blur-[1px] -rotate-y-[6deg]";
              }

              return (
                <div
                  key={user.idUser}
                  className={`absolute transition-all duration-500 ease-in-out transform ${style}`}
                >
                  <div className="bg-white dark:bg-[#1c1c24] border border-[#E6E8EC] dark:border-[#2C2C38] p-6 rounded-xl text-center shadow-md w-64">
                    <div className="text-[#0080FF] text-3xl mb-2">👤</div>
                    <div className="text-lg font-semibold text-[#171725] dark:text-white truncate">
                      {user.fullname}
                    </div>
                    <div className="text-sm text-[#696974] dark:text-[#A0A0AB] truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={showPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-[#2C2C38] p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-[#3a3a3a] z-30"
          >
            ◀
          </button>
          <button
            onClick={showNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-[#2C2C38] p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-[#3a3a3a] z-30"
          >
            ▶
          </button>
        </div>

        {/* Conexiones */}
        {selectedUser.connections.length === 0 ? (
          <div className="w-full text-center text-[#92929D] dark:text-[#A0A0AB] py-6">
            🛑 Este usuario no tiene conexiones.
          </div>
        ) : selectedUser.connections.length === 1 ? (
          <div className="px-4 w-full flex justify-center">
            <div
              key={selectedUser.connections[0].id}
              className="relative group bg-[#F9FAFB] dark:bg-[#2C2C38] px-3 py-2 rounded-[10px] border border-[#E6E8EC] dark:border-[#353542] text-xs hover:shadow transition-all duration-200 w-[220px]"
            >
              <div
                onClick={() =>
                  setSelectedConnection(selectedUser.connections[0])
                }
                className="cursor-pointer space-y-1 pb-4"
              >
                <div className="flex items-center gap-2 font-medium text-[#171725] dark:text-white text-[13px]">
                  📂{" "}
                  <span className="whitespace-nowrap">
                    {selectedUser.connections[0].db}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#696974] dark:text-[#A0A0AB]">
                  🏢{" "}
                  <span className="whitespace-nowrap">
                    {selectedUser.connections[0].company}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#696974] dark:text-[#A0A0AB]">
                  🖥{" "}
                  <span className="whitespace-nowrap">
                    {formatServer(selectedUser.connections[0].server)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#696974] dark:text-[#A0A0AB]">
                  🌐{" "}
                  <span>{translateEnv(selectedUser.connections[0].env)}</span>
                </div>
              </div>

              <button
                onClick={() => setDeleteTarget(selectedUser.connections[0])}
                className="absolute bottom-1.5 right-1.5 text-primary hover:text-red-500 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 px-4">
            {selectedUser.connections.map((conn) => (
              <div
                key={conn.id}
                className="relative group bg-[#F9FAFB] dark:bg-[#2C2C38] px-3 py-2 rounded-[10px] border border-[#E6E8EC] dark:border-[#353542] text-xs hover:shadow transition-all duration-200 w-full"
              >
                <div
                  onClick={() => setSelectedConnection(conn)}
                  className="cursor-pointer space-y-1 pb-4"
                >
                  <div className="flex items-center gap-2 font-medium text-[#171725] dark:text-white text-[13px]">
                    📂 <span className="whitespace-nowrap">{conn.db}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#696974] dark:text-[#A0A0AB]">
                    🏢 <span className="whitespace-nowrap">{conn.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#696974] dark:text-[#A0A0AB]">
                    🖥{" "}
                    <span className="whitespace-nowrap">
                      {formatServer(conn.server)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#696974] dark:text-[#A0A0AB]">
                    🌐 <span>{translateEnv(conn.env)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setDeleteTarget(conn)}
                  className="absolute bottom-1.5 right-1.5 text-primary hover:text-red-500 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de eliminar */}
      <DeleteErpConnectionModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        connectionName={deleteTarget?.db}
      />
    </>
  );
}
