// hooks/useHttp.ts
import { useCallback, useState } from 'react';
import { API_BASE_URL } from '../main';
import { useKeycloak } from '@react-keycloak/web';

export function useHttp() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { keycloak, initialized } = useKeycloak();

  const request = useCallback(async (
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET', 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any = null, 
    headers: Record<string, string> = {}
  ) => {
    // Ensure Keycloak is initialized and user is authenticated
    if (!initialized || !keycloak.authenticated) {
      throw new Error("User is not authenticated");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Best Practice: Refresh the token if it's about to expire (e.g., in 30s)
      await keycloak.updateToken(30);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // Add the Bearer Token to the headers
          'Authorization': `Bearer ${keycloak.token}`,
          ...headers,
        },
        body: body ? JSON.stringify(body) : null,
      });

      if (!response.ok) {
        if (response.status == 401)
            throw new Error("Unauthorized");
        if (response.status == 400)
            throw new Error(await response.text());
        throw new Error("Error fetching data");
      }

      if (response.status === 204) {  // Status is no content
        return response;
      }
      const data = await response.json();
      // This just doesn't make any sense
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, request, clearError: () => setError(null) };
}
