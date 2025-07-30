// components/tableros/costos-mantenimiento/DateFilter.jsx
import React from 'react';
import { Calendar } from 'lucide-react';

const DateFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  // Format date for input (YYYY-MM-DD) - avoid timezone issues
  const formatDateForInput = (date) => {
    if (!date) return '';
    
    // Use local date methods to avoid UTC conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // Handle date change and convert to Date object
  const handleStartDateChange = (e) => {
    const value = e.target.value;
    if (value) {
      // Create date in local timezone to avoid UTC conversion issues
      const [year, month, day] = value.split('-').map(Number);
      const date = new Date(year, month - 1, day, 0, 0, 0, 0); // month is 0-indexed
      onStartDateChange(date);
    } else {
      onStartDateChange(null);
    }
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;
    if (value) {
      // Create date in local timezone to avoid UTC conversion issues
      const [year, month, day] = value.split('-').map(Number);
      const date = new Date(year, month - 1, day, 23, 59, 59, 999); // month is 0-indexed
      onEndDateChange(date);
    } else {
      onEndDateChange(null);
    }
  };

  return (
    <div className="flex justify-center mb-6">
      <div className="bg-white dark:bg-[#1C1C24] rounded-lg border border-gray-200 dark:border-[#2C2C38] p-4">
        <div className="flex items-center space-x-6">
          {/* Start Date */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Inicio
            </label>
            <div className="relative">
              <input
                type="date"
                value={formatDateForInput(startDate)}
                onChange={handleStartDateChange}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-lg bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 min-w-[140px]"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Separator */}
          <div className="text-gray-400 dark:text-gray-500">
            —
          </div>

          {/* End Date */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Fin
            </label>
            <div className="relative">
              <input
                type="date"
                value={formatDateForInput(endDate)}
                onChange={handleEndDateChange}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-lg bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 min-w-[140px]"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(startDate || endDate) && (
            <button
              onClick={() => {
                onStartDateChange(null);
                onEndDateChange(null);
              }}
              className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-[#2C2C38] rounded-lg hover:bg-gray-50 dark:hover:bg-[#2C2C38] transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateFilter;