"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { fetchApi } from "@/lib/fetchApi";
import { useAutoRefresh, VOLUNTEER_DATA_REFRESH_EVENT } from "@/lib/useAutoRefresh";
import  useVolunteer from "@/hooks/useVolunteer";
import Button from "../ui/button";
import { FiPhoneCall, FiCheckCircle } from "react-icons/fi";
import { FaUnlock } from "react-icons/fa";

const MissionsPage = () => {
  const { volunteer } = useVolunteer();
  const [myMissions, setMyMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redirectingId, setRedirectingId] = useState(null); // 🔥 par mission
  const [updatingId, setUpdatingId] = useState(null); // 🔥 pour "Marquer terminé"
  const router = useRouter();

  const fetchMyMissions = async ({ silent = false } = {}) => {
    try {
      const data = await fetchApi("/api/volunteers/missions");
      setMyMissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur de chargement des missions :", err.message);
      setMyMissions([]);
      if (!silent) {
        toast.error("Erreur lors du chargement des missions");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyMissions();
  }, []);

  useAutoRefresh(() => fetchMyMissions({ silent: true }), {
    enabled: !loading,
    intervalMs: 7000,
    eventName: VOLUNTEER_DATA_REFRESH_EVENT,
  });

  const handleContact = (prayer) => {
    setRedirectingId(prayer._id);
    setTimeout(() => {
      localStorage.setItem("selectedPrayer", JSON.stringify(prayer));
      router.push("/volunteers/calls");
    }, 400);
  };

  const markMissionAsDone = async (prayerRequestId) => {
      setUpdatingId(prayerRequestId);
      try {
        await fetchApi("/api/volunteers/mark-prayer-done", {
          method: "PUT",
          body: { prayerRequestId }, // ✅ PAS de JSON.stringify ici
        });

        toast.success("✅ Mission marquée comme terminée !");
        fetchMyMissions({ silent: true }); // Refresh missions
      } catch (error) {
        console.error("Erreur mise à jour mission :", error.message);
        toast.error(error.message || "Erreur lors de la mise à jour.");
      } finally {
        setUpdatingId(null);
      }
    };


    const releasePrayerRequest = async (prayerId) => {
      try {
        const data = await fetchApi(`/api/volunteers/release-prayer/${prayerId}`, {
          method: "PUT",
          credentials: "include",
        });

        toast.success("Demande libérée avec succès");

        // Met à jour l’état local (si tu en as un)
        setMyMissions((prev) => prev.filter((m) => m._id !== prayerId));
      } catch (err) {
        console.error("Erreur :", err.message);
        toast.error(err.message || "Erreur serveur");
      }
    };



    return (
    <div className="p-5 lg:p-6 bg-white/90 rounded-[2rem] shadow-sm border border-white/70">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#B97952] mb-2">
            Suivi actif
          </p>
          <h2 className="text-3xl font-extrabold text-[#3F3328]">Personnes à contacter</h2>
          <p className="text-sm text-[#7A6B5E] mt-2">
            Prières que tu as prises ou acceptées pour faire le suivi.
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-[#FFF0CF] px-6 py-4 text-center">
          <p className="text-3xl font-extrabold text-[#3F3328]">{myMissions.length}</p>
          <p className="text-xs font-bold uppercase text-[#B97952]">en suivi</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Chargement de vos missions...</p>
      ) : myMissions.length === 0 ? (
        <div className="rounded-[2rem] bg-[#FFFCF7] border border-[#F2DEC9] p-10 text-center text-[#7A6B5E]">
          Aucune mission en cours.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {myMissions.map((prayer) => (
          <div
            key={prayer._id}
            className="p-5 rounded-[1.75rem] shadow-sm bg-[#FFFCF7] border border-[#F2DEC9] min-h-[420px] flex flex-col"
          >
            <div className="flex justify-between items-start gap-3 mb-4">
              <div>
                <h3 className="font-extrabold text-[#8A5A3B] text-lg">
                  🙏 {prayer.name || "Anonyme"}
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
              <p className="flex items-center gap-2 text-[#6F6256]">
                <FiPhoneCall /> <strong>Téléphone :</strong> {prayer.phone}
              </p>
            )}
            </div>

            <p className="text-[#3F3328] my-3 leading-6 line-clamp-4">
              {prayer.prayerRequest || "Non renseignée"}
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

            <div className="mt-6 flex flex-col gap-3">
              <Button
                className={`bg-[#B97952] text-white hover:bg-[#8A5A3B] px-5 py-3 rounded-2xl text-sm flex items-center justify-center gap-2 transition-opacity duration-500 ${
                  redirectingId === prayer._id ? "opacity-0" : "opacity-100"
                }`}
                onClick={() => handleContact(prayer)}
              >
                <FiPhoneCall /> Contacter {prayer.name || "Anonyme"}
              </Button>

              <Button
                className="bg-[#6A8F5F] text-white hover:bg-[#55764C] px-5 py-3 rounded-2xl text-sm flex items-center justify-center gap-2"
                onClick={() => markMissionAsDone(prayer._id)}
                disabled={updatingId === prayer._id}
              >
                {updatingId === prayer._id ? "Mise à jour..." : (
                  <>
                    <FiCheckCircle /> Marquer comme terminé
                  </>
                )}
              </Button>

              {/* ✅ Bouton affiché seulement si le bénévole est celui qui a réservé */}
              {volunteer && (
                  String(prayer.reserveTo) === String(volunteer._id) ||
                  String(prayer.assignedTo) === String(volunteer._id)
                ) && (
                  <Button
                    className="bg-[#D7A84F] text-white hover:bg-[#B97952] px-5 py-3 rounded-2xl text-sm flex items-center justify-center gap-2"
                    onClick={() => releasePrayerRequest(prayer._id)}
                    disabled={updatingId === prayer._id}
                  >
                    {updatingId === prayer._id ? "Mise à jour..." : (
                      <>
                        <FaUnlock /> Libérer la mission
                      </>
                    )}
                  </Button>
                )}

            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );

};

export default MissionsPage;
