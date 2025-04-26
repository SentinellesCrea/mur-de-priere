"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/fetchApi"; // ✅ fetchApi sécurisé avec credentials
import AdminNavbar from "../components/AdminNavbar";
//import InactivityTimerAdmin from "../components/InactivityTimerAdmin";
import TabButton from "../components/admin/TabButton";
import DashboardStats from "../components/admin/DashboardStats";
import { FiUsers, FiList, FiVideo, FiInbox, FiCheck } from "react-icons/fi";

import AdminVideosPage from "./videos/page";
import AdminVolunteersPendingPage from "./volunteers_pending/page";
import AdminManageVolunteersPage from "./manage_volunteers/page";
import AdminMissionsPage from "./missions/page";
import AdminTestimoniesPage from "./testimonies/page";
import AdminPrayersPage from "./prayers/page";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminName, setAdminName] = useState("");  
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [missions, setMissions] = useState([]);
  const [moderations, setModerations] = useState([]);
  const [urgentMissions, setUrgentMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const adminData = await fetchApi("/api/admin/me");

        if (adminData && adminData.name) {
          setAdminName(adminData.name);
        } else {
          console.error("Erreur lors de la récupération de l'admin.");
        }
      } catch (err) {
        console.error("❌ Erreur lors de la récupération de l'admin :", err.message);
      }
    };


    const fetchStats = async () => {
      try {
        // 1. Bénévoles (validés et non validés)
        const allVolunteers = await fetchApi("/api/volunteers/all");

        if (!Array.isArray(allVolunteers)) {
          console.error("⚠️ Résultat inattendu des bénévoles :", allVolunteers);
        } else {
          const all = allVolunteers.filter((v) => v.status === "validated" );
          setAllVolunteers(allVolunteers); // ✅ Correction ici
        }


        // 2. Bénévoles (non validés)
        const volunteersData = await fetchApi("/api/admin/volunteers");

        if (!Array.isArray(volunteersData)) {
          console.error("⚠️ Résultat inattendu des bénévoles :", volunteersData);
        } else {
          const pending = volunteersData.filter((v) => v.status === "pending" || !v.isValidated);
          setPendingVolunteers(pending);
        }

        // 3. Missions
        const missionsData = await fetchApi("/api/admin/missions");

        if (!Array.isArray(missionsData)) {
          console.error("⚠️ Résultat inattendu des missions :", missionsData);
        } else {
          setMissions(missionsData);
          const urgents = missionsData.filter((m) => m.isUrgent);
          setUrgentMissions(urgents);
        }

        // 4. Témoignages à modérer
        const testimoniesData = await fetchApi("/api/admin/testimony/moderation");

        if (!Array.isArray(testimoniesData)) {
          console.error("⚠️ Résultat inattendu des témoignages :", testimoniesData);
        } else {
          setModerations(testimoniesData);
        }

      } catch (err) {
        console.error("❌ Erreur lors du chargement du dashboard admin :", err.message);
      } finally {
        setLoading(false);
      }
    };

    

    fetchStats();
    fetchAdminInfo();
  }, []);

  return (
    <div className="w-full mt-20">
      <AdminNavbar />
     {/*<InactivityTimerAdmin /> */}
      <div className="px-4 py-8 max-w-6xl mx-auto pt-[80px]">
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
        />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <TabButton onClick={() => setActiveTab("manage_volunteers")} icon={FiUsers} label="Gérer les bénévoles" />
          <TabButton onClick={() => setActiveTab("volunteers_pending")} icon={FiCheck} label="Valider un bénévole" />
          <TabButton onClick={() => setActiveTab("missions")} icon={FiList} label="Attribuer des missions" />
          <TabButton onClick={() => setActiveTab("moderation")} icon={FiInbox} label="Modération des témoignages" />
          <TabButton onClick={() => setActiveTab("moderationPrayers")} icon={FiInbox} label="Prière à modérer" />
          <TabButton onClick={() => setActiveTab("videos")} icon={FiVideo} label="Encouragements" />
        </div>
        
        {activeTab === "volunteers_pending" && <AdminVolunteersPendingPage />}
        {activeTab === "manage_volunteers" && <AdminManageVolunteersPage />}
        {activeTab === "missions" && <AdminMissionsPage />}
        {activeTab === "moderation" && <AdminTestimoniesPage />}
        {activeTab === "moderationPrayers" && <AdminPrayersPage />}
        {activeTab === "videos" && <AdminVideosPage />}
      </div>
    </div>
  );
};

export default AdminDashboard;
