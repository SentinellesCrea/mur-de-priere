import { create } from "zustand";
import { persist } from "zustand/middleware";

const useVolunteerStore = create(
  persist(
    (set) => ({
      volunteer: null,
      setVolunteer: (data) => set({ volunteer: data }),
      clearVolunteer: () => set({ volunteer: null }),
    }),
    {
      name: "volunteer-storage",
      partialize: (state) => ({ volunteer: state.volunteer }),
    }
  )
);

export default useVolunteerStore;