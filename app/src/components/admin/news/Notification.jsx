'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Notification({
  type = 'error',    // 'error', 'success', 'info', 'warning'
  message = '',
  visible = false,
  style = 'inline',  // 'inline', 'toast'
  position = 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
  duration = 4000,   // ms, 0 = stay visible
  onClose = () => {}
}) {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
    let timer;
    if (visible && duration > 0) {
      timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, duration);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible, duration, onClose]);

  if (!isVisible) return null;

  // color mapping with dark variants
  const colors = {
    error: {
      bg: 'bg-red-50 dark:bg-red-900',
      border: 'border-red-300 dark:border-red-700',
      text: 'text-red-700 dark:text-red-300',
      icon: <AlertCircle className="text-red-500 dark:text-red-400" size={20} />
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900',
      border: 'border-green-300 dark:border-green-700',
      text: 'text-green-700 dark:text-green-300',
      icon: <CheckCircle className="text-green-500 dark:text-green-400" size={20} />
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900',
      border: 'border-blue-300 dark:border-blue-700',
      text: 'text-blue-700 dark:text-blue-300',
      icon: <Info className="text-blue-500 dark:text-blue-400" size={20} />
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900',
      border: 'border-yellow-300 dark:border-yellow-700',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: <AlertCircle className="text-yellow-500 dark:text-yellow-400" size={20} />
    }
  };

  const { bg, border, text, icon } = colors[type] || colors.error;

  // adjust toast vertical offset to sit lower
  const positionClasses = {
    'top-right': 'fixed top-20 right-4',
    'top-left':  'fixed top-20 left-4',
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left':  'fixed bottom-4 left-4'
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  if (style === 'inline') {
    return (
      <div className={`${border} ${bg} p-4 my-3 w-full border-l-4 flex items-center justify-between animate-fadeIn relative z-[9999]`}>
        <div className="flex items-center gap-2">
          {icon}
          <span className={text}>{message}</span>
        </div>
        <button onClick={handleClose} className={`${text} hover:text-gray-900 focus:outline-none`}>
          <X size={16} />
        </button>
      </div>
    );
  }

  // toast style
  return (
    <div className={`${positionClasses[position]} z-[9999] animate-slideIn`}>
      <div className={`shadow-lg rounded-lg p-4 min-w-[300px] max-w-md flex items-center justify-between ${border} ${bg}`}>
        <div className="flex items-center gap-2">
          {icon}
          <span className={text}>{message}</span>
        </div>
        <button onClick={handleClose} className={`${text} hover:text-gray-900 focus:outline-none ml-3`}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}