"use client";

import React from "react";
import clsx from "clsx";

const statusCards = [
  { label: "En tiempo", count: 20, color: "#22c55e" },
  { label: "Por vencer", count: 10, color: "#f97316" },
  { label: "Vencida", count: 7, color: "#ef4444" },
  { label: "Cancelada", count: 5, color: "#6b7280" },
  { label: "Terminada en tiempo", count: 30, color: "#16a34a" },
  { label: "Terminada fuera de tiempo", count: 15, color: "#ec4899" },
  { label: "Interrumpida en tiempo", count: 2, color: "#3b82f6" },
  { label: "Interrumpida fuera tiempo", count: 1, color: "#1e40af" },
];

const CardCalendario = ({ selectedStatuses = new Set(), onToggleStatus }) => {
  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      {statusCards.map((card, index) => {
        const isSelected = selectedStatuses.has(card.label);
        return (
          <div
            key={index}
            className={clsx(
              "cursor-pointer bg-white dark:bg-[#1C1C24] rounded-md px-2 py-1 flex flex-col items-center justify-center text-center border dark:border-[#2C2C38] transition",
              isSelected
                ? "ring-2 ring-primary border-primary dark:ring-primary"
                : "hover:ring-1 hover:ring-primary"
            )}
            onClick={() => onToggleStatus(card.label)}
          >
            <div className="text-[11px] leading-tight text-gray-800 dark:text-gray-200">
              {card.label}
            </div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: card.color }}
              />
              <p className="text-lg font-bold" style={{ color: card.color }}>
                {card.count}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CardCalendario;