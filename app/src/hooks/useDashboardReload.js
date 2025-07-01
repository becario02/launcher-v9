// hooks/useDashboardReload.js
import { useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

export const useDashboardReload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDashboardId, setCurrentDashboardId] = useState(null);
  
  const pathname = usePathname();

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

      // Get company ID from localStorage or cookies
      const selectedCompany = localStorage.getItem('selectedCompany');
      if (!selectedCompany) {
        throw new Error('No company selected');
      }

      const companyData = JSON.parse(selectedCompany);
      const companyId = companyData.id || companyData.idCompany;

      if (!companyId) {
        throw new Error('Company ID not found');
      }

      // Fetch user dashboards using existing API route
      const response = await fetch(`/api/dashboards/company/${companyId}/user/${userId}`);
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
        throw new Error('Dashboard ID not available');
      }

      const response = await fetch(`/api/dashboards/reload-time?idDashboard=${idDashboard}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reload time');
      }

      const result = await response.json();
      if (result.statusCode !== '200') {
        throw new Error(result.message || 'Failed to get reload time');
      }

      return result.data.reloadTime;
    } catch (err) {
      console.error('Error fetching reload time:', err);
      setError(err.message);
      throw err;
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
    clearError
  };
};