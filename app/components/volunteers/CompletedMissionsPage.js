"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchApi } from "@/lib/fetchApi";
import { useAutoRefresh, VOLUNTEER_DATA_REFRESH_EVENT } from "@/lib/useAutoRefresh";

const CompletedMissionsPage = () => {
  const [completedMissions, setCompletedMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompletedMissions = async ({ silent = false } = {}) => {
    try {
      const data = await fetchApi("/api/volunteers/completedMissions");
      setCompletedMissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur de chargement des missions terminées :", err.message);
      if (!silent) {
        toast.error(err.message || "Erreur lors de la récupération des missions.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedMissions();
  }, []);

  useAutoRefresh(() => fetchCompletedMissions({ silent: true }), {
    enabled: !loading,
    intervalMs: 9000,
    eventName: VOLUNTEER_DATA_REFRESH_EVENT,
  });

  return (
    <div className="p-5 lg:p-6 bg-white/90 rounded-[2rem] shadow-sm border border-white/70">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#B97952] mb-2">
            Historique
          </p>
          <h2 className="text-3xl font-extrabold text-[#3F3328]">Missions terminées</h2>
          <p className="text-sm text-[#7A6B5E] mt-2">
            Les suivis clôturés restent ici pour garder une trace de ton engagement.
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-[#DDEBD4] px-6 py-4 text-center">
          <p className="text-3xl font-extrabold text-[#3F3328]">{completedMissions.length}</p>
          <p className="text-xs font-bold uppercase text-[#6A8F5F]">terminées</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Chargement des missions terminées...</p>
      ) : completedMissions.length === 0 ? (
        <div className="rounded-[2rem] bg-[#FFFCF7] border border-[#DDEBD4] p-10 text-center text-[#7A6B5E]">
          Aucune mission terminée pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {completedMissions.map((prayer) => (
          <div
            key={prayer._id}
            className="p-5 rounded-[1.75rem] shadow-sm bg-[#FFFCF7] border border-[#DDEBD4] min-h-[340px] flex flex-col"
          >
            <div className="flex justify-between items-start gap-3 mb-4">
              <div>
                <h3 className="font-extrabold text-[#6A8F5F] text-lg">
                  🙌 {prayer.name || "Anonyme"}
                </h3>
                <span className="text-xs text-gray-500">
                  {prayer.datePublication
                    ? new Date(prayer.datePublication).toLocaleDateString("fr-FR")
                    : "Date inconnue"}
                </span>
              </div>
              {prayer.isUrgent && (
                <span className="shrink-0 px-3 py-1 rounded-full bg-[#FFE3DC] text-[#D8614C] text-[11px] font-extrabold">
                  Urgent
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm mb-4">
              <p className="text-[#6F6256] break-all"><strong>✉️ Email :</strong> {prayer.email || "Non renseigné"}</p>

            {prayer.phone && (
              <p className="text-[#6F6256]">
                <strong>📞 Téléphone :</strong> {prayer.phone}
              </p>
            )}
            </div>

            <p className="text-[#3F3328] my-3 leading-6 line-clamp-4">
              {prayer.prayerRequest || "Non renseignée"}
            </p>

            <div className="flex flex-wrap gap-2 mt-auto">
              <span className="px-3 py-1 rounded-full bg-[#EAF3E6] text-[#6A8F5F] text-[11px] font-extrabold">
                {prayer.category || "Non renseignée"}
              </span>
              {prayer.subcategory && (
                <span className="px-3 py-1 rounded-full bg-[#F6E7D7] text-[#7A6B5E] text-[11px] font-bold">
                  {prayer.subcategory}
                </span>
              )}
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default CompletedMissionsPage;
