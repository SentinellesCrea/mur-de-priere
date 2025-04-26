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

      
    }),
    {
      name: 'prayer-request-storage',
      partialize: (state) => ({ myMissions: state.myMissions, missionsDone: state.missionsDone }),
    }
  )
);

export default usePrayerRequestStore;