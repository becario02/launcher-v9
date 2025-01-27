// src/components/modules/data/menuStructure.js
export const menuStructure = [
    {
      id: 'transacciones',
      name: 'Transacciones',
      items: [
        { id: 'convenios', name: 'Convenios', iconName: 'Handshake' },
        { id: 'tabulador', name: 'Tabulador de tarifas', iconName: 'Calculator' },
        { id: 'admin-proyectos', name: 'Administración de proyectos', iconName: 'ClipboardList' },
        { id: 'ofertas', name: 'Ofertas de Customer', iconName: 'Target' },
        { id: 'planeacion', name: 'Planeación de servicios', iconName: 'Calendar' },
        { id: 'admin-servicios', name: 'Administración de servicios', iconName: 'Settings' },
        { id: 'control', name: 'Control de pedimentos', iconName: 'FileText' },
        { id: 'entrega', name: 'Entrega de mercancía', iconName: 'Package' },
      ]
    },
    {
      id: 'consultas',
      name: 'Consultas',
      items: [
        { id: 'vehiculos', name: 'Vehículos', iconName: 'Truck' },
        { id: 'operadores', name: 'Operadores', iconName: 'User' },
      ]
    },
    {
      id: 'reportes',
      name: 'Reportes',
      items: [
        { id: 'consumo', name: 'Consumo de combustible', iconName: 'Fuel' },
        { id: 'incidencias', name: 'Incidencias vehiculares', iconName: 'Car' },
      ]
    },
  ];
