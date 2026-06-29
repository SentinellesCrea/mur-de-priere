"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import { useAutoRefresh } from "@/lib/useAutoRefresh";
import { toast } from "react-toastify";
import { FiMail, FiPhone, FiSend, FiUsers } from "react-icons/fi";

export default function SupervisorMissionsPage() {
  const router = useRouter();

  const [missions, setMissions] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const missionsPerPage = 5;
  const [loading, setLoading] = useState(true);

  const fetchMissions = async ({ silent = false } = {}) => {
    try {
      const data = await fetchApi("/api/supervisor/missions");
      const sorted = Array.isArray(data) ? [...data].sort(
        (a, b) => new Date(b.datePublication) - new Date(a.datePublication)
      ) : [];

      setMissions(sorted);
    } catch (error) {
      console.error("Erreur API missions :", error.message);
      if (!silent) {
        toast.error("Erreur lors du chargement des missions.");
      }
    }
  };

  const fetchVolunteers = async ({ silent = false } = {}) => {
    try {
      const data = await fetchApi("/api/supervisor/volunteers/validate");
      if (Array.isArray(data)) {
        setVolunteers(data.filter((v) => v.isValidated));
      } else {
        if (!silent) {
          toast.error("Erreur lors du chargement des bénévoles.");
        }
      }
    } catch (error) {
      console.error("Erreur API bénévoles:", error.message);
      if (!silent) {
        toast.error("Erreur serveur lors du chargement des bénévoles.");
      }
    }
  };

  const fetchData = async ({ silent = false } = {}) => {
    await Promise.all([
      fetchMissions({ silent }),
      fetchVolunteers({ silent }),
    ]);
  };

  const handleAssignVolunteer = async (prayerRequestId, volunteerId) => {
    try {
      await fetchApi(`/api/supervisor/assign-missions/${prayerRequestId}`, {
        method: "PUT",
        body: { volunteerId },
      });
      toast.success("Mission attribuée avec succès !");
      fetchMissions();
    } catch (error) {
      console.error("Erreur assignation :", error.message);
      toast.error(error.message || "Erreur lors de l'attribution de la mission.");
    }
  };

  const isNew = (dateString) => {
    const now = new Date();
    const publishedDate = new Date(dateString);
    const diffInHours = (now - publishedDate) / (1000 * 60 * 60);
    return diffInHours < 24;
  };

  useEffect(() => {
    async function init() {
      try {
        const user = await fetchApi("/api/supervisor/me");
        if (!user || user.role !== "supervisor") {
          router.push("/volunteers/login");
          return;
        }
        await fetchData();
      } catch (error) {
        console.error("Erreur sécurité superviseur :", error.message);
        router.push("/volunteers/login");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  useAutoRefresh(() => fetchData({ silent: true }), {
    enabled: !loading,
    intervalMs: 9000,
  });

  // Pagination
  const indexOfLastMission = currentPage * missionsPerPage;
  const indexOfFirstMission = indexOfLastMission - missionsPerPage;
  const currentMissions = missions.slice(indexOfFirstMission, indexOfLastMission);
  const totalPages = Math.ceil(missions.length / missionsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return <p className="text-center py-16 text-gray-500 animate-pulse">Chargement des missions...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-sm rounded-[2rem] p-6 lg:p-8 border border-white/70 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <span className="size-12 rounded-2xl bg-[#DCFCE7] text-green-600 flex items-center justify-center text-xl">
            <FiSend />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#5c40e7] mb-2">Missions admin</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Missions reçues de l’admin</h2>
            <p className="text-sm text-gray-600 mt-2">Ces missions t’ont été confiées par l’admin. Tu peux les déléguer à un bénévole validé.</p>
          </div>
        </div>
        <div className="rounded-[1.5rem] bg-[#DCFCE7] px-6 py-4 text-center">
          <p className="text-3xl font-extrabold text-gray-900">{missions.length}</p>
          <p className="text-xs font-bold uppercase text-gray-500">reçues</p>
        </div>
      </div>

      {missions.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-10 text-center text-gray-500 border border-white/70 shadow-sm">
          Aucune mission reçue de l’admin.
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {currentMissions.map((m) => {
              const isNewMission = isNew(m.datePublication);
              return (
                <li key={m._id} className="bg-white border border-white/70 rounded-[2rem] p-6 shadow-sm">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="font-extrabold text-lg text-gray-900">{m.name || "Demande anonyme"}</h3>
                      <p className="text-xs text-gray-500">Reçue le : {new Date(m.datePublication).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="flex gap-2">
                      {isNewMission && (
                        <span className="text-[11px] font-extrabold bg-green-100 text-green-600 px-3 py-1 rounded-full">
                          Nouveau
                        </span>
                      )}
                      {m.isUrgent && (
                        <span className="text-[11px] font-extrabold bg-red-100 text-red-600 px-3 py-1 rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 mb-4">
                    <span className="flex items-center gap-2 text-sm"><FiMail className="text-[#5c40e7]" /> {m.email || "Non fourni"}</span>
                    <span className="flex items-center gap-2 text-sm"><FiPhone className="text-[#5c40e7]" /> {m.phone || "Non fourni"}</span>
                  </div>

                  <p className="text-sm text-gray-700 leading-6 bg-[#F7F7FB] rounded-2xl p-4">{m.prayerRequest}</p>
                  <div className="flex flex-wrap gap-2 mt-4 text-[11px] font-bold text-gray-500">
                    {m.category && <span className="px-3 py-1 rounded-full bg-[#F1EEFF] text-[#5c40e7]">{m.category}</span>}
                    {m.subcategory && <span className="px-3 py-1 rounded-full bg-gray-100">{m.subcategory}</span>}
                  </div>

                  <div className="mt-5 flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="flex flex-col flex-1">
                      <label className="text-sm font-extrabold text-gray-700 mb-2 flex items-center gap-2"><FiUsers className="text-[#5c40e7]" /> Choisir un bénévole</label>
                      <select
                        className="border border-gray-200 rounded-2xl px-4 py-3 bg-white text-sm"
                        value={assignments[m._id] || ""}
                        onChange={(e) =>
                          setAssignments({ ...assignments, [m._id]: e.target.value })
                        }
                      >
                        <option value="">-- Sélectionner --</option>
                        {volunteers.map((v) => (
                          <option key={v._id} value={v._id}>
                            {v.firstName} {v.lastName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {assignments[m._id] && (
                      <button
                        onClick={() => handleAssignVolunteer(m._id, assignments[m._id])}
                        className="bg-[#5c40e7] text-white px-5 py-3 rounded-2xl font-extrabold text-sm hover:scale-[1.01] transition"
                      >
                        Attribuer
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Pagination controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl disabled:opacity-50 font-bold"
            >
              ⬅️ Précédent
            </button>
            <span className="text-gray-700">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl disabled:opacity-50 font-bold"
            >
              Suivant ➡️
            </button>
          </div>
        </>
      )}
    </div>
  );
}
