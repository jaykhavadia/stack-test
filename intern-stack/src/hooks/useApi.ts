import { useState } from 'react';

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
  headers?: HeadersInit;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function callApi<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    setLoading(true);
    setError(null);

    const { method = 'GET', body, token, headers = {} } = options;

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    if (token) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, fetchOptions);
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'API error');
        setLoading(false);
        return { data: null, error: data.message || 'API error', loading: false };
      }
      setLoading(false);
      return { data, error: null, loading: false };
    } catch (err) {
      console.error("useApi ~ err:", err)
      setError('Network error');
      setLoading(false);
      return { data: null, error: 'Network error', loading: false };
    }
  }

  return { callApi, loading, error };
}
