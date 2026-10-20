import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const authStorageRaw = localStorage.getItem("auth-storage");

  if (authStorageRaw) {
    try {
      const parsedStorage = JSON.parse(authStorageRaw);
      const token = parsedStorage.state?.token;

      if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Error al parsear el token de Zustand", e);
    }
  }

  return config;
});
