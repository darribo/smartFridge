import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { User } from "../api/users/userService";

type UserStore = {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => set(() => ({ user })),

      clearUser: () => set(() => ({ user: null })),
    }),
    {
      name: "smartfridge_auth_user",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
