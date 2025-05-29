"use client";

import { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { HiBellAlert, HiOutlineCalendar, HiOutlineCheckCircle } from "react-icons/hi2";
import VolunteerNavbar from "../../components/volunteers/VolunteerNavbar";
import InactivityTimer from "../../components/volunteers/InactivityTimer";
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

  const [canPlaySound, setCanPlaySound] = useState(false);

  const handleToggle = async () => {
    const updatedAvailability = !isAvailable;
    setIsAvailable(updatedAvailability);

    try {
      const bodyToSend = { isAvailable: updatedAvailability };
      await fetchApi("/api/volunteers/updateAvailability", {
        method: "PUT",
        body: bodyToSend,
      });
      toast.success(`Disponibilité ${updatedAvailability ? "activée" : "désactivée"} !`);
    } catch (error) {
      console.error("❌ Erreur mise à jour disponibilité :", error.message);
      toast.error("Erreur lors de la mise à jour de ta disponibilité.");
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const volunteerData = await fetchApi("/api/volunteers/me");

        if (!volunteerData || !volunteerData.firstName) {
          router.push("/volunteers/login");
          return;
        }

        setVolunteerName(`${volunteerData.firstName} ${volunteerData.lastName}`);
        setIsAvailable(volunteerData.isAvailable || false);

        const [
          assignedMissionsData,
          reservedCountData,
          completedMissionsData,
          prayerRequestsData,
        ] = await Promise.all([
          fetchApi("/api/volunteers/assignedMissions"),
          fetchApi("/api/volunteers/reserved-prayers-count"),
          fetchApi("/api/volunteers/completedMissions"),
          fetchApi("/api/volunteers/prayerRequests"),
        ]);

        if (Array.isArray(assignedMissionsData)) {
          setAssignedMissions(assignedMissionsData);
        }

        if (typeof reservedCountData?.reservedCount === "number") {
          setReservePrayer(reservedCountData.reservedCount);
        }

        if (Array.isArray(completedMissionsData)) {
          setCompletedPrayers(completedMissionsData);
        }

        if (Array.isArray(prayerRequestsData)) {
          fetchPrayerRequests(prayerRequestsData);
        }

      } catch (err) {
        console.error("Erreur chargement dashboard bénévole :", err.message);
        toast.error("Erreur lors du chargement des données du dashboard.");
        router.push("/volunteers/login");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router]);

  // 🔎 Calcul local des prières disponibles et urgentes disponibles
  const availablePrayers = prayerRequests.filter(
    (p) => !p.assignedTo && !p.reserveTo
  );

  const urgentAvailablePrayers = availablePrayers.filter(
    (p) => p.isUrgent === true
  );

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
      <InactivityTimer />
      <div className="px-4 py-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              Bienvenue <span className="font-normal">{volunteerName}</span>
              <div className="relative inline-block">
                <HiBellAlert className="text-yellow-600 cursor-pointer" onClick={() => setActiveTab("assigned")} size={28} />
                {assignedMissions.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                    {assignedMissions.length}
                  </span>
                )}
              </div>
            </h1>
            <ToggleSwitch isAvailable={isAvailable} onToggle={handleToggle} />
          </div>

          <p className="text-gray-600 text-sm">
            Ici, tu as <b>un rôle précieux</b> : celui de soutenir spirituellement celles et ceux qui ont déposé une demande de prière.<br />
            Merci pour ton engagement 💛 <br /> Ta prière peut changer une vie !
          </p>
        </div>

        <DashboardStats
          assignedMissions={assignedMissions.length}
          prayerRequests={availablePrayers.length}
          urgentPrayerRequests={urgentAvailablePrayers.length}
          reservePrayer={reservePrayer}
          completedMissions={completedPrayers.length}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <TabButton onClick={() => setActiveTab("assigned")} icon={HiBellAlert} label="Missions assignées" />
          <TabButton onClick={() => setActiveTab("prayers")} icon={FiSearch} label="Explorer les prières" />
          <TabButton onClick={() => setActiveTab("missions")} icon={HiOutlineCalendar} label="Personnes à contacter" />
          <TabButton onClick={() => setActiveTab("completed")} icon={HiOutlineCheckCircle} label="Missions terminées" />
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
