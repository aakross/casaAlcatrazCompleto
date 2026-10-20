import type { LoginRequest, LoginResponse } from "../domain/user.entity";
import { apiClient } from "../../../core/api/apiClient";

export const AuthRepository = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const { data } = await apiClient.post<LoginResponse>(
        "/auth/login",
        credentials,
      );
      if (!data.success) {
        throw new Error("Login failed");
      }
      return data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Error de conexión con el servidor";

      throw new Error(errorMessage);
    }
  },
};
