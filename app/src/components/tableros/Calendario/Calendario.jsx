"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Filter,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";

const Calendario = () => {
  const today = new Date();
  const minMonth = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const staticData = [
    {
      OT: "MT1905",
      tipoUnidad: "Tracto",
      NumEco: "802727",
      FechaEntrega: "2022-03-08",
      StatusOrdenTrabajo: "Terminada Fuera de Tiempo",
    },
    {
      OT: "MEX69",
      tipoUnidad: "Tracto",
      NumEco: "802718",
      FechaEntrega: "2021-12-11",
      StatusOrdenTrabajo: "Terminada Fuera de Tiempo",
    },
    {
      OT: "MT21",
      tipoUnidad: "Remolque",
      NumEco: "2136",
      FechaEntrega: "2021-12-02",
      StatusOrdenTrabajo: "Terminada Fuera de Tiempo",
    },
    {
      OT: "MT11",
      tipoUnidad: "Remolque",
      NumEco: "2130",
      FechaEntrega: "2021-12-01",
      StatusOrdenTrabajo: "Terminada Fuera de Tiempo",
    },
    {
      OT: "MT12",
      tipoUnidad: "Remolque",
      NumEco: "2127",
      FechaEntrega: "2021-11-29",
      StatusOrdenTrabajo: "Terminada Fuera de Tiempo",
    },
    {
      OT: "MT14",
      tipoUnidad: "Remolque",
      NumEco: "2179",
      FechaEntrega: "2021-11-25",
      StatusOrdenTrabajo: "Terminada Fuera de Tiempo",
    },
    {
      OT: "MLD7296",
      tipoUnidad: "Remolque",
      NumEco: "2268",
      FechaEntrega: "2021-10-20",
      StatusOrdenTrabajo: "Terminada Fuera de Tiempo",
    },
    // Additional mock data for better visualization
    {
      OT: "MT100",
      tipoUnidad: "Tracto",
      NumEco: "801001",
      FechaEntrega: "2025-06-25",
      StatusOrdenTrabajo: "En tiempo",
    },
    {
      OT: "MT101",
      tipoUnidad: "Tracto",
      NumEco: "801002",
      FechaEntrega: "2025-06-26",
      StatusOrdenTrabajo: "Por vencer",
    },
    {
      OT: "MT102",
      tipoUnidad: "Remolque",
      NumEco: "2001",
      FechaEntrega: "2025-06-27",
      StatusOrdenTrabajo: "Vencida",
    },
    {
      OT: "MT103",
      tipoUnidad: "Tracto",
      NumEco: "801003",
      FechaEntrega: "2025-06-28",
      StatusOrdenTrabajo: "Cancelada",
    },
    {
      OT: "MT104",
      tipoUnidad: "Remolque",
      NumEco: "2002",
      FechaEntrega: "2025-06-29",
      StatusOrdenTrabajo: "Terminada en tiempo",
    },
    {
      OT: "MT105",
      tipoUnidad: "Tracto",
      NumEco: "801004",
      FechaEntrega: "2025-06-30",
      StatusOrdenTrabajo: "Interrumpida en tiempo",
    },
    {
      OT: "MT106",
      tipoUnidad: "Remolque",
      NumEco: "2003",
      FechaEntrega: "2025-07-01",
      StatusOrdenTrabajo: "Interrumpida fuera tiempo",
    },
    {
      OT: "MT107",
      tipoUnidad: "Tracto",
      NumEco: "801005",
      FechaEntrega: "2025-07-15",
      StatusOrdenTrabajo: "En tiempo",
    },
    {
      OT: "MT108",
      tipoUnidad: "Tracto",
      NumEco: "801006",
      FechaEntrega: "2025-07-20",
      StatusOrdenTrabajo: "Por vencer",
    },
    {
      OT: "MT109",
      tipoUnidad: "Remolque",
      NumEco: "2004",
      FechaEntrega: "2025-08-01",
      StatusOrdenTrabajo: "En tiempo",
    },
    {
      OT: "MT110",
      tipoUnidad: "Tracto",
      NumEco: "801007",
      FechaEntrega: "2025-08-15",
      StatusOrdenTrabajo: "Por vencer",
    },
  ];

  // Status configuration
  const statusConfig = {
    "En tiempo": {
      color: "#22c55e",
      bgColor:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      icon: CheckCircle,
      label: "En tiempo",
    },
    "Por vencer": {
      color: "#f97316",
      bgColor:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      icon: AlertTriangle,
      label: "Por vencer",
    },
    Vencida: {
      color: "#ef4444",
      bgColor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      icon: XCircle,
      label: "Vencida",
    },
    Cancelada: {
      color: "#6b7280",
      bgColor: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      icon: XCircle,
      label: "Cancelada",
    },
    "Terminada en tiempo": {
      color: "#16a34a",
      bgColor:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      icon: CheckCircle,
      label: "Terminada en tiempo",
    },
    "Terminada Fuera de Tiempo": {
      color: "#ec4899",
      bgColor:
        "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      icon: Clock,
      label: "Terminada fuera de tiempo",
    },
    "Interrumpida en tiempo": {
      color: "#3b82f6",
      bgColor:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      icon: Pause,
      label: "Interrumpida en tiempo",
    },
    "Interrumpida fuera tiempo": {
      color: "#1e40af",
      bgColor:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      icon: Play,
      label: "Interrumpida fuera tiempo",
    },
  };

  const [selectedStatuses, setSelectedStatuses] = useState(new Set());
  const [viewMode, setViewMode] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 2)),
    end: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  });

  const filteredData = useMemo(() => {
    return staticData.filter((item) => {
      const itemDate = new Date(item.FechaEntrega);
      const isInDateRange =
        itemDate >= dateRange.start && itemDate <= dateRange.end;
      const isStatusSelected =
        selectedStatuses.size === 0 ||
        selectedStatuses.has(item.StatusOrdenTrabajo);
      return isInDateRange && isStatusSelected;
    });
  }, [selectedStatuses, dateRange]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = (firstDay.getDay() + 7) % 7;

    const days = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      const dayData = filteredData.filter(
        (item) => item.FechaEntrega === dateStr
      );
      days.push({ day, data: dayData, date });
    }

    return days;
  };

  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const dayData = filteredData.filter(
        (item) => item.FechaEntrega === dateStr
      );
      weekDays.push({
        day: date.getDate(),
        data: dayData,
        date,
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
      });
    }

    return weekDays;
  };

  const generateDayView = () => {
    const date = currentDate;
    const dateStr = date.toISOString().split("T")[0];
    const dayData = filteredData.filter(
      (item) => item.FechaEntrega === dateStr
    );
    return {
      date,
      data: dayData,
    };
  };

  const calendarDays =
    viewMode === "month" ? generateCalendarDays() : generateWeekDays();

  const navigateCalendar = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(currentDate.getMonth() + direction);
      const newMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      if (
        newMonth.getTime() >= minMonth.getTime() &&
        newMonth.getTime() <= maxMonth.getTime()
      ) {
        setCurrentDate(newDate);
      }
    } else {
      newDate.setDate(currentDate.getDate() + direction * 7);
      const newMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      if (
        newMonth.getTime() >= minMonth.getTime() &&
        newMonth.getTime() <= maxMonth.getTime()
      ) {
        setCurrentDate(newDate);
      }
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const getCalendarTitle = () => {
    if (viewMode === "month") {
      return `${
        monthNames[currentDate.getMonth()]
      } ${currentDate.getFullYear()}`;
    } else {
      const weekDays = generateWeekDays();
      const startDate = weekDays[0].date;
      const endDate = weekDays[6].date;

      if (startDate.getMonth() === endDate.getMonth()) {
        return `${startDate.getDate()} - ${endDate.getDate()} de ${
          monthNames[startDate.getMonth()]
        } ${startDate.getFullYear()}`;
      } else {
        return `${startDate.getDate()} ${
          monthNames[startDate.getMonth()]
        } - ${endDate.getDate()} ${
          monthNames[endDate.getMonth()]
        } ${startDate.getFullYear()}`;
      }
    }
  };

  return (
    <div className="flex font-poppins">
      <div className="flex-1 w-full ">
        <main className="min-h-screen bg-[#F2F6FD] dark:bg-[#13131a] pb-14 px-4 md:px-8 xl:px-10 w-full">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header del calendario */}
            <div className="flex items-center justify-between border border-gray-300 dark:border-[#2C2C38] rounded px-4 py-2 bg-white dark:bg-[#1C1C24]">
              <button
                onClick={goToToday}
                className="px-4 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
              >
                Actual
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateCalendar(-1)}
                  disabled={
                    viewMode === "month" &&
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth() - 1,
                      1
                    ).getTime() < minMonth.getTime()
                  }
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>

                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {getCalendarTitle()}
                </span>

                <button
                  onClick={() => navigateCalendar(1)}
                  disabled={
                    viewMode === "month" &&
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth() + 1,
                      1
                    ).getTime() > maxMonth.getTime()
                  }
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-x-1">
                {["day", "week", "month"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 text-sm border rounded transition-colors ${
                      viewMode === mode
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-black border-gray-300 hover:bg-gray-100 dark:bg-transparent dark:text-white dark:border-white dark:hover:bg-[#2A2A2A]"
                    }`}
                  >
                    {mode === "day"
                      ? "Día"
                      : mode === "week"
                      ? "Semana"
                      : "Mes"}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendario */}
            <div className="bg-white dark:bg-[#1C1C24] border border-gray-300 dark:border-[#2C2C38] rounded p-4">
              {/* Cabecera de días */}
              {viewMode !== "day" && (
                <div className="grid grid-cols-7 text-center text-sm text-gray-500 dark:text-gray-400 font-medium border-b border-gray-300 dark:border-gray-600 mb-2">
                  {["dom", "lun", "mar", "mié", "jue", "vie", "sáb"].map(
                    (d) => (
                      <div key={d} className="py-2 capitalize">
                        {d}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* VISTA MES */}
              {viewMode === "month" && (
                <div className="grid grid-cols-7 gap-[1px] mt-1">
                  {calendarDays.map((dayData, index) => (
                    <div
                      key={index}
                      className={clsx(
                        "h-24 border text-xs p-1 overflow-hidden transition relative bg-white dark:bg-[#1C1C24] hover:bg-blue-100 dark:hover:bg-blue-500",
                        dayData?.date.toDateString() ===
                          new Date().toDateString()
                          ? "ring-2 ring-primary dark:ring-primary border-primary dark:border-primary"
                          : "border-gray-200 dark:border-[#2C2C38]"
                      )}
                    >
                      {dayData && (
                        <>
                          <div className="font-semibold text-[11px] text-gray-800 dark:text-gray-200">
                            {dayData.day}
                          </div>
                          <div className="mt-1 space-y-[2px]">
                            {dayData.data.slice(0, 2).map((ot, otIndex) => {
                              const config =
                                statusConfig[ot.StatusOrdenTrabajo];
                              return (
                                <div
                                  key={otIndex}
                                  className={clsx(
                                    "truncate text-[10px] px-[4px] py-[1px] rounded-sm",
                                    config?.bgColor ||
                                      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                  )}
                                  title={`${ot.OT} - ${ot.StatusOrdenTrabajo}`}
                                >
                                  {ot.OT}
                                </div>
                              );
                            })}
                            {dayData.data.length > 2 && (
                              <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                +{dayData.data.length - 2} más
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* VISTA SEMANA */}
              {viewMode === "week" && (
                <div className="grid grid-cols-7 gap-3 mt-4">
                  {calendarDays.map((dayData, index) => (
                    <div key={index} className="space-y-2">
                      <div
                        className={clsx(
                          "text-center p-3 rounded-lg border relative transition hover:bg-blue-100 dark:hover:bg-blue-500",
                          dayData.date.toDateString() ===
                            new Date().toDateString()
                            ? "ring-2 ring-primary dark:ring-primary border-primary dark:border-primary"
                            : dayData.isCurrentMonth
                            ? "border-gray-200 dark:border-[#2C2C38] bg-gray-50 dark:bg-[#2C2C38]"
                            : "border-gray-100 dark:border-gray-700 bg-gray-25 dark:bg-gray-800"
                        )}
                      >
                        <div
                          className={`text-lg font-semibold ${
                            dayData.isCurrentMonth
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-400 dark:text-gray-600"
                          }`}
                        >
                          {dayData.day}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {monthNames[dayData.date.getMonth()].slice(0, 3)}
                        </div>
                      </div>
                      <div className="space-y-2 min-h-32">
                        {dayData.data.map((ot, otIndex) => {
                          const config = statusConfig[ot.StatusOrdenTrabajo];
                          return (
                            <div
                              key={otIndex}
                              className="p-2 rounded-lg border cursor-pointer hover:shadow-md transition-all duration-200"
                              style={{
                                backgroundColor: `${config.color}15`,
                                borderColor: `${config.color}40`,
                              }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                  {ot.OT}
                                </span>
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: config.color }}
                                />
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {ot.tipoUnidad} {ot.NumEco}
                              </div>
                              <div className="text-xs mt-1">
                                <span
                                  className="px-1 py-0.5 rounded text-white font-medium"
                                  style={{ backgroundColor: config.color }}
                                >
                                  {config.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* VISTA DÍA aa*/}
              {viewMode === "day" && (
                <div
                  className={clsx(
                    "mt-4 p-2 rounded-md transition border",
                    currentDate.toDateString() === new Date().toDateString()
                      ? "ring-2 ring-primary dark:ring-primary border-primary dark:border-primary"
                      : "border-gray-200 dark:border-[#2C2C38]"
                  )}
                >
                  <h2 className="text-md font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {currentDate.toLocaleDateString("es-MX", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                  <div className="space-y-3">
                    {generateDayView().data.length > 0 ? (
                      generateDayView().data.map((ot, idx) => {
                        const config = statusConfig[ot.StatusOrdenTrabajo];
                        return (
                          <div
                            key={idx}
                            className="p-4 border rounded-lg"
                            style={{
                              backgroundColor: `${config.color}15`,
                              borderColor: `${config.color}40`,
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {ot.OT}
                              </h3>
                              <span
                                className="px-2 py-0.5 text-xs text-white rounded"
                                style={{ backgroundColor: config.color }}
                              >
                                {config.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {ot.tipoUnidad} - {ot.NumEco}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No hay órdenes programadas para este día.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Calendario;
