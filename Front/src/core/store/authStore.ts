import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  username: string | null;
  roleId: number | null;
  userId: number | null;
  puedeBorrar: boolean;
  permisos: string[];
  setSession: (
    token: string,
    username: string,
    roleId: number,
    userId: number,
    puedeBorrar: boolean,
    permisos?: string[],
  ) => void;
  logout: () => void;
  hasPermission: (moduloClave: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      username: null,
      roleId: null,
      userId: null,
      puedeBorrar: false,
      permisos: [],

      setSession: (token, username, roleId, userId, puedeBorrar, permisos = []) => {
        set({
          token,
          username,
          roleId,
          userId,
          puedeBorrar,
          permisos: permisos || [],
        });
      },

      logout: () => {
        set({
          token: null,
          username: null,
          roleId: null,
          userId: null,
          puedeBorrar: false,
          permisos: [],
        });
      },

      hasPermission: (moduloClave: string) => {
        const state = get();
        // El rol 1 (Dirección / Sistemas) siempre tiene acceso total a todos los módulos
        if (state.roleId === 1) return true;
        if (!state.permisos || !Array.isArray(state.permisos)) return false;

        const target = moduloClave.trim().toUpperCase();
        return state.permisos.some((p) => p.trim().toUpperCase() === target);
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
