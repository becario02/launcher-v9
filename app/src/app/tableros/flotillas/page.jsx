'use client';

import React, { useState, useEffect, useRef } from 'react';
import FleetHeader from '@/components/tableros/flotillas/FleetHeader';
import FleetSidebar from '@/components/tableros/flotillas/FleetSidebar';
import FleetMap from '@/components/tableros/flotillas/FleetMap';
import SettingsModal from '@/components/tableros/flotillas/SettingsModal';

const FleetLocationPage = () => {
  // Estados principales
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updateInterval, setUpdateInterval] = useState(30);
  const [showSettings, setShowSettings] = useState(false);
  
  // Ref para acceder a métodos del mapa
  const mapMethodsRef = useRef(null);

  // Static data based on the provided image
  const fleetData = [
    {
      NumEco: '802610',
      StatusMantto: 'Vencido',
      Kilometrosporvencerovencido: '1000',
      FechaEstimadaLlegada: null,
      TerminalDestino: 'NLD',
      latitud: 4.7110,
      Longitud: -74.0721,
      Posicion: 'PATIO TEPO'
    },
    {
      NumEco: '802613',
      StatusMantto: 'Vencido',
      Kilometrosporvencerovencido: '1000',
      FechaEstimadaLlegada: null,
      TerminalDestino: 'MEX',
      latitud: 4.6097,
      Longitud: -74.0817,
      Posicion: '0.896 km de TEPOTZOTLAN'
    },
    {
      NumEco: '802680',
      StatusMantto: 'Vencido',
      Kilometrosporvencerovencido: '1000',
      FechaEstimadaLlegada: null,
      TerminalDestino: 'MEX',
      latitud: 4.5981,
      Longitud: -74.0758,
      Posicion: '2.171 km de EL FRANC+S, Tama'
    },
    {
      NumEco: '802700',
      StatusMantto: 'Vencido',
      Kilometrosporvencerovencido: '1000',
      FechaEstimadaLlegada: null,
      TerminalDestino: 'MEX',
      latitud: 4.7297,
      Longitud: -74.0659,
      Posicion: '0.899 km de TEPOTZOTLAN'
    },
    {
      NumEco: '802702',
      StatusMantto: 'Vencido',
      Kilometrosporvencerovencido: '1000',
      FechaEstimadaLlegada: null,
      TerminalDestino: 'NLD',
      latitud: 4.6482,
      Longitud: -74.0731,
      Posicion: '0.897 km de NORIA DEL REFUGIO'
    },
    {
      NumEco: '802705',
      StatusMantto: 'Por Vencer',
      Kilometrosporvencerovencido: '1000',
      FechaEstimadaLlegada: null,
      TerminalDestino: 'NLD',
      latitud: 4.5953,
      Longitud: -74.0834,
      Posicion: '0.533 km de PATIO NUEVO LAREDO'
    },
    {
      NumEco: '802709',
      StatusMantto: 'Por Vencer',
      Kilometrosporvencerovencido: '1000',
      FechaEstimadaLlegada: null,
      TerminalDestino: 'MTY',
      latitud: 4.6789,
      Longitud: -74.0492,
      Posicion: '3.006 km de EL GRAN CHAPARRAL NL'
    },
    {
      NumEco: '802711',
      StatusMantto: 'Realizado',
      Kilometrosporvencerovencido: '1000',
      FechaEstimadaLlegada: null,
      TerminalDestino: 'MTY',
      latitud: 4.6234,
      Longitud: -74.0912,
      Posicion: '1.699 km de EL DIQUE (EL VIEJO), NL'
    }
  ];

  // Filtrar datos basado en búsqueda y filtro de estado
  const filteredData = React.useMemo(() => {
    return fleetData.filter(unit => {
      const matchesSearch = unit.NumEco.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || unit.StatusMantto === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  // Manejar selección de unidad desde el sidebar
  const handleUnitSelect = React.useCallback((unit) => {
    setSelectedUnit(unit);
    // Centrar mapa en la unidad seleccionada
    if (mapMethodsRef.current && mapMethodsRef.current.centerOnUnit) {
      mapMethodsRef.current.centerOnUnit(unit);
    }
  }, []);

  // Manejar selección de unidad desde el mapa
  const handleMapUnitSelect = React.useCallback((unit) => {
    setSelectedUnit(unit);
  }, []);

  // Manejar cuando el mapa esté listo
  const handleMapReady = React.useCallback((mapMethods) => {
    mapMethodsRef.current = mapMethods;
  }, []);

  // Manejar apertura del modal de configuración
  const handleSettingsClick = React.useCallback(() => {
    setShowSettings(true);
  }, []);

  // Manejar cierre del modal de configuración
  const handleSettingsClose = React.useCallback(() => {
    setShowSettings(false);
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing fleet data...');
      // Aquí iría la lógica para refrescar los datos desde la API
    }, updateInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return (
    <>
      {/* Header */}
      <FleetHeader />

      {/* Content Area */}
      <div className="h-[calc(100vh-160px)] flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <FleetSidebar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          filteredData={filteredData}
          selectedUnit={selectedUnit}
          onUnitSelect={handleUnitSelect}
          onSettingsClick={handleSettingsClick}
        />

        {/* Map */}
        <FleetMap
          fleetData={fleetData}
          filteredData={filteredData}
          onUnitSelect={handleMapUnitSelect}
          onMapReady={handleMapReady}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={handleSettingsClose}
        updateInterval={updateInterval}
        setUpdateInterval={setUpdateInterval}
      />
    </>
  );
};

export default FleetLocationPage;