"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { fetchApi } from "@/lib/fetchApi";
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

  const fetchMyMissions = async () => {
    try {
      const data = await fetchApi("/api/volunteers/missions");
      setMyMissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur de chargement des missions :", err.message);
      setMyMissions([]);
      toast.error("Erreur lors du chargement des missions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyMissions();
  }, []);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prayerRequestId }),
      });

      toast.success("✅ Mission marquée comme terminée !");
      fetchMyMissions(); // Refresh missions
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
    <div className="p-4 bg-gray-50 rounded shadow">
      <h2 className="text-xl font-bold mb-6">📁 Mes missions</h2>

      {loading ? (
        <p className="text-center text-gray-600">Chargement de vos missions...</p>
      ) : myMissions.length === 0 ? (
        <p className="text-gray-500">Aucune mission en cours.</p>
      ) : (
        myMissions.map((prayer) => (
          <div
            key={prayer._id}
            className="p-4 rounded-lg shadow bg-white border-l-4 border-yellow-400 mb-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-yellow-700">
                🙏 {prayer.name || "Anonyme"}
              </h3>
              <span className="text-sm text-gray-500">
                {prayer.datePublication
                  ? new Date(prayer.datePublication).toLocaleDateString("fr-FR")
                  : "Date inconnue"}
              </span>
            </div>

            <p className="text-gray-700"><strong>✉️ Email :</strong> {prayer.email || "Non renseigné"}</p>

            {prayer.phone && (
              <p className="flex items-center gap-2 text-gray-700">
                <FiPhoneCall /> <strong>Téléphone :</strong> {prayer.phone}
              </p>
            )}

            <p className="text-gray-800 my-2">
              <strong>📝 Demande :</strong> {prayer.prayerRequest || "Non renseignée"}
            </p>

            <p className="text-sm text-gray-500">
              <strong>📂 Catégorie :</strong> {prayer.category || "Non renseignée"}
            </p>

            {prayer.subcategory && (
              <p className="text-sm text-gray-500">
                <strong>📁 Sous-catégorie :</strong> {prayer.subcategory}
              </p>
            )}

            {prayer.isUrgent && (
              <p className="text-sm font-bold text-red-600 mt-2">🚨 Urgent</p>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Button
                className={`bg-[#d4967d] text-white hover:bg-green-700 px-6 py-2 text-sm flex items-center gap-2 transition-opacity duration-500 ${
                  redirectingId === prayer._id ? "opacity-0" : "opacity-100"
                }`}
                onClick={() => handleContact(prayer)}
              >
                <FiPhoneCall /> Contacter {prayer.name || "Anonyme"}
              </Button>

              <Button
                className="bg-green-600 text-white hover:bg-[#d4967d] px-4 py-2 text-sm flex items-center gap-2"
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
                    className="bg-yellow-600 text-white hover:bg-green-700 px-4 py-2 text-sm flex items-center gap-2"
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
        ))
      )}
    </div>
  );

};

export default MissionsPage;
