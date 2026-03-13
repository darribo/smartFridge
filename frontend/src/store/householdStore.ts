import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type HouseholdStore = {
  currentHouseholdId: number | null;
  setCurrentHouseholdId: (householdId: number | null) => void;
  clearCurrentHouseholdId: () => void;
};

export const useHouseholdStore = create<HouseholdStore>()(
  persist(
    (set) => ({
      currentHouseholdId: null,

      setCurrentHouseholdId: (householdId) =>
        set(() => ({
          currentHouseholdId: householdId,
        })),

      clearCurrentHouseholdId: () =>
        set(() => ({
          currentHouseholdId: null,
        })),
    }),
    {
      name: "household-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);