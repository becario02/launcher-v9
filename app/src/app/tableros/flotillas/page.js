'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Settings, MapPin, Clock, Truck, Menu, Filter } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';

const FleetLocationView = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updateInterval, setUpdateInterval] = useState(30);
  const [showSettings, setShowSettings] = useState(false);
  const markersRef = useRef([]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Vencido': return '#DC2626';
      case 'Por Vencer': return '#F59E0B';
      case 'Realizado': return '#10B981';
      case 'No Requiere': return '#6B7280';
      default: return '#3B82F6';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'Vencido': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Por Vencer': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Realizado': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'No Requiere': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  const filteredData = React.useMemo(() => {
    return fleetData.filter(unit => {
      const matchesSearch = unit.NumEco.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || unit.StatusMantto === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const initializeMap = () => {
    if (!window.google || !window.google.maps || !mapRef.current) return;
    if (map) return;

    const googleMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 4.6482, lng: -74.0731 },
      zoom: 11,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      styles: isDark ? [
        {
          elementType: 'geometry',
          stylers: [{ color: '#242f3e' }]
        },
        {
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#242f3e' }]
        },
        {
          elementType: 'labels.text.fill',
          stylers: [{ color: '#746855' }]
        }
      ] : []
    });

    setMap(googleMap);
    createMarkers(googleMap, fleetData);
  };

  const createMarkers = React.useCallback((googleMap, data) => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    const newMarkers = data.map(unit => {
      const marker = new window.google.maps.Marker({
        position: { lat: unit.latitud, lng: unit.Longitud },
        map: googleMap,
        title: `${unit.NumEco} - ${unit.StatusMantto}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getStatusColor(unit.StatusMantto),
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3 ${isDark ? 'dark' : ''}">
            <div class="bg-white dark:bg-gray-800 rounded-lg">
              <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2">Unidad ${unit.NumEco}</h3>
              <div class="space-y-1 text-sm">
                <p class="text-gray-700 dark:text-gray-300"><strong>Estado:</strong> ${unit.StatusMantto}</p>
                <p class="text-gray-700 dark:text-gray-300"><strong>Posición:</strong> ${unit.Posicion}</p>
                <p class="text-gray-700 dark:text-gray-300"><strong>Destino:</strong> ${unit.TerminalDestino}</p>
                <p class="text-gray-700 dark:text-gray-300"><strong>Km por vencer:</strong> ${unit.Kilometrosporvencerovencido}</p>
              </div>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(googleMap, marker);
        setSelectedUnit(unit);
      });

      return marker;
    });

    markersRef.current = newMarkers;
  }, [isDark]);

  const centerOnUnit = React.useCallback((unit) => {
    if (map) {
      map.setCenter({ lat: unit.latitud, lng: unit.Longitud });
      map.setZoom(15);
      setSelectedUnit(unit);
    }
  }, [map]);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        if (window.google && window.google.maps) {
          initializeMap();
        } else {
          existingScript.addEventListener('load', initializeMap);
        }
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA3-GWkfDQ03ia3DAwhcKuocmOMzRf6Rjs&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
    };
  }, []);

  useEffect(() => {
    if (map) {
      createMarkers(map, filteredData);
    }
  }, [map, filteredData, createMarkers]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing fleet data...');
    }, updateInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [updateInterval]);

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
        <main className="min-h-screen bg-[#F2F6FD] dark:bg-[#13131a] pt-14 w-full">
          <div className="h-[calc(100vh-56px)] flex flex-col">
            {/* Header */}
            <div className="px-4 md:px-8 xl:px-10 py-6 bg-white dark:bg-[#1C1C24] border-b border-gray-200 dark:border-[#2C2C38]">
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6" style={{ color: primaryColor }} />
                <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
                  Ubicación de la Flotilla
                </h1>
              </div>
              <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
                Visualización geográfica en tiempo real del estatus de mantenimiento de la flotilla.
              </p>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar with units */}
              <div className="w-80 bg-white dark:bg-[#1C1C24] border-r border-gray-200 dark:border-[#2C2C38] flex flex-col">
                {/* Controls Section */}
                <div className="p-4 border-b border-gray-200 dark:border-[#2C2C38]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h2>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Configuración de actualización"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar por número económico..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary dark:focus:border-primary"
                        style={{ '--tw-ring-color': primaryColor }}
                      />
                    </div>
                    
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary dark:focus:border-primary"
                      style={{ '--tw-ring-color': primaryColor }}
                    >
                      <option value="ALL">Todos los estados</option>
                      <option value="Vencido">Vencido</option>
                      <option value="Por Vencer">Por Vencer</option>
                      <option value="Realizado">Realizado</option>
                      <option value="No Requiere">No Requiere</option>
                    </select>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 border-b border-gray-200 dark:border-[#2C2C38] bg-gray-50 dark:bg-[#2C2C38]">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{filteredData.length}</div>
                      <div className="text-gray-600 dark:text-gray-400">Total unidades</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {filteredData.filter(u => u.StatusMantto === 'Vencido').length}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">Vencidas</div>
                    </div>
                  </div>
                </div>

                {/* Unit Cards */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {filteredData.map((unit) => (
                    <div
                      key={unit.NumEco}
                      onClick={() => centerOnUnit(unit)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedUnit?.NumEco === unit.NumEco
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                          : 'border-gray-200 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <span className="font-semibold text-gray-900 dark:text-white">{unit.NumEco}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(unit.StatusMantto)}`}>
                          {unit.StatusMantto}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Tipo:</span>
                          <span className="font-medium text-gray-900 dark:text-white">TRACTOR</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Destino:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{unit.TerminalDestino}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Km por vencer:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{unit.Kilometrosporvencerovencido}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{unit.Posicion}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map Container */}
              <div className="flex-1 relative">
                <div ref={mapRef} className="w-full h-full" />
                
                {/* Map Loading State */}
                {!map && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2" style={{ borderColor: primaryColor }}></div>
                      <p className="text-gray-600 dark:text-gray-400">Cargando mapa...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#1C1C24] rounded-lg p-6 w-96 mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuración de Actualización</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Intervalo de actualización (minutos)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="1440"
                    value={updateInterval}
                    onChange={(e) => setUpdateInterval(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-lg bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    style={{ '--tw-ring-color': primaryColor }}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Rango: 5 minutos - 1440 minutos (24 horas)
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Próxima actualización en {updateInterval} minutos</span>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                  style={{ backgroundColor: primaryColor }}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FleetLocationView;