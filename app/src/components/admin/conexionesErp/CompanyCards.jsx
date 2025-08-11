"use client";

import React, { useEffect, useState } from "react";
import AssignConnectionModal from "./AssignConnectionModal";

export default function CompanySlider({
  companies = [],
  users,
  handleAssign,
  loading,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [assigningConnection, setAssigningConnection] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const total = companies.length;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const showPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const showNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const getOffsetIndex = (index) => {
    const diff = index - currentIndex;
    if (diff === 0) return 0;
    if (diff === -1 || diff === total - 1) return -1;
    if (diff === 1 || diff === -(total - 1)) return 1;
    if (diff === -2 || diff === total - 2) return -2;
    if (diff === 2 || diff === -(total - 2)) return 2;
    return null;
  };

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

  const handleSelectConnection = (conn) => {
    setSelectedConnection(conn);
  };

  if (loading) {
    return (
      <div className="py-10 flex justify-center items-center w-full">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="text-center text-[#92929D] dark:text-[#A0A0AB] py-10">
        🧐 No hay empresas disponibles para mostrar.
      </div>
    );
  }

  const selectedCompany = companies[currentIndex];

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
    <>
      <div className="w-full flex flex-col items-center gap-6 min-h-[90vh]">
        {/* Slider */}
        <div className="relative w-[500px] h-60 flex items-center justify-center overflow-hidden mx-auto">
          <div className="relative w-full h-full flex items-center justify-center">
            {companies.map((company, index) => {
              const offset = getOffsetIndex(index);
              if (offset === null) return null;

              let style = "";
              if (offset === 0) {
                style = "z-20 scale-100 opacity-100 blur-0 rotate-0";
              } else if (offset === -1) {
                style =
                  "z-10 -translate-x-52 scale-90 opacity-90 blur-[0.5px] rotate-y-[6deg]";
              } else if (offset === 1) {
                style =
                  "z-10 translate-x-52 scale-90 opacity-90 blur-[0.5px] -rotate-y-[6deg]";
              } else if (offset === -2) {
                style =
                  "z-0 -translate-x-80 scale-80 opacity-60 blur-[1px] rotate-y-[8deg]";
              } else if (offset === 2) {
                style =
                  "z-0 translate-x-80 scale-80 opacity-60 blur-[1px] -rotate-y-[8deg]";
              }

              return (
                <div
                  key={company.id}
                  className={`absolute transition-all duration-500 ease-in-out transform ${style}`}
                >
                  <div className="bg-white dark:bg-[#1c1c24] border border-[#E6E8EC] dark:border-[#2C2C38] p-6 rounded-xl text-center shadow-md w-64">
                    <div className="text-[#0080FF] text-3xl mb-2">🏢</div>
                    <div className="text-lg font-semibold text-[#171725] dark:text-white truncate">
                      {company.name || "Nombre no disponible"}
                    </div>
                    <div className="text-sm text-[#696974] dark:text-[#A0A0AB]">
                      <span className="text-[#A0A0AB] text-xs">
                        {company.availableConnections.length} conexiones
                        disponibles
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Flechas */}
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

        {/* Conexiones pequeñas */}
        <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-4">
          {selectedCompany?.availableConnections?.length > 0 ? (
            selectedCompany.availableConnections.map((conn) => (
              <div
                key={conn.id}
                className="relative group bg-[#F9FAFB] dark:bg-[#2C2C38] px-4 py-3 rounded border border-[#E6E8EC] dark:border-[#353542] text-sm hover:shadow transition-all duration-200 min-h-[110px] cursor-pointer"
              >
                <div
                  onClick={() => handleSelectConnection(conn)}
                  className="space-y-1 pb-6"
                >
                  <p className="font-semibold text-[#171725] dark:text-white truncate">
                    📂 {conn.name || "-"}
                  </p>
                  <p className="text-xs text-[#696974] dark:text-[#A0A0AB]">
                    🖥️ {formatServer(conn.server) || "-"}
                  </p>
                  <p className="text-xs text-[#696974] dark:text-[#A0A0AB]">
                    🌐 {translateEnvironment(conn.environment)}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setAssigningConnection({
                      ...conn,
                      companyIdentifier: selectedCompany.companyIdentifier,
                    });
                    setShowAssignModal(true);
                  }}
                  className="absolute bottom-2 right-2 text-primary text-xs font-medium flex items-center gap-1"
                >
                  <span>Asignar</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-[#92929D] dark:text-[#A0A0AB] py-6">
              🛑 Esta empresa no tiene conexiones disponibles.
            </div>
          )}
        </div>
      </div>

      {showAssignModal && (
        <AssignConnectionModal
          isOpen={showAssignModal}
          users={users}
          connection={assigningConnection}
          onAssign={async (userIds, connection) => {
            await handleAssign(userIds, connection);
            setShowAssignModal(false);
          }}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </>
  );
}
