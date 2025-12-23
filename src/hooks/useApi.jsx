import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export const useApi = () => {
  const { state, refreshToken, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  const makeRequest = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    const { method = 'GET', body, headers = {} } = options;

    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (state.token) {
      requestHeaders.Authorization = `Bearer ${state.token}`;
    }

    const requestOptions = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      let response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

      // Handle token expiration
      if (response.status === 401 && state.token) {
        const refreshed = await refreshToken();
        if (refreshed) {
          // Retry with new token
          requestHeaders.Authorization = `Bearer ${state.token}`;
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...requestOptions,
            headers: requestHeaders,
          });
        } else {
          logout();
          throw new Error('Session expired. Please log in again.');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      setLoading(false);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, [state.token, refreshToken, logout]);

  return {makeRequest, loading, error };
};