'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Filter, BarChart3, Clock, AlertTriangle, CheckCircle, XCircle, Pause, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';

const MaintenanceDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Static data based on the provided images
  const staticData = [
    { OT: 'MT1905', tipoUnidad: 'Tracto', NumEco: '802727', FechaEntrega: '2022-03-08', StatusOrdenTrabajo: 'Terminada Fuera de Tiempo' },
    { OT: 'MEX69', tipoUnidad: 'Tracto', NumEco: '802718', FechaEntrega: '2021-12-11', StatusOrdenTrabajo: 'Terminada Fuera de Tiempo' },
    { OT: 'MT21', tipoUnidad: 'Remolque', NumEco: '2136', FechaEntrega: '2021-12-02', StatusOrdenTrabajo: 'Terminada Fuera de Tiempo' },
    { OT: 'MT11', tipoUnidad: 'Remolque', NumEco: '2130', FechaEntrega: '2021-12-01', StatusOrdenTrabajo: 'Terminada Fuera de Tiempo' },
    { OT: 'MT12', tipoUnidad: 'Remolque', NumEco: '2127', FechaEntrega: '2021-11-29', StatusOrdenTrabajo: 'Terminada Fuera de Tiempo' },
    { OT: 'MT14', tipoUnidad: 'Remolque', NumEco: '2179', FechaEntrega: '2021-11-25', StatusOrdenTrabajo: 'Terminada Fuera de Tiempo' },
    { OT: 'MLD7296', tipoUnidad: 'Remolque', NumEco: '2268', FechaEntrega: '2021-10-20', StatusOrdenTrabajo: 'Terminada Fuera de Tiempo' },
    // Additional mock data for better visualization
    { OT: 'MT100', tipoUnidad: 'Tracto', NumEco: '801001', FechaEntrega: '2025-06-25', StatusOrdenTrabajo: 'En tiempo' },
    { OT: 'MT101', tipoUnidad: 'Tracto', NumEco: '801002', FechaEntrega: '2025-06-26', StatusOrdenTrabajo: 'Por vencer' },
    { OT: 'MT102', tipoUnidad: 'Remolque', NumEco: '2001', FechaEntrega: '2025-06-27', StatusOrdenTrabajo: 'Vencida' },
    { OT: 'MT103', tipoUnidad: 'Tracto', NumEco: '801003', FechaEntrega: '2025-06-28', StatusOrdenTrabajo: 'Cancelada' },
    { OT: 'MT104', tipoUnidad: 'Remolque', NumEco: '2002', FechaEntrega: '2025-06-29', StatusOrdenTrabajo: 'Terminada en tiempo' },
    { OT: 'MT105', tipoUnidad: 'Tracto', NumEco: '801004', FechaEntrega: '2025-06-30', StatusOrdenTrabajo: 'Interrumpida en tiempo' },
    { OT: 'MT106', tipoUnidad: 'Remolque', NumEco: '2003', FechaEntrega: '2025-07-01', StatusOrdenTrabajo: 'Interrumpida fuera tiempo' },
    { OT: 'MT107', tipoUnidad: 'Tracto', NumEco: '801005', FechaEntrega: '2025-07-15', StatusOrdenTrabajo: 'En tiempo' },
    { OT: 'MT108', tipoUnidad: 'Tracto', NumEco: '801006', FechaEntrega: '2025-07-20', StatusOrdenTrabajo: 'Por vencer' },
    { OT: 'MT109', tipoUnidad: 'Remolque', NumEco: '2004', FechaEntrega: '2025-08-01', StatusOrdenTrabajo: 'En tiempo' },
    { OT: 'MT110', tipoUnidad: 'Tracto', NumEco: '801007', FechaEntrega: '2025-08-15', StatusOrdenTrabajo: 'Por vencer' }
  ];

  // Status configuration
  const statusConfig = {
    'En tiempo': { color: '#22c55e', bgColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle, label: 'En tiempo' },
    'Por vencer': { color: '#f97316', bgColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', icon: AlertTriangle, label: 'Por vencer' },
    'Vencida': { color: '#ef4444', bgColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: XCircle, label: 'Vencida' },
    'Cancelada': { color: '#6b7280', bgColor: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', icon: XCircle, label: 'Cancelada' },
    'Terminada en tiempo': { color: '#16a34a', bgColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle, label: 'Terminada en tiempo' },
    'Terminada Fuera de Tiempo': { color: '#ec4899', bgColor: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300', icon: Clock, label: 'Terminada fuera de tiempo' },
    'Interrumpida en tiempo': { color: '#3b82f6', bgColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: Pause, label: 'Interrumpida en tiempo' },
    'Interrumpida fuera tiempo': { color: '#1e40af', bgColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: Play, label: 'Interrumpida fuera tiempo' }
  };

  const [selectedStatuses, setSelectedStatuses] = useState(new Set());
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 2)),
    end: new Date(new Date().setMonth(new Date().getMonth() + 1))
  });

  // Filter data based on selected statuses and date range
  const filteredData = useMemo(() => {
    return staticData.filter(item => {
      const itemDate = new Date(item.FechaEntrega);
      const isInDateRange = itemDate >= dateRange.start && itemDate <= dateRange.end;
      const isStatusSelected = selectedStatuses.size === 0 || selectedStatuses.has(item.StatusOrdenTrabajo);
      return isInDateRange && isStatusSelected;
    });
  }, [selectedStatuses, dateRange]);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts = {};
    Object.keys(statusConfig).forEach(status => {
      counts[status] = filteredData.filter(item => item.StatusOrdenTrabajo === status).length;
    });
    return counts;
  }, [filteredData]);

  // Toggle status filter
  const toggleStatusFilter = (status) => {
    const newSelected = new Set(selectedStatuses);
    if (newSelected.has(status)) {
      newSelected.delete(status);
    } else {
      newSelected.add(status);
    }
    setSelectedStatuses(newSelected);
  };

  // Generate calendar days for monthly view
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = filteredData.filter(item => item.FechaEntrega === dateStr);
      days.push({ day, data: dayData, date: new Date(year, month, day) });
    }
    
    return days;
  };

  // Generate week days for weekly view
  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // Adjust to start on Sunday
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const dayData = filteredData.filter(item => item.FechaEntrega === dateStr);
      weekDays.push({ 
        day: date.getDate(), 
        data: dayData, 
        date: date,
        isCurrentMonth: date.getMonth() === currentDate.getMonth()
      });
    }
    
    return weekDays;
  };

  const calendarDays = viewMode === 'month' ? generateCalendarDays() : generateWeekDays();
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const navigateCalendar = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else {
      newDate.setDate(newDate.getDate() + (direction * 7));
    }
    setCurrentDate(newDate);
  };

  const getCalendarTitle = () => {
    if (viewMode === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else {
      const weekDays = generateWeekDays();
      const startDate = weekDays[0].date;
      const endDate = weekDays[6].date;
      
      if (startDate.getMonth() === endDate.getMonth()) {
        return `${startDate.getDate()} - ${endDate.getDate()} de ${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`;
      } else {
        return `${startDate.getDate()} ${monthNames[startDate.getMonth()]} - ${endDate.getDate()} ${monthNames[endDate.getMonth()]} ${startDate.getFullYear()}`;
      }
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="flex font-poppins">
      {/* Sidebar - Fixed on desktop */}
      <div className="hidden md:block fixed z-10 h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="relative z-50 w-60 h-full bg-white dark:bg-[#1C1C24] shadow-lg">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 w-full md:pl-60">
        {/* Navbar */}
        <Navbar className="sticky top-0 z-30" onMenuClick={() => setSidebarOpen(true)} />

        {/* Main content */}
        <main className="min-h-screen bg-[#F2F6FD] dark:bg-[#13131a] pt-14 pb-14 px-4 md:px-8 xl:px-10 w-full">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" style={{ color: primaryColor }} />
                  <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
                    Órdenes de Trabajo - Programa de Mantenimiento
                  </h1>
                </div>
                <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
                  Seguimiento y control de órdenes de trabajo programadas con visualización de calendario.
                </p>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">Filtros de Fecha:</span>
                  <input
                    type="date"
                    value={dateRange.start.toISOString().split('T')[0]}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                    className="px-3 py-1 border border-gray-300 dark:border-[#2C2C38] rounded-md text-sm bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white"
                  />
                  <span className="text-gray-500 dark:text-gray-400">a</span>
                  <input
                    type="date"
                    value={dateRange.end.toISOString().split('T')[0]}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                    className="px-3 py-1 border border-gray-300 dark:border-[#2C2C38] rounded-md text-sm bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      viewMode === 'month' 
                        ? 'text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                    style={viewMode === 'month' ? { backgroundColor: primaryColor } : {}}
                  >
                    Mensual
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      viewMode === 'week' 
                        ? 'text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                    style={viewMode === 'week' ? { backgroundColor: primaryColor } : {}}
                  >
                    Semanal
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Panel - Charts and Filters */}
              <div className="lg:col-span-4 space-y-6">
                {/* Status Summary Chart */}
                <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumen de Estatus</h3>
                  <div className="space-y-3">
                    {Object.entries(statusCounts).map(([status, count]) => {
                      const config = statusConfig[status];
                      const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: config.color }}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{config.label}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  backgroundColor: config.color,
                                  width: `${percentage}%`
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white w-6">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status Filter Cards */}
                <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filtros por Estatus</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(statusCounts).map(([status, count]) => {
                      const config = statusConfig[status];
                      const Icon = config.icon;
                      const isSelected = selectedStatuses.has(status);
                      
                      return (
                        <button
                          key={status}
                          onClick={() => toggleStatusFilter(status)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
                              : 'border-gray-200 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="p-2 rounded-full"
                                style={{ backgroundColor: `${config.color}20` }}
                              >
                                <Icon 
                                  className="h-4 w-4"
                                  style={{ color: config.color }}
                                />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{config.label}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{count} órdenes</p>
                              </div>
                            </div>
                            <div 
                              className="text-2xl font-bold"
                              style={{ color: config.color }}
                            >
                              {count}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Panel - Calendar */}
              <div className="lg:col-span-8">
                <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg">
                  {/* Calendar Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-[#2C2C38]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {getCalendarTitle()}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigateCalendar(-1)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                          title={viewMode === 'month' ? 'Mes anterior' : 'Semana anterior'}
                        >
                          <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={goToToday}
                          className="px-3 py-1 text-sm text-white rounded-md hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Hoy
                        </button>
                        <button
                          onClick={() => navigateCalendar(1)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                          title={viewMode === 'month' ? 'Mes siguiente' : 'Semana siguiente'}
                        >
                          <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="p-6">
                    {/* Days of week header */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                        <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar days */}
                    {viewMode === 'month' ? (
                      // Monthly View
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((dayData, index) => (
                          <div key={index} className="min-h-24 border border-gray-200 dark:border-[#2C2C38] rounded-md p-1 bg-gray-50 dark:bg-[#2C2C38]">
                            {dayData && (
                              <>
                                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                  {dayData.day}
                                </div>
                                <div className="space-y-1">
                                  {dayData.data.slice(0, 3).map((ot, otIndex) => {
                                    const config = statusConfig[ot.StatusOrdenTrabajo];
                                    return (
                                      <div
                                        key={otIndex}
                                        className="text-xs px-1 py-0.5 rounded text-white font-medium cursor-pointer hover:opacity-80 transition-opacity"
                                        style={{ backgroundColor: config.color }}
                                        title={`${ot.OT} - ${ot.StatusOrdenTrabajo} - ${ot.tipoUnidad} ${ot.NumEco}`}
                                      >
                                        {ot.OT}
                                      </div>
                                    );
                                  })}
                                  {dayData.data.length > 3 && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                                      +{dayData.data.length - 3} más
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Weekly View
                      <div className="grid grid-cols-7 gap-3">
                        {calendarDays.map((dayData, index) => (
                          <div key={index} className="space-y-2">
                            <div className={`text-center p-3 rounded-lg border ${
                              dayData.isCurrentMonth 
                                ? 'border-gray-200 dark:border-[#2C2C38] bg-gray-50 dark:bg-[#2C2C38]' 
                                : 'border-gray-100 dark:border-gray-700 bg-gray-25 dark:bg-gray-800'
                            }`}>
                              <div className={`text-lg font-semibold ${
                                dayData.isCurrentMonth 
                                  ? 'text-gray-900 dark:text-white' 
                                  : 'text-gray-400 dark:text-gray-600'
                              }`}>
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
                                      borderColor: `${config.color}40`
                                    }}
                                    title={`${ot.OT} - ${ot.StatusOrdenTrabajo} - ${ot.tipoUnidad} ${ot.NumEco}`}
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;