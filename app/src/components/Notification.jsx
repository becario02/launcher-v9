'use client';

import { useState, useEffect } from 'react';

export default function Notification({
  type = 'success', // 'success' o 'error'
  message = '',
  visible = false,
  duration = 3000,
  style = 'inline', // 'inline' o 'toast'
  onClose = () => {},
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      requestAnimationFrame(() => setIsVisible(true));

      let timer;
      if (duration > 0) {
        timer = setTimeout(() => {
          handleClose();
        }, duration);
      }
      return () => clearTimeout(timer);
    } else {
      handleClose();
    }
  }, [visible, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShouldRender(false);
      onClose();
    }, 300);
  };

  if (!shouldRender) return null;

  // Colores personalizados por tipo
  const colors = {
    success: {
      border: '#0a9101',
      bg: '#edffec',
      text: '#0a9101',
    },
    error: {
      border: 'red',
      bg: '#ffecec',
      text: 'red',
    },
  };

  const current = colors[type] || colors.success;

  // Icono personalizado según tipo
  const getIcon = () => {
    if (type === 'success') {
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
            stroke={current.text}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            stroke={current.text}
            strokeWidth="2"
            strokeLinejoin="round"
            d="M9 9.5h.01v.01H9zM15 9.5h.01v.01H15z"
          />
          <path
            d="M15.465 14A3.998 3.998 0 0 1 12 16a3.998 3.998 0 0 1-3.465-2"
            stroke={current.text}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    } else if (type === 'error') {
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
            stroke={current.text}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            stroke={current.text}
            strokeWidth="3"
            strokeLinejoin="round"
            d="M9 9.5h.01v.01H9zM15 9.5h.01v.01H15z"
          />
          <path
            d="M8.535 16A3.998 3.998 0 0 1 12 14c1.48 0 2.773.804 3.465 2"
            stroke={current.text}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
  };

  // ---------- INLINE ----------
  if (style === 'inline') {
    return (
      <div
        style={{
          border: `1px solid ${current.border}`,
          backgroundColor: current.bg,
          color: current.text,
        }}
        className={`flex items-center gap-3 p-4 rounded-[10px] transition-all duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {getIcon()}
        <h4
          style={{
            fontFamily: 'Poppins',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          {message}
        </h4>
      </div>
    );
  }

  // ---------- TOAST ----------
  return (
    <div
      style={{
        position: 'fixed',
        top: '100px', // aquí bajo la notificación para que no tape navbar
        right: '20px',
        zIndex: 9999,
        border: `1px solid ${current.border}`,
        backgroundColor: current.bg,
        color: current.text,
      }}
      className={`flex items-center gap-3 p-4 rounded-[10px] shadow-md transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      {getIcon()}
      <h4
        style={{
          fontFamily: 'Poppins',
          fontSize: '12px',
          fontWeight: 500,
        }}
      >
        {message}
      </h4>
    </div>
  );
}