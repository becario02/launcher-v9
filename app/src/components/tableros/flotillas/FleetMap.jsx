import React, { useRef, useState, useEffect, useCallback } from 'react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';
import { useTokenManager } from '@/hooks/useTokenManager';

const FleetMap = ({ fleetData, filteredData, onUnitSelect, onMapReady, isLoading = false }) => {
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState(null);
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(true);
  const [apiKeyError, setApiKeyError] = useState(null);
  const markersRef = useRef([]);
  const currentInfoWindowRef = useRef(null); // Reference to currently open InfoWindow

  const { tokenizedRequest, isProcessingTokens, tokenError } = useTokenManager();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Vencido': return '#DC2626';
      case 'Por Vencer': return '#F59E0B';
      case 'Realizado': return '#10B981';
      case 'No Requiere': return '#6B7280';
      default: return '#3B82F6';
    }
  };

  const centerOnUnit = useCallback((unit) => {
    if (map && unit.latitud !== 0 && unit.Longitud !== 0) {
      map.setCenter({ lat: unit.latitud, lng: unit.Longitud });
      map.setZoom(15);
    }
  }, [map]);

  // Fetch Google Maps API key from backend
  const fetchGoogleMapsApiKey = async () => {
    try {
      setIsLoadingApiKey(true);
      setApiKeyError(null);

      const result = await tokenizedRequest('/mserpservice/api/tableros/google-maps-api-key', {
        method: 'GET'
      });

      if (result.statusCode === '200' && result.data) {
        setGoogleMapsApiKey(result.data);
        console.log('Google Maps API key obtained successfully');
      } else {
        throw new Error(result.message || 'Failed to get Google Maps API key');
      }
    } catch (err) {
      console.error('Error fetching Google Maps API key:', err);
      setApiKeyError(err.message);
      
      // Fallback to environment variable if available
      const fallbackKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (fallbackKey) {
        console.log('Using fallback Google Maps API key from environment');
        setGoogleMapsApiKey(fallbackKey);
      }
    } finally {
      setIsLoadingApiKey(false);
    }
  };

  const closeCurrentInfoWindow = () => {
    if (currentInfoWindowRef.current) {
      currentInfoWindowRef.current.close();
      currentInfoWindowRef.current = null;
    }
  };

  const initializeMap = () => {
    if (!window.google || !window.google.maps || !mapRef.current) return;
    if (map) return;

    // Default center (Mexico City area)
    const defaultCenter = { lat: 19.4326, lng: -99.1332 };

    const googleMap = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 6,
      mapTypeControl: false,
      streetViewControl: false,
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

    // Close InfoWindow when clicking on map
    googleMap.addListener('click', () => {
      closeCurrentInfoWindow();
    });

    setMap(googleMap);
    if (fleetData.length > 0) {
      createMarkers(googleMap, fleetData);
    }
  };

  const createMarkers = useCallback((googleMap, data) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Close any open InfoWindow
    closeCurrentInfoWindow();
    
    // Filter data with valid coordinates
    const validData = data.filter(unit => 
      unit.latitud !== 0 && unit.Longitud !== 0 && 
      unit.latitud != null && unit.Longitud != null
    );

    if (validData.length === 0) return;

    const newMarkers = validData.map(unit => {
      // Create custom truck icon SVG
      const truckIcon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 17V13C1 12.45 1.196 11.979 1.588 11.588C1.98 11.196 2.45 11 3 11H12V7C12 6.45 12.196 5.979 12.588 5.588C12.98 5.196 13.45 5 14 5H19L22 8V17C22 17.55 21.804 18.021 21.412 18.412C21.021 18.804 20.55 19 20 19H19C19 19.8 18.683 20.483 18.05 21.05C17.417 21.617 16.767 21.9 16.1 21.9C15.433 21.9 14.783 21.617 14.15 21.05C13.517 20.483 13.2 19.8 13.2 19H8.8C8.8 19.8 8.483 20.483 7.85 21.05C7.217 21.617 6.567 21.9 5.9 21.9C5.233 21.9 4.583 21.617 3.95 21.05C3.317 20.483 3 19.8 3 19H2C1.45 19 0.979 18.804 0.588 18.412C0.196 18.021 0 17.55 0 17H1ZM14 7V11H20V9L18 7H14ZM5.9 20C6.367 20 6.767 19.833 7.1 19.5C7.433 19.167 7.6 18.767 7.6 18.3C7.6 17.833 7.433 17.433 7.1 17.1C6.767 16.767 6.367 16.6 5.9 16.6C5.433 16.6 5.033 16.767 4.7 17.1C4.367 17.433 4.2 17.833 4.2 18.3C4.2 18.767 4.367 19.167 4.7 19.5C5.033 19.833 5.433 20 5.9 20ZM16.1 20C16.567 20 16.967 19.833 17.3 19.5C17.633 19.167 17.8 18.767 17.8 18.3C17.8 17.833 17.633 17.433 17.3 17.1C16.967 16.767 16.567 16.6 16.1 16.6C15.633 16.6 15.233 16.767 14.9 17.1C14.567 17.433 14.4 17.833 14.4 18.3C14.4 18.767 14.567 19.167 14.9 19.5C15.233 19.833 15.633 20 16.1 20Z" fill="${getStatusColor(unit.StatusMantto)}" stroke="#ffffff" stroke-width="0.5"/>
          </svg>
        `)}`,
        size: new window.google.maps.Size(24, 24),
        scaledSize: new window.google.maps.Size(24, 24),
        anchor: new window.google.maps.Point(12, 12)
      };

      const marker = new window.google.maps.Marker({
        position: { lat: unit.latitud, lng: unit.Longitud },
        map: googleMap,
        title: `${unit.NumEco} - ${unit.StatusMantto}`,
        icon: truckIcon
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3">
            <div class="bg-white rounded-lg">
              <h3 class="font-bold text-lg text-gray-900 mb-2">Unidad ${unit.NumEco}</h3>
              <div class="space-y-1 text-sm">
                <p class="text-gray-700"><strong>Estado:</strong> ${unit.StatusMantto}</p>
                <p class="text-gray-700"><strong>Posición:</strong> ${unit.Posicion}</p>
                <p class="text-gray-700"><strong>Destino:</strong> ${unit.TerminalDestino}</p>
                <p class="text-gray-700"><strong>Km por vencer:</strong> ${unit.Kilometrosporvencerovencido}</p>
              </div>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        // Close any currently open InfoWindow
        closeCurrentInfoWindow();
        
        // Open new InfoWindow and set as current
        infoWindow.open(googleMap, marker);
        currentInfoWindowRef.current = infoWindow;
        
        // Call unit select handler
        onUnitSelect(unit);
      });

      // Listen to InfoWindow close event to clear reference
      infoWindow.addListener('closeclick', () => {
        currentInfoWindowRef.current = null;
      });

      return marker;
    });

    markersRef.current = newMarkers;

    // Auto-fit map bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      validData.forEach(unit => {
        bounds.extend({ lat: unit.latitud, lng: unit.Longitud });
      });
      googleMap.fitBounds(bounds);
    }
  }, [isDark, onUnitSelect]);

  // Notify parent when map is ready
  useEffect(() => {
    if (map && onMapReady) {
      onMapReady({ centerOnUnit });
    }
  }, [map, centerOnUnit, onMapReady]);

  // Fetch API key on component mount
  useEffect(() => {
    fetchGoogleMapsApiKey();
  }, []);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (!googleMapsApiKey) return;

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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        setApiKeyError('Error al cargar la API de Google Maps');
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      closeCurrentInfoWindow();
    };
  }, [googleMapsApiKey]);

  useEffect(() => {
    if (map && !isLoading) {
      createMarkers(map, filteredData);
    }
  }, [map, filteredData, createMarkers, isLoading]);

  const handleRetryApiKey = () => {
    setApiKeyError(null);
    fetchGoogleMapsApiKey();
  };

  return (
    <div className="flex-1 relative bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg overflow-hidden h-96 lg:h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Loading overlay */}
      {(isLoading || isLoadingApiKey || isProcessingTokens) && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2" style={{ borderColor: primaryColor }}></div>
            <p className="text-gray-600 dark:text-gray-400">
              {isProcessingTokens ? 'Procesando tokens...' : 
               isLoadingApiKey ? 'Obteniendo configuración de mapa...' : 
               'Actualizando ubicaciones...'}
            </p>
          </div>
        </div>
      )}

      {/* API Key Error */}
      {(apiKeyError || tokenError) && !isLoadingApiKey && (
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 flex items-center justify-center z-10">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-w-md mx-4">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Error de configuración del mapa
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              {apiKeyError || tokenError}
            </p>
            <button
              onClick={handleRetryApiKey}
              disabled={isLoadingApiKey || isProcessingTokens}
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
            >
              {(isLoadingApiKey || isProcessingTokens) ? 'Cargando...' : 'Reintentar'}
            </button>
          </div>
        </div>
      )}
      
      {/* Map Loading State */}
      {!map && !isLoading && !isLoadingApiKey && !apiKeyError && !tokenError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2" style={{ borderColor: primaryColor }}></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando mapa...</p>
          </div>
        </div>
      )}

      {/* No data message */}
      {map && !isLoading && filteredData.length === 0 && (
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">No hay unidades para mostrar</p>
        </div>
      )}

      {/* Units without coordinates warning */}
      {map && !isLoading && fleetData.length > 0 && (
        (() => {
          const unitsWithoutCoords = fleetData.filter(unit => 
            unit.latitud === 0 || unit.Longitud === 0 || 
            unit.latitud == null || unit.Longitud == null
          ).length;
          
          return unitsWithoutCoords > 0 ? (
            <div className="absolute top-4 right-4 bg-orange-100 dark:bg-orange-900/30 px-3 py-2 rounded-lg shadow-md border border-orange-200 dark:border-orange-700">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {unitsWithoutCoords} unidad{unitsWithoutCoords > 1 ? 'es' : ''} sin coordenadas
              </p>
            </div>
          ) : null;
        })()
      )}
    </div>
  );
};

export default FleetMap;