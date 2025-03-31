'use client';

const notifications = [
  {
    id: 1,
    message: 'Lorem ipsum placerat mi tellus non',
    time: 'Hace 23 min',
  },
  {
    id: 2,
    message: 'Lorem ipsum placerat mi tellus non',
    time: 'Hace 23 min',
  },
  {
    id: 3,
    message: 'Lorem ipsum placerat mi tellus non',
    time: 'Hace 23 min',
  },
  {
    id: 4,
    message: 'Lorem ipsum placerat mi tellus non',
    time: 'Hace 23 min',
  },
];

const NotificationsPanel = () => {
  return (
    <section className="bg-white border border-gray-200 rounded-md p-4 h-full flex flex-col shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">
          Mis notificaciones
        </h2>
        <button className="text-xs text-gray-500 hover:underline">Ver todo</button>
      </div>

      {/* Notification list */}
      <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="flex items-start gap-2 text-xs text-gray-700 bg-gray-100 px-3 py-2.5 rounded-md hover:bg-gray-200 transition-colors"
          >
            <div className="w-2.5 h-2.5 mt-1 rounded-full bg-black shrink-0" />
            <div className="flex-1">
              <p className="leading-tight">{n.message}</p>
              <span className="text-[10px] text-gray-400">{n.time}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NotificationsPanel;
