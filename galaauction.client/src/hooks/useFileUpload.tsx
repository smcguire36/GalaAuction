// hooks/useHttp.ts
import { useCallback, useState } from "react";
import { API_BASE_URL } from "../main";
import { useKeycloak } from "@react-keycloak/web";

export function useFileUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { keycloak, initialized } = useKeycloak();

  const uploadFile = useCallback(
    async (
      endpoint: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selectedFile: File,
      headers: Record<string, string> = {},
    ) => {
      // Ensure Keycloak is initialized and user is authenticated
      if (!initialized || !keycloak.authenticated) {
        throw new Error("User is not authenticated");
      }

      setIsLoading(true);
      setError(null);

      // 1. Create a FormData instance
      const formData = new FormData();

      // 2. Append the file with the required key name "file"
      formData.append("file", selectedFile);

      try {
        // Best Practice: Refresh the token if it's about to expire (e.g., in 30s)
        await keycloak.updateToken(30);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: "POST",
          headers: {
            // Add the Bearer Token to the headers
            Authorization: `Bearer ${keycloak.token}`,
            ...headers,
          },
          body: formData, // Send the FormData as the request body
        });

        if (response.status === 204) {
          // Status is no content
          return response;
        }
        if (response.status === 400) {
          // Status is BadRequest ... return validation errors as decoded JSON
          return await response.json();
        }
        if (response.status === 200) {
          // Status is OK returning text content
          return await response.text();
        }

        if (!response.ok) {
          if (response.status == 401) throw new Error("Unauthorized");
          throw new Error("Error fetching data");
        }
            
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { isLoading, error, uploadFile, clearError: () => setError(null) };
}
