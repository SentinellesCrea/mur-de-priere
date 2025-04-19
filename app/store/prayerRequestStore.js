import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePrayerRequestStore = create(
  persist(
    (set) => ({
      prayerRequests: [],
      myMissions: [],
      missionsDone: [],

      fetchPrayerRequests: async () => {
        try {
          const res = await fetch('/api/prayerRequests');
          const data = await res.json();
          const filtered = data.filter((prayer) => prayer.wantsVolunteer === true);
          set({ prayerRequests: filtered });
        } catch (err) {
          console.error("Erreur lors du chargement des prières :", err);
        }
      },

      reservePrayer: (id) =>
        set((state) => {
          const selected = state.prayerRequests.find((prayer) => prayer._id === id);
          if (!selected) return state;
          return {
            prayerRequests: state.prayerRequests.filter((prayer) => prayer._id !== id),
            myMissions: [...state.myMissions, selected],
          };
        }),

      markMissionAsDone: (id) =>
        set((state) => {
          const selected = state.myMissions.find((prayer) => prayer._id === id);
          if (!selected) return state;
          return {
            myMissions: state.myMissions.filter((prayer) => prayer._id !== id),
            missionsDone: [...state.missionsDone, selected],
          };
        }),
    }),
    {
      name: 'prayer-request-storage',
      partialize: (state) => ({ myMissions: state.myMissions, missionsDone: state.missionsDone }),
    }
  )
);

export default usePrayerRequestStore;