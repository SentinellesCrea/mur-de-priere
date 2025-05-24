"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import SupervisorNavbar from "../../components/supervisor/SupervisorNavbar";
import Footer from "../../components/Footer";
import InactivityTimerSupervisor from "../../components/supervisor/InactivityTimerSupervisor";
import TabButton from "../../components/Supervisor/TabButton";
import DashboardStats from "../../components/Supervisor/DashboardStats";
import { FiUsers, FiList, FiVideo, FiCheck } from "react-icons/fi";

import AdminVideosPage from "../videos/page";
import AdminVolunteersPendingPage from "../volunteers_pending/page";
import AdminManageVolunteersPage from "../manage_volunteers/page";
import AdminMissionsPage from "../missions/page";
import AdminPrayersPage from "../prayers/page";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SupervisorDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [supervisorName, setSupervisorName] = useState("");
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [prayersToAssign, setPrayersToAssign] = useState([]);
  const [urgentPrayers, setUrgentPrayers] = useState([]);
  const [availableVolunteers, setAvailableVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function init() {
    try {
      const supervisorData = await fetchApi("/api/supervisor/me");

      if (!supervisorData || supervisorData.role !== "supervisor") {
        toast.error("Accès superviseur refusé. Merci de vous reconnecter.");
        router.push("/volunteers/login");
        return;
      }

      setSupervisorName(`${supervisorData.firstName} ${supervisorData.lastName || ""}`);

      const [
        allVolunteersData,
        volunteersData,
        prayersData,
        availableData,
      ] = await Promise.all([
        fetchApi("/api/volunteers/all"),
        fetchApi("/api/supervisor/volunteers"),
        fetchApi("/api/supervisor/prayerRequests"),
        fetchApi("/api/volunteers/available"),
      ]);

      if (Array.isArray(allVolunteersData)) {
        const onlyVolunteers = allVolunteersData.filter((v) => v.role === "volunteer");
        setAllVolunteers(onlyVolunteers);
      }

      if (Array.isArray(volunteersData)) {
        const pending = volunteersData.filter((v) => v.status === "pending" || !v.isValidated);
        setPendingVolunteers(pending);
      }

      if (Array.isArray(prayersData)) {
        console.log("🧪 prayersData (brut):", prayersData);

        const toAssign = prayersData.filter((p) => p.wantsVolunteer === true);
        const urgent = toAssign.filter((p) => p.urgence === true);

        console.log("✅ Prières à dispatcher (wantsVolunteer:true):", toAssign);
        console.log("🚨 Prières urgentes (wantsVolunteer:true + urgence:true):", urgent);

        setPrayersToAssign(toAssign);
        setUrgentPrayers(urgent);
      }

      if (Array.isArray(availableData)) {
        setAvailableVolunteers(availableData);
      }

    } catch (err) {
      console.error("Erreur chargement dashboard superviseur :", err.message);
      if (err.message.includes("403")) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        router.push("/volunteers/login");
      } else {
        toast.error("Erreur lors du chargement des données du dashboard.");
      }
    } finally {
      setLoading(false);
    }
  }

  init();
}, [router]);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="w-full max-w-md px-4">
          <h2 className="text-center text-gray-700 text-lg mb-4 animate-pulse">
            Chargement du tableau de bord...
          </h2>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-loading-bar rounded-full" />
          </div>
        </div>

        <style jsx>{`
          @keyframes loading-bar {
            0% { width: 0%; }
            50% { width: 80%; }
            100% { width: 0%; }
          }

          .animate-loading-bar {
            animation: loading-bar 1.8s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="w-full">
      <SupervisorNavbar />
      <InactivityTimerSupervisor />
      <div className="px-4 py-8 max-w-7xl mx-auto pt-[100px]">
        <div className="mb-6">
          <h1 className="text-2xl text-gray-800 mb-2 flex items-center">
            Bienvenue <span className="font-bold ml-2">{supervisorName || "Superviseur"}</span> 👋
          </h1>
          <p className="text-gray-600 text-sm">
            En tant que Superviseur, tu as un rôle essentiel pour dispatcher les prières, accompagner les bénévoles et modérer les contenus du Mur de Prière 🙏
          </p>
        </div>

        <DashboardStats
          allVolunteers={allVolunteers.length}
          pendingVolunteers={pendingVolunteers.length}
          prayersToAssign={prayersToAssign.length}
          urgentPrayers={urgentPrayers.length}
          availableVolunteers={availableVolunteers.length}
        />


        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <TabButton onClick={() => setActiveTab("manage_volunteers")} icon={FiUsers} label="Gérer les bénévoles" />
          <TabButton onClick={() => setActiveTab("volunteers_pending")} icon={FiCheck} label="Bénévoles en attente" />
          <TabButton onClick={() => setActiveTab("missions")} icon={FiList} label="Attribuer des prières" />
          <TabButton onClick={() => setActiveTab("videos")} icon={FiVideo} label="Encouragements vidéos" />
        </div>

        {activeTab === "volunteers_pending" && <AdminVolunteersPendingPage />}
        {activeTab === "manage_volunteers" && <AdminManageVolunteersPage />}
        {activeTab === "missions" && <AdminMissionsPage />}
        {activeTab === "moderationPrayers" && <AdminPrayersPage />}
        {activeTab === "videos" && <AdminVideosPage />}
      </div>
      <Footer />
    </div>
  );
};

export default SupervisorDashboard;
