"use client";

import { Layers, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function InstanceModal({
  isOpen,
  onClose,
  instances,
  division,
  moduleParam,
  primaryColor,
}) {
  const [expandedGroups, setExpandedGroups] = useState({});
  // ↑ debajo de los imports, dentro del archivo del modal
  const humanize = (s) => {
    if (!s) return "";
    try {
      s = decodeURIComponent(s);
    } catch (_) {}
    return s.replace(/-/g, " ").trim();
  };
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  if (!isOpen) return null;

  const enhancedInstances = instances.map((instance) => ({
    ...instance,
    division: instance.division || division,
    module: instance.module || moduleParam,
  }));

  const groupedInstances = enhancedInstances.reduce((acc, instance) => {
    const key = `${instance.division}-${instance.module}-${instance.idUserCompanyConnection}`;
    if (!acc[key]) {
      acc[key] = {
        division: instance.division,
        module: instance.module,
        idUserCompanyConnection: instance.idUserCompanyConnection,
        instances: [],
      };
    }
    acc[key].instances.push(instance);
    return acc;
  }, {});

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-[#1C1C24] rounded-lg w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <Layers className="w-5 h-5 mr-2" style={{ color: primaryColor }} />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Instancias abiertas
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto space-y-3">
          {Object.entries(groupedInstances).map(([key, group]) => {
            const ip = group.instances[0]?.serverErpDb || "IP desconocida";
            const isExpanded = expandedGroups[key];

            return (
              <div
                key={key}
                className="bg-gray-50 dark:bg-[#252530] rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm"
              >
                <button
                  onClick={() => toggleGroup(key)}
                  className="w-full text-left px-4 py-4 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center flex-wrap gap-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {cap(humanize(group.division))}
                      </span>
                      <span className="text-gray-400 dark:text-gray-600">
                        ›
                      </span>
                      <span className="text-sm text-gray-800 dark:text-white">
                        {cap(humanize(group.module))}
                      </span>
                      <span className="text-sm text-gray-400 dark:text-gray-500 ml-2 italic">
                        conexión:{" "}
                        <span className="text-primary">{formatServer(ip)}</span>
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <span
                        className="flex items-center justify-center w-5 h-5 text-xs text-white rounded-md"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {group.instances.length}
                      </span>
                      <span className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                        Instancias abiertas
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <ul className="px-4 pb-4 space-y-1">
                    {group.instances.map((inst) => (
                      <li
                        key={inst.id}
                        className="text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-[#1c1c24] px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700"
                      >
                        {inst.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
