import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAvailabilityStore = create(
  persist(
    (set) => ({
      isAvailable: false,
      toggleAvailability: () => set((state) => ({ isAvailable: !state.isAvailable })),
      setAvailability: (value) => set({ isAvailable: value }),
    }),
    {
      name: "volunteer-availability", // nom utilisé dans le localStorage
    }
  )
);

export default useAvailabilityStore;
