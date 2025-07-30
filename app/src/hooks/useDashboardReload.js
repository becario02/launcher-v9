// hooks/useDashboardReload.js
import { useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

export const useDashboardReload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDashboardId, setCurrentDashboardId] = useState(null);
  
  const pathname = usePathname();

  // Default reload time in minutes
  const DEFAULT_RELOAD_TIME = 30;

  // Get current dashboard ID based on URL
  const getCurrentDashboardId = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user ID from cookies
      const userId = Cookies.get('idUser');
      if (!userId) {
        throw new Error('User ID not found in cookies');
      }

      // Fetch user dashboards using new simplified API route
      const response = await fetch(`/api/dashboards/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboards');
      }

      const result = await response.json();
      if (result.statusCode !== '200' || !result.data) {
        throw new Error(result.message || 'Invalid response');
      }

      // Find dashboard based on current URL
      const currentPath = pathname.replace(/^\//, ''); // Remove leading slash
      const dashboard = result.data.find(d => d.url === currentPath);
      
      if (dashboard) {
        setCurrentDashboardId(dashboard.idManagementDashboard);
        return dashboard.idManagementDashboard;
      } else {
        throw new Error('Dashboard not found for current URL');
      }
    } catch (err) {
      console.error('Error getting dashboard ID:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [pathname]);

  // Get current reload time
  const getReloadTime = useCallback(async (dashboardId = null) => {
    try {
      setIsLoading(true);
      setError(null);

      const idDashboard = dashboardId || currentDashboardId;
      if (!idDashboard) {
        console.warn('Dashboard ID not available, using default reload time');
        return DEFAULT_RELOAD_TIME;
      }

      const response = await fetch(`/api/dashboards/reload-time?idDashboard=${idDashboard}`);
      if (!response.ok) {
        console.warn('Failed to fetch reload time, using default:', response.status);
        return DEFAULT_RELOAD_TIME;
      }

      const result = await response.json();
      if (result.statusCode !== '200') {
        // Check if it's specifically a "not found" error
        if (result.message && result.message.includes('No se encontró configuración')) {
          console.warn('No reload configuration found for dashboard, using default reload time');
          return DEFAULT_RELOAD_TIME;
        }
        console.warn('Error getting reload time, using default:', result.message);
        return DEFAULT_RELOAD_TIME;
      }

      // Validate that we have valid reload time data
      if (!result.data || typeof result.data.reloadTime !== 'number') {
        console.warn('Invalid reload time data, using default');
        return DEFAULT_RELOAD_TIME;
      }

      const reloadTime = result.data.reloadTime;
      
      // Ensure reload time is within reasonable bounds (1 minute to 24 hours)
      if (reloadTime < 1 || reloadTime > 1440) {
        console.warn('Reload time out of bounds, using default:', reloadTime);
        return DEFAULT_RELOAD_TIME;
      }

      return reloadTime;
    } catch (err) {
      console.error('Error fetching reload time, using default:', err);
      setError(null); // Don't set error for this, just use default
      return DEFAULT_RELOAD_TIME;
    } finally {
      setIsLoading(false);
    }
  }, [currentDashboardId]);

  // Update reload time
  const updateReloadTime = useCallback(async (newReloadTime, dashboardId = null) => {
    try {
      setIsLoading(true);
      setError(null);

      const idDashboard = dashboardId || currentDashboardId;
      if (!idDashboard) {
        throw new Error('Dashboard ID not available');
      }

      // Validate reload time
      if (newReloadTime < 1 || newReloadTime > 1440) {
        throw new Error('Reload time must be between 1 and 1440 minutes');
      }

      const response = await fetch('/api/dashboards/reload-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idDashboard,
          reloadTime: newReloadTime
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update reload time');
      }

      const result = await response.json();
      if (result.statusCode !== '200') {
        throw new Error(result.message || 'Failed to update reload time');
      }

      return result;
    } catch (err) {
      console.error('Error updating reload time:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentDashboardId]);

  // Initialize dashboard ID on mount
  useEffect(() => {
    if (!currentDashboardId) {
      getCurrentDashboardId().catch(console.error);
    }
  }, [getCurrentDashboardId, currentDashboardId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    currentDashboardId,
    getCurrentDashboardId,
    getReloadTime,
    updateReloadTime,
    clearError,
    DEFAULT_RELOAD_TIME
  };
};