"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import { toast } from "react-toastify";

export default function SupervisorMissionsPage() {
  const router = useRouter();

  const [missions, setMissions] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const missionsPerPage = 5;
  const [loading, setLoading] = useState(true);

  const fetchMissions = async () => {
    try {
      const data = await fetchApi("/api/supervisor/prayerRequests"); // 🔁 Assure-toi que cette API filtre bien wantsVolunteer: true côté backend
      const filtered = Array.isArray(data)
        ? data.filter((m) => m.wantsVolunteer === true)
        : [];

      const sorted = filtered.sort(
        (a, b) => new Date(b.datePublication) - new Date(a.datePublication)
      );

      setMissions(sorted);
    } catch (error) {
      console.error("Erreur API missions :", error.message);
      toast.error("Erreur lors du chargement des missions.");
    }
  };

  const fetchVolunteers = async () => {
    try {
      const data = await fetchApi("/api/supervisor/volunteers/validate");
      if (Array.isArray(data)) {
        setVolunteers(data.filter((v) => v.isValidated));
      } else {
        toast.error("Erreur lors du chargement des bénévoles.");
      }
    } catch (error) {
      console.error("Erreur API bénévoles:", error.message);
      toast.error("Erreur serveur lors du chargement des bénévoles.");
    }
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
        await Promise.all([fetchMissions(), fetchVolunteers()]);
      } catch (error) {
        console.error("Erreur sécurité superviseur :", error.message);
        router.push("/volunteers/login");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

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
    return <p className="text-center mt-20">Chargement...</p>;
  }

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">📤 Missions à attribuer</h2>

      {missions.length === 0 ? (
        <p>Aucune mission disponible.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {currentMissions.map((m) => {
              const isNewMission = isNew(m.datePublication);
              return (
                <li key={m._id} className={`border rounded p-4 shadow ${isNewMission ? "bg-green-50" : "bg-white"}`}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">{m.name || "Demande anonyme"}</h3>
                    {isNewMission && (
                      <span className="text-xs font-bold bg-green-600 text-white px-3 py-1 rounded-full">
                        Nouveau
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:gap-6 text-gray-700 mb-2">
                    <span className="md:min-w-[25%]"><strong>Email :</strong> {m.email || "Non fourni"}</span>
                    <span className="md:min-w-[25%]"><strong>Tél :</strong> {m.phone || "Non fourni"}</span>
                  </div>

                  <p><strong>Message :</strong> {m.prayerRequest}</p>
                  <p className="text-sm text-gray-500">Catégorie : {m.categorie}</p>
                  <p className="text-sm text-gray-500">Sous-catégorie : {m.sousCategorie}</p>
                  {m.urgence && (
                    <p className="text-sm font-bold text-red-600 mt-2">🚨 Urgent</p>
                  )}
                  <p className="text-xs text-gray-500 italic mt-1">
                    Reçue le : {new Date(m.datePublication).toLocaleDateString('fr-FR')}
                  </p>

                  <div className="mt-4 flex items-end gap-2">
                    <div className="flex flex-col w-48">
                      <label className="text-sm font-medium text-gray-700 mb-1">Choisir un bénévole :</label>
                      <select
                        className="border rounded px-3 py-2"
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
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
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
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded disabled:opacity-50"
            >
              ⬅️ Précédent
            </button>
            <span className="text-gray-700">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded disabled:opacity-50"
            >
              Suivant ➡️
            </button>
          </div>
        </>
      )}
    </div>
  );
}
