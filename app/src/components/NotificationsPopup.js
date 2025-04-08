'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const notifications = [
  {
    id: 1,
    icon: '/assets/notifications/icon-alerta.svg',
    bgColor: '#ff000019',
    title: 'Actualización de sistema',
    subtitle: 'Nueva actualización de sistema el día...',
  },
  {
    id: 2,
    icon: '/assets/notifications/icon-news.svg',
    bgColor: '#0080ff19',
    title: 'Nuevo artículo',
    subtitle: 'Hay un nuevo artículo en noticias',
  },
  {
    id: 3,
    icon: '/assets/notifications/icon-play.svg',
    bgColor: '#0a910119',
    title: 'Nuevo video',
    subtitle: 'Hay un nuevo video en el centro de ay...',
  },
  {
    id: 4,
    icon: '/assets/notifications/icon-medalla.svg',
    bgColor: '#ff740d19',
    title: 'Tu garantía se actualizó',
    subtitle: 'Se actualizó la garantía de tu licencia',
  },
];

const NotificationsPopup = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    let timers = [];
    if (isOpen) {
      setMounted(true);
      timers.push(setTimeout(() => setShowAnimation(true), 50));
    } else {
      setShowAnimation(false);
      timers.push(setTimeout(() => setMounted(false), 200));
    }
    return () => timers.forEach(clearTimeout);
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Click-outside close */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        className={`fixed top-0 right-0 mt-[110px] mr-4 sm:mr-4 md:mr-36 w-[292px] h-[351px] bg-white rounded-2xl shadow-xl 
          border border-gray-100 z-50 transition-all duration-200
          ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
      >
        <div className="p-5 h-full flex flex-col justify-between">
          {/* Header */}
          <h3 className="text-[14px] leading-[21px] font-medium text-black font-poppins">
            Mis notificaciones
          </h3>

          {/* Notificaciones */}
          <div className="flex flex-col gap-y-[20px] py-2 overflow-auto flex-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 min-h-[36px]"
              >
                <div
                  className="w-9 h-9 flex items-center justify-center rounded-md shrink-0"
                  style={{ backgroundColor: n.bgColor }}
                >
                  <Image
                    src={n.icon}
                    alt="icono"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>

                <div className="flex-1 overflow-hidden">
                  <h4 className="text-[12px] leading-[18px] font-medium text-[#171725] font-poppins truncate">
                    {n.title}
                  </h4>
                  <p className="text-[10px] leading-[15px] text-[#92929d] font-poppins truncate">
                    {n.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-2">
            <button className="w-full border border-gray-300 text-[12px] font-medium text-[#171725] py-2 rounded-lg hover:bg-gray-50 transition font-poppins">
              Ver todas las notificaciones
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPopup;
