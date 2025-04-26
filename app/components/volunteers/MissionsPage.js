"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { fetchApi } from "@/lib/fetchApi"; // ✅ import du helper
import Button from "../ui/button";
import { FiPhoneCall, FiCheckCircle } from "react-icons/fi";

const MissionsPage = () => {
  const [myMissions, setMyMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

const handleContact = (prayer) => {
  setIsRedirecting(true);
  setTimeout(() => {
    localStorage.setItem("selectedPrayer", JSON.stringify(prayer)); // ✅ ici prayer vient du paramètre
    router.push("/volunteers/calls");
  }, 400);
};


  // Récupérer les missions assignées
  const fetchMyMissions = async () => {
    try {
      const data = await fetchApi("/api/volunteers/missions");
      setMyMissions(data || []);
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

  // Fonction pour marquer une mission comme terminée
  const markMissionAsDone = async (prayerRequestId) => {
    try {
      await fetchApi("/api/volunteers/mark-prayer-done", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prayerRequestId }),
      });

      toast.success("Prière marquée comme terminée !");
      fetchMyMissions(); // Recharger les missions après avoir terminé
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la prière :", error.message);
      toast.error(error.message || "Erreur lors de la mise à jour de la mission.");
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">📁 Mes missions</h2>
      </div>

      {loading ? (
        <h3>Chargement des missions...</h3>
      ) : myMissions.length === 0 ? (
        <p className="text-gray-500">Aucune mission assignée pour le moment.</p>
      ) : (
        myMissions.map((prayer) => (
          <div
            key={prayer._id}
            className="p-4 rounded-lg shadow bg-white border-l-4 border-yellow-400 mb-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-yellow-700">
                🙏 {prayer.name}
              </h3>
              <span className="text-l text-gray-500">
                {new Date(prayer.datePublication).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <p className="text-gray-700"><strong>✉️ Email :</strong> {prayer.email}</p>
            {prayer.phone && (
              <p className="flex items-center gap-2 text-gray-700">
                <FiPhoneCall />
                <strong>Téléphone :</strong>
                {prayer.phone}
              </p>
            )}
            <p className="text-gray-800 my-2">
              <strong>📝 Demande :</strong> {prayer.prayerRequest}
            </p>
            <p className="text-sm text-gray-500">
              <strong>📂 Catégorie :</strong> {prayer.category}
            </p>
            {prayer.subcategory && (
              <p className="text-sm text-gray-500">
                <strong>📁 Sous-catégorie :</strong> {prayer.subcategory}
              </p>
            )}
            {prayer.isUrgent && (
              <p className="text-sm font-bold text-red-600 mt-2">🚨 Urgent</p>
            )}
            <div className="mt-4 flex justify-between">
              <Button
                className={`bg-[#d4967d] text-white hover:bg-green-700 px-6 py-2 text-sm flex items-center gap-2 transition-opacity duration-500 ${isRedirecting ? "opacity-0" : "opacity-100"}`}
                onClick={() => handleContact(prayer)}
              >
                <FiPhoneCall /> Contacter {prayer.name}
              </Button>

              <Button
                className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 text-sm flex items-center gap-2"
                onClick={() => markMissionAsDone(prayer._id)}
              >
                <FiCheckCircle /> Marquer comme terminé
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MissionsPage;
