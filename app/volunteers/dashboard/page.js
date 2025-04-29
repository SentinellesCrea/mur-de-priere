"use client";

import { useState, useRef, useEffect } from "react";
import { FiBell, FiSearch, FiList, FiCheck } from "react-icons/fi";
import { HiBellAlert, HiOutlineArchive, HiOutlineCalendar, HiOutlineCheckCircle } from "react-icons/hi2";
import VolunteerNavbar from "../../components/VolunteerNavbar";
import InactivityTimer from "../../components/InactivityTimer";
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
  const [hasNewMissions, setHasNewMissions] = useState(false);
  const [toastShown, setToastShown] = useState(false); // 🔥
  const [seenMissionIds, setSeenMissionIds] = useState([]);
  const [canPlaySound, setCanPlaySound] = useState(false);
  
  const notifiedIdsRef = useRef(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);



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


  useEffect(() => {
    const enableSound = () => setCanPlaySound(true);
    window.addEventListener("click", enableSound, { once: true });
    return () => window.removeEventListener("click", enableSound);
  }, []);

    const checkNewMissions = async () => {
    try {
      const data = await fetchApi("/api/volunteers/assignedMissions", {
        method: "GET",
        credentials: "include",
      });

      const unaccepted = data?.filter((m) => !m.isAccepted) || [];
      const currentIds = unaccepted.map((m) => m._id);
      setAssignedMissions(unaccepted);

      // 🔥 Charger les missions déjà notifiées depuis localStorage
      const storedNotified = JSON.parse(localStorage.getItem("notifiedMissions") || "[]");

      const unseen = currentIds.filter((id) => !storedNotified.includes(id));

      setHasNewMissions(currentIds.length > 0);

      if (unseen.length > 0) {
        // 🔥 Ajouter les nouvelles missions vues dans localStorage
        const updatedNotified = [...storedNotified, ...unseen];
        localStorage.setItem("notifiedMissions", JSON.stringify(updatedNotified));

        toast.success("🎯 Nouvelle mission disponible !");
        if (canPlaySound) {
          const sound = new Audio("/sounds/notification.mp3");
          sound.play().catch((e) => console.warn("Audio fail:", e.message));
        }
      }

    } catch (err) {
      console.error("Erreur check mission:", err.message);
    }
  };


  useEffect(() => {
    checkNewMissions();
    const interval = setInterval(checkNewMissions, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onVisible = () => checkNewMissions();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);



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
      <InactivityTimer />
      <div className="px-4 py-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              Bienvenue <span className="font-normal">{volunteerName}</span>
              
              {/* 🔔 Badge notification à côté du nom */}
              <div className="relative inline-block">
                <HiBellAlert className="text-yellow-600" size={28} />
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
            Ici, tu as <b>un rôle précieux</b> : celui de soutenir spirituellement celles et ceux qui ont déposé une demande de prière.<br/>
            Merci pour ton engagement 💛 <br/> Ta prière peut changer une vie !
          </p>
        </div>

        <DashboardStats
          assignedMissions={assignedMissions.length}
          prayerRequests={prayerRequests.length}
          reservePrayer={reservePrayer}
          completedPrayers={completedPrayers.length}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <TabButton onClick={() => setActiveTab("assigned")} icon={HiBellAlert} label="Missions assignées" />
          <TabButton onClick={() => setActiveTab("prayers")} icon={FiSearch} label="Explorer les prières" />
          <TabButton onClick={() => setActiveTab("missions")} icon={HiOutlineCalendar} label="Voir mes missions" />
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
