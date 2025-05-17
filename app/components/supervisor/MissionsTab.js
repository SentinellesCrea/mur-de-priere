"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { toast } from "react-toastify";

const MissionsTab = () => {
  const [missions, setMissions] = useState([]);

  useEffect(() => {
    async function loadMissions() {
      try {
        const data = await fetchApi("/api/supervisor/unassigned-prayers");
        setMissions(data || []);
      } catch (err) {
        console.error("Erreur chargement missions :", err.message);
        toast.error("Erreur chargement des missions");
      }
    }

    loadMissions();
  }, []);

  const assignMission = async (prayerId) => {
    try {
      const res = await fetchApi(`/api/supervisor/assign/${prayerId}`, {
        method: "PUT",
      });

      if (res && res.message) {
        toast.success("Mission attribuée avec succès");
        setMissions((prev) => prev.filter((p) => p._id !== prayerId));
      }
    } catch (err) {
      console.error("Erreur assignation :", err.message);
      toast.error("Erreur assignation mission");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Missions à attribuer</h2>
      {missions.length === 0 ? (
        <p className="text-gray-500">Aucune prière en attente d'attribution.</p>
      ) : (
        <ul className="space-y-4">
          {missions.map((prayer) => (
            <li key={prayer._id} className="p-4 border rounded bg-white shadow-sm">
              <p><strong>{prayer.prenom}</strong> : {prayer.prayerRequest}</p>
              <button
                onClick={() => assignMission(prayer._id)}
                className="mt-2 px-4 py-2 bg-brand text-white rounded hover:bg-brand-dark"
              >
                Attribuer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MissionsTab;
