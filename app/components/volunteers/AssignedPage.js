"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { useAutoRefresh, VOLUNTEER_DATA_REFRESH_EVENT } from "@/lib/useAutoRefresh";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { MdLocalPhone, MdOutlineEmail } from "react-icons/md";

const AssignedPage = () => {
  const [assignedMissions, setAssignedMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignedMissions = async ({ silent = false } = {}) => {
    try {
      const data = await fetchApi("/api/volunteers/assignedMissions");
      setAssignedMissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur de chargement des missions :", error.message);
      setAssignedMissions([]);
      if (!silent) {
        toast.error(error.message || "Erreur lors de la récupération des missions.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedMissions();
  }, []);

  useAutoRefresh(() => fetchAssignedMissions({ silent: true }), {
    enabled: !loading,
    intervalMs: 7000,
    eventName: VOLUNTEER_DATA_REFRESH_EVENT,
  });

  const handleAcceptMission = async (prayerId) => {
    try {
      await fetchApi(`/api/volunteers/accept-mission/${prayerId}`, {
        method: "PUT",
      });

      toast.success("✅ Mission acceptée avec succès !");
      fetchAssignedMissions({ silent: true }); // Refresh missions
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
        fetchAssignedMissions({ silent: true }); // Refresh missions
      } catch (error) {
        console.error("Erreur lors du refus de la mission :", error.message);
        toast.error(error.message || "Erreur lors du refus.");
      }
    }
  };

  return (
    <div className="p-5 lg:p-6 bg-white/90 rounded-[2rem] shadow-sm border border-white/70">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#B97952] mb-2">
            À accepter
          </p>
          <h2 className="text-3xl font-extrabold text-[#3F3328]">Missions assignées</h2>
          <p className="text-sm text-[#7A6B5E] mt-2">
            Missions proposées par l’équipe : accepte celles que tu peux suivre.
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-[#E8F2DD] px-6 py-4 text-center">
          <p className="text-3xl font-extrabold text-[#3F3328]">{assignedMissions.length}</p>
          <p className="text-xs font-bold uppercase text-[#6A8F5F]">assignées</p>
        </div>
      </div>

      {loading ? (
        <p>Chargement des missions assignées...</p>
      ) : assignedMissions.length === 0 ? (
        <div className="rounded-[2rem] bg-[#FFFCF7] border border-[#F2DEC9] p-10 text-center text-[#7A6B5E]">
          Aucune mission assignée pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {assignedMissions.map((mission) => (
          <div key={mission._id} className="p-5 rounded-[1.75rem] shadow-sm bg-[#FFFCF7] border border-[#F2DEC9] min-h-[360px] flex flex-col">
            <div className="flex justify-between items-start gap-3 mb-4">
              <div>
                <h3 className="font-extrabold italic text-[#8A5A3B] text-lg">
                  {mission.name || "Demande anonyme"}
                </h3>
                <span className="text-xs text-gray-500">
                  {mission.datePublication
                    ? new Date(mission.datePublication).toLocaleDateString("fr-FR")
                    : "Date inconnue"}
                </span>
              </div>
              {mission.isUrgent && (
                <span className="shrink-0 px-3 py-1 rounded-full bg-[#FFE3DC] text-[#D8614C] text-[11px] font-extrabold">
                  Urgent
                </span>
              )}
            </div>
            <p className="text-[#3F3328] mb-4 leading-6 line-clamp-4">{mission.prayerRequest}</p>

            <div className="text-sm text-[#7A6B5E] flex items-center gap-2">
              <MdLocalPhone />
              <span>{mission.phone || "Numéro non fourni"}</span>
            </div>
            <div className="text-sm text-[#7A6B5E] flex items-center gap-2 mt-1 break-all">
              <MdOutlineEmail />
              <span>{mission.email || "Email non fourni"}</span>
            </div>

            <div className="flex flex-col gap-3 mt-auto pt-6">
              <button
                onClick={() => handleAcceptMission(mission._id)}
                className="bg-[#6A8F5F] text-white px-5 py-3 rounded-2xl hover:bg-[#55764C] font-bold"
              >
                ✅ J'accepte
              </button>
              <button
                onClick={() => handleRefuseMission(mission._id)}
                className="bg-[#F6E7D7] text-[#3F3328] px-5 py-3 rounded-2xl hover:bg-[#F2DEC9] font-bold"
              >
                ❌ Je refuse
              </button>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default AssignedPage;
