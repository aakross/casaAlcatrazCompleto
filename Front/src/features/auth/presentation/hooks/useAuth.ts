import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthRepository } from "../../infrastructure/auth.repository";
import { useAuthStore } from "../../../../core/store/authStore";
import { notify } from "../../../../core/components/notifierTostify";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();

  const signIn = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthRepository.login({ username, password });

      setSession(
        response.token,
        response.username,
        response.roleId,
        response.id,
        response.borrar === true || response.borrar === 1,
      );
      navigate("/");
      notify.success("¡Bienvenido!");
    } catch (error: any) {
      setError(error.message || "Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };
  return { signIn, isLoading, error };
};
