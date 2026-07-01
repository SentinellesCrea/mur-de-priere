"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";

const MISSION_PREVIEW_LIMIT = 280;

export default function AdminMissionsPage() {
  const router = useRouter();

  const [missions, setMissions] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const missionsPerPage = 7;
  const [loading, setLoading] = useState(true);
  const [expandedMission, setExpandedMission] = useState(null);

  const fetchMissions = async () => {
    try {
      const data = await fetchApi("/api/admin/assign-missions");
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.datePublication) - new Date(a.datePublication))
        : [];
      setMissions(sorted);
    } catch (error) {
      console.error("Erreur API missions :", error.message);
      toast.error("Erreur lors du chargement des missions.");
    }
  };

  const fetchVolunteers = async () => {
    try {
      const data = await fetchApi("/api/admin/volunteers/validate");
      if (Array.isArray(data)) {
        setVolunteers(data.filter((v) => v.isValidated));
      } else {
        console.error("Résultat inattendu:", data);
        toast.error("Erreur lors du chargement des bénévoles.");
      }
    } catch (error) {
      console.error("Erreur API bénévoles:", error.message);
      toast.error("Erreur serveur lors du chargement des bénévoles.");
    }
  };

  const handleAssignVolunteer = async (prayerRequestId, volunteerId) => {
    try {
      await fetchApi("/api/admin/assign-missions", {
        method: "PUT",
        body: {
          volunteerId,
          prayerRequestIds: [prayerRequestId],
        },
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
        const admin = await fetchApi("/api/admin/me");
        if (!admin || !admin.firstName) {
          router.push("/admin/login");
          return;
        }
        await Promise.all([fetchMissions(), fetchVolunteers()]);
      } catch (error) {
        console.error("Erreur sécurité admin :", error.message);
        router.push("/admin/login");
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
    return <p className="rounded-lg border border-[#eadfd3] bg-[#fffaf5] p-6 text-center text-[#7a6b5f]">Chargement...</p>;
  }

  return (
    <section className="space-y-5 rounded-lg border border-[#eadfd3] bg-[#fffaf5] p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8B1E3F]">
            Attribution
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#2f2a26]">Missions à attribuer</h2>
          <p className="mt-1 text-sm text-[#6B5B4D]">
            Assigne les demandes qui nécessitent un suivi personnel.
          </p>
        </div>
        <div className="rounded-lg bg-[#EEF6FF] px-4 py-3 text-sm font-bold text-[#3569A8]">
          {missions.length} mission{missions.length > 1 ? "s" : ""}
        </div>
      </div>

      {missions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#d9c7b8] bg-white p-8 text-center text-[#7a6b5f]">
          Aucune mission disponible.
        </p>
      ) : (
        <>
          <ul className="space-y-4">
            {currentMissions.map((m) => {
              const isNewMission = isNew(m.datePublication);
              const missionText = m.prayerRequest || "";
              const shouldTruncateMission =
                missionText.length > MISSION_PREVIEW_LIMIT || missionText.split(/\r?\n/).length > 4;

              return (
                <li
                  key={m._id}
                  className={`rounded-lg border p-5 shadow-sm ${
                    isNewMission ? "border-[#cfe6cd] bg-[#EFF8ED]" : "border-[#eadfd3] bg-white"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-[#2f2a26]">{m.name}</h3>
                    {isNewMission && (
                      <span className="shrink-0 rounded-md bg-[#5F8A61] px-2.5 py-1 text-xs font-bold text-white">
                        Nouveau
                      </span>
                    )}
                  </div>

                  <div className="mb-3 grid gap-2 text-sm text-[#6B5B4D] md:grid-cols-2">
                    <span><strong>Email :</strong> {m.email || "Non fourni"}</span>
                    <span><strong>Tél :</strong> {m.phone || "Non fourni"}</span>
                  </div>

                  <p
                    className={`whitespace-pre-line text-sm leading-6 text-[#5f5146] ${
                      shouldTruncateMission ? "line-clamp-4" : ""
                    }`}
                  >
                    {missionText}
                  </p>
                  {shouldTruncateMission && (
                    <button
                      type="button"
                      onClick={() => setExpandedMission(m)}
                      className="mt-2 text-sm font-bold text-[#8B1E3F] hover:text-[#741733]"
                    >
                      Voir plus
                    </button>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-md bg-[#FFF2E7] px-2 py-1 text-xs font-bold text-[#7a4c2e]">
                      {m.category || "Non classée"}
                    </span>
                    {m.subcategory && (
                      <span className="rounded-md bg-[#FFF2E7] px-2 py-1 text-xs font-bold text-[#7a4c2e]">
                        {m.subcategory}
                      </span>
                    )}
                    {m.isUrgent && (
                      <span className="rounded-md bg-[#fff1f1] px-2 py-1 text-xs font-bold text-[#9f1239]">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-[#7a6b5f]">
                    Reçue le : {new Date(m.datePublication).toLocaleDateString('fr-FR')}
                  </p>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="flex flex-1 flex-col">
                      <label className="mb-1 text-sm font-semibold text-[#5f5146]">
                        Responsable
                      </label>
                      <select
                        className="h-10 rounded-lg border border-[#d9c7b8] px-3 text-sm outline-none focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#f8d8e1]"
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
                        className="h-10 rounded-lg bg-[#8B1E3F] px-4 text-sm font-semibold text-white transition hover:bg-[#741733]"
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
              className="rounded-lg border border-[#d9c7b8] bg-white px-3 py-2 text-sm font-semibold text-[#5f5146] hover:border-[#8B1E3F] disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="text-sm font-semibold text-[#6B5B4D]">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-[#d9c7b8] bg-white px-3 py-2 text-sm font-semibold text-[#5f5146] hover:border-[#8B1E3F] disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </>
      )}

      {expandedMission && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#2f2a26]/50 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mission-modal-title"
          onClick={() => setExpandedMission(null)}
        >
          <div
            className="flex max-h-[78vh] w-full max-w-2xl flex-col rounded-[1.5rem] border border-[#eadfd3] bg-[#fffaf5] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#eadfd3] p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8B1E3F]">
                  Mission à attribuer
                </p>
                <h3 id="mission-modal-title" className="mt-2 text-xl font-bold text-[#2f2a26]">
                  {expandedMission.name || "Demande anonyme"}
                </h3>
                <p className="mt-1 text-sm text-[#7a6b5f]">
                  Reçue le{" "}
                  {expandedMission.datePublication
                    ? new Date(expandedMission.datePublication).toLocaleDateString("fr-FR")
                    : "date inconnue"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExpandedMission(null)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#5f5146] transition hover:bg-[#FFF2E7] hover:text-[#8B1E3F]"
                aria-label="Fermer"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <p className="whitespace-pre-line text-sm leading-7 text-[#4f4339]">
                {expandedMission.prayerRequest}
              </p>
            </div>

            <div className="flex justify-end border-t border-[#eadfd3] p-4">
              <button
                type="button"
                onClick={() => setExpandedMission(null)}
                className="rounded-lg bg-[#8B1E3F] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#741733]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
