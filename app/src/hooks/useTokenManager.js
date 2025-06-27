// hooks/useTokenManager.js

import { useState, useCallback } from 'react';
import { 
  getTokenizedHeaders, 
  buildApiUrl, 
  clearStoredTokens,
  getCompanyConfig 
} from '@/utils/tokenManager';

/**
 * Custom hook for token management and API calls
 */
export const useTokenManager = () => {
  const [isProcessingTokens, setIsProcessingTokens] = useState(false);
  const [tokenError, setTokenError] = useState(null);

  /**
   * Make a tokenized API request
   */
  const tokenizedFetch = useCallback(async (endpoint, options = {}) => {
    try {
      setIsProcessingTokens(true);
      setTokenError(null);

      // Get tokenized headers
      const headers = await getTokenizedHeaders();
      
      // Build full URL
      const url = buildApiUrl(endpoint);
      
      // Merge headers with any provided options
      const fetchOptions = {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      };

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token expirado - reautenticando...');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (err) {
      console.error('Tokenized fetch error:', err);
      setTokenError(err.message);
      throw err;
    } finally {
      setIsProcessingTokens(false);
    }
  }, []);

  /**
   * Make a tokenized API request and return JSON
   */
  const tokenizedRequest = useCallback(async (endpoint, options = {}) => {
    const response = await tokenizedFetch(endpoint, options);
    return response.json();
  }, [tokenizedFetch]);

  /**
   * Clear tokens and reset state
   */
  const clearTokens = useCallback(() => {
    clearStoredTokens();
    setTokenError(null);
  }, []);

  /**
   * Get company configuration
   */
  const getCompany = useCallback(() => {
    try {
      return getCompanyConfig();
    } catch (err) {
      setTokenError(err.message);
      throw err;
    }
  }, []);

  /**
   * Clear token error
   */
  const clearTokenError = useCallback(() => {
    setTokenError(null);
  }, []);

  return {
    isProcessingTokens,
    tokenError,
    tokenizedFetch,
    tokenizedRequest,
    clearTokens,
    getCompany,
    clearTokenError
  };
};