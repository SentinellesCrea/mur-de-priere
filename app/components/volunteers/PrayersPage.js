"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchApi } from "@/lib/fetchApi";
import { useAutoRefresh, VOLUNTEER_DATA_REFRESH_EVENT } from "@/lib/useAutoRefresh";
import Button from "../ui/button";

const PrayersPage = ({ onReserve }) => {
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [takingId, setTakingId] = useState(null); // 🔥 pour afficher un loader par prière

  const fetchVolunteerPrayerRequests = async ({ silent = false } = {}) => {
    try {
      const data = await fetchApi("/api/volunteers/prayerRequests");
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Erreur récupération prières :", error.message);
      if (!silent) {
        toast.error("Erreur lors du chargement des prières.");
      }
      return [];
    }
  };

  const loadPrayerRequests = async ({ silent = false } = {}) => {
    const data = await fetchVolunteerPrayerRequests({ silent });
    setPrayerRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPrayerRequests();
  }, []);

  useAutoRefresh(() => loadPrayerRequests({ silent: true }), {
    enabled: !loading,
    intervalMs: 7000,
    eventName: VOLUNTEER_DATA_REFRESH_EVENT,
  });

  const handleTakePrayer = async (id) => {
  setTakingId(id);
  try {
    await fetchApi("/api/volunteers/reservePrayer", {
      method: "PUT",
      body: { id }, // ✅ PAS de stringify ici
    });

    toast.success("🙏 Prière réservée avec succès !");
    if (onReserve) onReserve(); // ✅ mise à jour compteur

    await loadPrayerRequests({ silent: true });
  } catch (err) {
    console.error("Erreur prise mission :", err.message);
    toast.error(err.message || "Erreur lors de la réservation.");
  } finally {
    setTakingId(null);
  }
};



  return (
    <div className="p-5 lg:p-6 bg-white/90 rounded-[2rem] shadow-sm border border-white/70">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#B97952] mb-2">
            Prières disponibles
          </p>
          <h2 className="text-3xl font-extrabold text-[#3F3328]">Explorer les prières</h2>
          <p className="text-sm text-[#7A6B5E] mt-2">
            Choisis une demande libre et ajoute-la à ton suivi.
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-[#EAF3E6] px-6 py-4 text-center">
          <p className="text-3xl font-extrabold text-[#3F3328]">{prayerRequests.length}</p>
          <p className="text-xs font-bold uppercase text-[#6A8F5F]">disponibles</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Chargement des prières en cours...</p>
      ) : prayerRequests.length === 0 ? (
        <div className="rounded-[2rem] bg-[#FFFCF7] border border-[#F2DEC9] p-10 text-center text-[#7A6B5E]">
          Aucune prière disponible pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...prayerRequests]
          .filter((prayer) => !prayer.assignedTo && !prayer.reserveTo)
          .sort((a, b) => {
            if (a.isUrgent === b.isUrgent) {
              return new Date(b.datePublication) - new Date(a.datePublication);
            }
            return b.isUrgent - a.isUrgent;
          })
          .map((prayer) => (
            <div
              key={prayer._id}
              className="flex flex-col p-5 rounded-[1.75rem] shadow-sm bg-[#FFFCF7] border border-[#F2DEC9] min-h-[320px]"
            >
              <div className="flex justify-between items-start gap-3 mb-4">
                <div>
                <h3 className="font-extrabold text-[#8A5A3B] text-lg">
                  {prayer.name || "Anonyme"}
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

              <p className="text-[#3F3328] mb-4 leading-6 line-clamp-4">
                {prayer.prayerRequest || "Demande non renseignée."}
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                <span className="px-3 py-1 rounded-full bg-[#FFF0CF] text-[#8A5A3B] text-[11px] font-extrabold">
                  {prayer.category || "Non renseignée"}
                </span>
                {prayer.subcategory && (
                  <span className="px-3 py-1 rounded-full bg-[#F6E7D7] text-[#7A6B5E] text-[11px] font-bold">
                    {prayer.subcategory}
                  </span>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => handleTakePrayer(prayer._id)}
                  className="bg-[#6A8F5F] hover:bg-[#55764C] text-white rounded-xl px-3 py-2"
                  disabled={takingId === prayer._id}
                >
                  {takingId === prayer._id ? "En cours..." : "Je m'en occupe 🙏"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrayersPage;
