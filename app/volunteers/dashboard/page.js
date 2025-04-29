"use client";

import { useState, useEffect } from "react";
import { FiBell, FiSearch, FiList, FiCheck } from "react-icons/fi";
import VolunteerNavbar from "../../components/VolunteerNavbar";
import usePrayerRequestStore from "../../store/prayerRequestStore";
import useVolunteerStore from "../../store/VolunteerStore";
import TabButton from "../../components/volunteers/TabButton";
import DashboardStats from "../../components/volunteers/DashboardStats";
import ToggleSwitch from "../../components/volunteers/ToggleSwitch";

import PrayersPage from "../../components/volunteers/PrayersPage";
import MissionsPage from "../../components/volunteers/MissionsPage";
import AssignedPage from "../../components/volunteers/AssignedPage";
import CompletedMissionsPage from "../../components/volunteers/CompletedMissionsPage";

import { fetchApi } from "@/lib/fetchApi";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const VolunteerDashboard = () => {
  const router = useRouter();
  const [volunteerName, setVolunteerName] = useState("Bénévole");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [assignedMissions, setAssignedMissions] = useState([]);
  const [completedPrayers, setCompletedPrayers] = useState([]);
  const [reservePrayer, setReservePrayer] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);

  const { prayerRequests, fetchPrayerRequests } = usePrayerRequestStore();
  const { volunteer } = useVolunteerStore();
  const notificationSound = typeof window !== "undefined" ? new Audio("/sounds/notification.wav") : null;
  const [hasNewMissions, setHasNewMissions] = useState(false);
  const [toastShown, setToastShown] = useState(false); // 🔥


    useEffect(() => {
  const checkNewMissions = async () => {
    try {
      const data = await fetchApi("/api/volunteers/assignedMissions", {
        method: "GET",
        credentials: "include",
      });

      const newMissions = data?.filter((m) => !m.isAccepted) || [];
      const hasNew = newMissions.length > 0;

      setHasNewMissions(hasNew);

      // 🔥 Afficher toast uniquement la première fois qu'on détecte une nouvelle mission
      if (hasNew && !toastShown) {
      setToastShown(true);
      toast.success("🎯 Nouvelle mission disponible !");
      
      // 🔥 Lecture du son
      if (notificationSound) {
        notificationSound.play().catch((error) => console.error("Erreur lecture son :", error));
      }
    }

    } catch (err) {
      console.error("Erreur vérification missions :", err);
    }
  };

  checkNewMissions();
  const interval = setInterval(checkNewMissions, 60000);

  return () => clearInterval(interval);
}, [toastShown]);


  useEffect(() => {
    if (volunteer) {
      const fullName = [volunteer.firstName, volunteer.lastName].filter(Boolean).join(" ");
      setVolunteerName(fullName || "Bénévole");
      setLoading(false);
    } else {
      // Si pas de volunteer trouvé, vérifier via API ou redirect login
      async function checkVolunteer() {
        try {
          const data = await fetchApi("/api/volunteers/me");
          if (!data || !data.firstName) {
            router.push("/volunteers/login");
          } else {
            setVolunteerName(`${data.firstName} ${data.lastName}`);
            setIsAvailable(data.isAvailable || false);
          }
        } catch (error) {
          console.error("Erreur vérification bénévole :", error.message);
          router.push("/volunteers/login");
        } finally {
          setLoading(false);
        }
      }

      checkVolunteer();
    }
  }, [volunteer, router]);

  const handleToggle = async () => {
    const updatedAvailability = !isAvailable;
    setIsAvailable(updatedAvailability);

    try {
      await fetchApi("/api/volunteers/updateAvailability", {
        method: "PUT",
        body: JSON.stringify({ isAvailable: updatedAvailability }),
      });

      toast.success(`Disponibilité ${updatedAvailability ? "activée" : "désactivée"} !`);
    } catch (error) {
      console.error("Erreur mise à jour disponibilité :", error.message);
      toast.error("Erreur lors de la mise à jour de ta disponibilité.");
    }
  };

  const fetchReservedPrayersCount = async () => {
    try {
      const data = await fetchApi("/api/volunteers/reserved-prayers-count");
      setReservePrayer(data.reservedCount || 0);
    } catch (err) {
      console.error("Erreur chargement prières réservées :", err);
      setReservePrayer(0);
    }
  };

  useEffect(() => {
    fetchReservedPrayersCount();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-20">
      <VolunteerNavbar />
      <div className="px-4 py-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Bienvenue <span className="font-normal">{volunteerName}</span> 👋
            </h1>
            {hasNewMissions && (
              <div className="bg-yellow-200 text-yellow-900 font-semibold p-3 rounded mb-6 text-center">
                🔔 Vous avez une nouvelle mission !
              </div>
            )}

            <ToggleSwitch isAvailable={isAvailable} onToggle={handleToggle} />
          </div>

          <p className="text-gray-600 text-sm">
            Ici, tu as <b>un rôle précieux</b> : celui de soutenir spirituellement celles et ceux qui ont déposé une demande de prière.<br/>
            Depuis ton tableau de bord, tu peux :<br/>
            - Explorer les prières en attente d'un bénévole.<br/>
            - Choisir celles pour lesquelles tu souhaites t'engager.<br/>
            - Suivre les missions qui t'ont été assignées ou prises en charge.<br/>
            - Clôturer une mission après ta prière.<br/>
            Merci pour ton engagement 💛 Ta prière peut changer une vie !
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
          <TabButton onClick={() => setActiveTab("completed")} icon={FiCheck} label="Missions terminées" />
        </div>

        {/* Affichage dynamique selon l'onglet actif */}
        {activeTab === "missions" && <MissionsPage />}
        {activeTab === "prayers" && <PrayersPage />}
        {activeTab === "assigned" && <AssignedPage />}
        {activeTab === "completed" && <CompletedMissionsPage />}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
