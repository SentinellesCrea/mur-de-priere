"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { MdLocalPhone, MdOutlineEmail } from "react-icons/md";

const AssignedPage = () => {
  const [assignedMissions, setAssignedMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignedMissions = async () => {
    try {
      const data = await fetchApi("/api/volunteers/assignedMissions");
      setAssignedMissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur de chargement des missions :", error.message);
      setAssignedMissions([]);
      toast.error(error.message || "Erreur lors de la récupération des missions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedMissions();
  }, []);

  const handleAcceptMission = async (prayerId) => {
    try {
      await fetchApi(`/api/volunteers/accept-mission/${prayerId}`, {
        method: "PUT",
      });

      toast.success("✅ Mission acceptée avec succès !");
      fetchAssignedMissions(); // Refresh missions
    } catch (error) {
      console.error("Erreur lors de l'acceptation de la mission :", error.message);
      toast.error(error.message || "Erreur lors de l'acceptation.");
    }
  };

  const handleRefuseMission = async (prayerId) => {
    const result = await Swal.fire({
      title: 'Refuser cette mission ?',
      text: "Elle sera disponible pour un autre bénévole.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, refuser',
    });

    if (result.isConfirmed) {
      try {
        await fetchApi(`/api/volunteers/refuse-mission/${prayerId}`, {
          method: "PUT",
        });

        toast.success("❌ Mission refusée avec succès !");
        fetchAssignedMissions(); // Refresh missions
      } catch (error) {
        console.error("Erreur lors du refus de la mission :", error.message);
        toast.error(error.message || "Erreur lors du refus.");
      }
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">📌 Missions assignées par l’admin</h2>
      </div>

      {loading ? (
        <p>Chargement des missions assignées...</p>
      ) : assignedMissions.length === 0 ? (
        <p className="text-gray-500">Aucune mission assignée pour le moment.</p>
      ) : (
        assignedMissions.map((mission) => (
          <div key={mission._id} className="p-4 rounded-lg shadow bg-white border-l-4 border-purple-400 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold italic text-purple-700">
                - {mission.name}
              </h3>
              <span className="text-m text-gray-500">
                {new Date(mission.datePublication).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <p className="text-gray-700 mb-2">{mission.prayerRequest}</p>

            <div className="text-m text-gray-500 flex items-center gap-2">
              <MdLocalPhone />
              <span>{mission.phone || "Numéro non fourni"}</span>
            </div>
            <div className="text-m text-gray-500 flex items-center gap-2 mt-1">
              <MdOutlineEmail />
              <span>{mission.email || "Email non fourni"}</span>
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => handleAcceptMission(mission._id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                ✅ J'accepte
              </button>
              <button
                onClick={() => handleRefuseMission(mission._id)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                ❌ Je refuse
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AssignedPage;
