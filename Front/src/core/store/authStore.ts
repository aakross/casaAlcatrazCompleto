import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  username: string | null;
  roleId: number | null;
  userId: number | null;
  puedeBorrar: boolean;
  setSession: (
    token: string,
    username: string,
    roleId: number,
    userId: number,
    puedeBorrar: boolean,
  ) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      roleId: null,
      userId: null,
      puedeBorrar: false,
      setSession: (token, username, roleId, userId, puedeBorrar) => {
        set({ token, username, roleId, userId, puedeBorrar });
      },

      logout: () => {
        set({
          token: null,
          username: null,
          roleId: null,
          userId: null,
          puedeBorrar: false,
        });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
