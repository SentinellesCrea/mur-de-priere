"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import AdminNavbar from "../components/admin/AdminNavbar";
import Footer from "../components/Footer";
import InactivityTimerAdmin from "../components/admin/InactivityTimerAdmin";
import TabButton from "../components/admin/TabButton";
import DashboardStats from "../components/admin/DashboardStats";
import { FiUsers, FiList, FiVideo, FiInbox, FiCheck } from "react-icons/fi";

import AdminVideosPage from "./videos/page";
import AdminVolunteersPendingPage from "./volunteers_pending/page";
import AdminManageVolunteersPage from "./manage_volunteers/page";
import AdminManageSupervisorsPage from "./manage_supervisors/page";
import AdminMissionsPage from "./missions/page";
import AdminTestimoniesPage from "./testimonies/page";
import AdminPrayersPage from "./prayers/page";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminName, setAdminName] = useState("");
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [allSupervisors, setAllSupervisors] = useState([]);
  const [missions, setMissions] = useState([]);
  const [moderations, setModerations] = useState([]);
  const [urgentMissions, setUrgentMissions] = useState([]);
  const [availableVolunteers, setAvailableVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const adminData = await fetchApi("/api/admin/me");

        if (!adminData || !adminData.firstName) {
          router.push("/admin/login");
          return;
        }

        setAdminName(`${adminData.firstName} ${adminData.lastName}`);

        const [
          allVolunteersData,
          volunteersData,
          missionsData,
          testimoniesData,
          availableData,
          supervisorsData, // ✅ nouveau
        ] = await Promise.all([
          fetchApi("/api/volunteers/all"),
          fetchApi("/api/admin/volunteers"),
          fetchApi("/api/admin/missions"),
          fetchApi("/api/admin/testimony/moderation"),
          fetchApi("/api/volunteers/available"),
          fetchApi("/api/admin/supervisors"), // ✅ à créer si pas encore fait
        ]);


        if (Array.isArray(allVolunteersData)) {
          const onlyVolunteers = allVolunteersData.filter((v) => v.role === "volunteer");
          setAllVolunteers(onlyVolunteers);
        }


        if (Array.isArray(supervisorsData)) {
          setAllSupervisors(supervisorsData);
        }

        if (Array.isArray(volunteersData)) {
          const pending = volunteersData.filter((v) => v.status === "pending" || !v.isValidated);
          setPendingVolunteers(pending);
        }

        if (Array.isArray(missionsData)) {
          setMissions(missionsData);
          const urgents = missionsData.filter((m) => m.isUrgent);
          setUrgentMissions(urgents);
        }

        if (Array.isArray(testimoniesData)) {
          setModerations(testimoniesData);
        }

        if (Array.isArray(availableData)) {
          setAvailableVolunteers(availableData);
        }

      } catch (err) {
        console.error("Erreur chargement dashboard admin :", err.message);
        toast.error("Erreur lors du chargement des données du dashboard.");
        router.push("/admin/login");
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

      {/* Animation CSS custom */}
      <style jsx>{`
        @keyframes loading-bar {
          0% {
            width: 0%;
          }
          50% {
            width: 80%;
          }
          100% {
            width: 0%;
          }
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
      <AdminNavbar />
      <InactivityTimerAdmin />
      <div className="px-4 py-8 max-w-7xl mx-auto pt-[100px]">
        <div className="mb-6">
          <h1 className="text-2xl text-gray-800 mb-2 flex items-center">
            Bienvenue <span className="font-bold ml-2">{adminName || "Admin"}</span> 👋
          </h1>
          <p className="text-gray-600 text-sm">
            Tableau de bord de gestion des bénévoles et prières
          </p>
        </div>

        <DashboardStats
          allVolunteers={allVolunteers.length}
          pendingVolunteers={pendingVolunteers.length}
          missions={missions.length}
          urgentMissions={urgentMissions.length}
          moderations={moderations.length}
          availableVolunteers={availableVolunteers.length}
          allSupervisors={allSupervisors.length} // ✅ ici
        />


        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <TabButton onClick={() => setActiveTab("manage_volunteers")} icon={FiUsers} label="Gérer les bénévoles" />
          <TabButton onClick={() => setActiveTab("volunteers_pending")} icon={FiCheck} label="Bénévoles en attente de validation" />
          <TabButton onClick={() => setActiveTab("missions")} icon={FiList} label="Attribuer des missions" />
          <TabButton onClick={() => setActiveTab("moderation")} icon={FiInbox} label="Modération témoignages" />
          <TabButton onClick={() => setActiveTab("moderationPrayers")} icon={FiInbox} label="Modération prières" />
          <TabButton onClick={() => setActiveTab("supervisors")} icon={FiUsers} label="Gérer les superviseurs" /> 
          <TabButton onClick={() => setActiveTab("videos")} icon={FiVideo} label="Encouragements vidéos" />

        </div>


        {/* Rendu dynamique des pages */}
        {activeTab === "volunteers_pending" && <AdminVolunteersPendingPage />}
        {activeTab === "manage_volunteers" && <AdminManageVolunteersPage />}
        {activeTab === "missions" && <AdminMissionsPage />}
        {activeTab === "moderation" && <AdminTestimoniesPage />}
        {activeTab === "moderationPrayers" && <AdminPrayersPage />}        
        {activeTab === "supervisors" && <AdminManageSupervisorsPage />}
        {activeTab === "videos" && <AdminVideosPage />} 

      </div>
      
    </div>
  );
};

export default AdminDashboard;
