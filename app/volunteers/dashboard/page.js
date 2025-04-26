"use client";

import { useState, useEffect } from "react";
import { FiBell, FiSearch, FiList, FiCheck } from "react-icons/fi";
import VolunteerNavbar from "../../components/VolunteerNavbar";
import InactivityTimer from "../../components/InactivityTimer";
import usePrayerRequestStore from "../../store/prayerRequestStore";
import useVolunteerStore from "../../store/VolunteerStore";
import TabButton from "../../components/volunteers/TabButton";
import DashboardStats from "../../components/volunteers/DashboardStats";
import ToggleSwitch from "../../components/volunteers/ToggleSwitch";

import { fetchApi } from "@/lib/fetchApi"; // ✅ import du helper

// Ces fichiers doivent être déplacés dans components/volunteers/ (pas pages)
import PrayersPage from "../../components/volunteers/PrayersPage";
import MissionsPage from "../../components/volunteers/MissionsPage";
import AssignedPage from "../../components/volunteers/AssignedPage";
import CompletedMissionsPage from "../../components/volunteers/CompletedMissionsPage";

const VolunteerDashboard = () => {
  const [volunteerName, setVolunteerName] = useState("Bénévole");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [assignedMissions, setAssignedMissions] = useState([]);
  const [completedPrayers, setCompletedPrayers] = useState([]);
  const [reservePrayer, setReservePrayer] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);

  const { prayerRequests, fetchPrayerRequests } = usePrayerRequestStore();
  const { volunteer } = useVolunteerStore();

  useEffect(() => {
    if (volunteer) {
      const fullName = [volunteer.firstName, volunteer.lastName].filter(Boolean).join(" ");
      setVolunteerName(fullName || "Bénévole");
      setLoading(false);
    }
  }, [volunteer]);

  // Basculer disponibilité
  const handleToggle = async () => {
    const updatedAvailability = !isAvailable;
    setIsAvailable(updatedAvailability);

    try {
      const data = await fetchApi("/api/volunteers/updateAvailability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: updatedAvailability }),
      });
      console.log("Disponibilité mise à jour:", data);
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    }
  };

  // Compter les prières réservées
  const fetchReservedPrayersCount = async () => {
    try {
      const data = await fetchApi("/api/volunteers/reserved-prayers-count");
      setReservePrayer(data.reservedCount || 0);
    } catch (err) {
      console.error("Erreur de chargement du nombre de prières réservées :", err);
      setReservePrayer(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservedPrayersCount();
  }, []);

  return (
    <div className="w-full mt-20">
      <VolunteerNavbar />
      {/* <InactivityTimer /> */}
      <div className="px-4 py-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Bienvenue <span className="font-normal">{volunteerName}</span> 👋
            </h1>
            <ToggleSwitch isAvailable={isAvailable} onToggle={handleToggle} />
          </div>

          <p className="text-gray-600 text-sm">
            Ici, tu as <b>un rôle précieux</b> : celui de soutenir spirituellement celles et ceux qui ont déposé une demande de prière.<br/>
            Depuis ton tableau de bord, tu peux :<br/>
            - Explorer les prières en attente d'un bénévole. - Choisir celles pour lesquelles tu souhaites t'engager.<br/>
            - Suivre les missions qui t'ont été assignées ou prises en charge. - Clôturer une mission après ta prière.<br/>
            Merci pour ton engagement 💛 Ta prière peut faire une vraie différence.
          </p>
        </div>

        <DashboardStats
          assignedMissions={assignedMissions.length}
          prayerRequests={prayerRequests.length}
          reservePrayer={reservePrayer}
          completedPrayers={completedPrayers.length}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <TabButton onClick={() => setActiveTab("assigned")} icon={FiBell} label="Missions assignées" />
          <TabButton onClick={() => setActiveTab("prayers")} icon={FiSearch} label="Explorer les prières" />
          <TabButton onClick={() => setActiveTab("missions")} icon={FiList} label="Voir mes missions" />
          <TabButton onClick={() => setActiveTab("completed")} icon={FiCheck} label="Missions Terminées" />
        </div>

        {activeTab === "missions" && <MissionsPage />}
        {activeTab === "prayers" && <PrayersPage />}
        {activeTab === "assigned" && <AssignedPage />}
        {activeTab === "completed" && <CompletedMissionsPage />}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
