'use client';

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

const NotificationsPanel = () => {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-md h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] leading-[24px] md:text-[14px] md:leading-[21px] font-medium text-black font-poppins">
          Mis notificaciones
        </h3>
        <button className="text-[14px] leading-[20px] md:text-[12px] md:leading-[18px] font-medium text-black hover:underline font-poppins">
          Ver más
        </button>
      </div>

      {/* Lista de notificaciones con espaciado adaptativo */}
      <div className="flex flex-col justify-between flex-1 gap-4 md:gap-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="flex items-start gap-4 md:gap-3 min-h-[64px] md:min-h-[48px]"
          >
            <div
              className="w-[36px] h-[36px] md:w-[28px] md:h-[28px] flex items-center justify-center rounded-md shrink-0"
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
              <h4 className="text-[15px] leading-[22px] md:text-[12px] md:leading-[18px] font-medium text-[#171725] font-poppins truncate">
                {n.title}
              </h4>
              <p className="text-[13px] leading-[19px] md:text-[10px] md:leading-[15px] text-[#92929d] font-poppins truncate">
                {n.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NotificationsPanel;
