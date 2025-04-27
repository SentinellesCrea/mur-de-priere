"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import AdminNavbar from "../components/AdminNavbar";
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
  const [availableVolunteers, setAvailableVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const adminData = await fetchApi("/api/admin/me");

        if (adminData && adminData.firstName && adminData.lastName) {
          setAdminName(`${adminData.firstName} ${adminData.lastName}`);
        } else {
          console.error("Erreur lors de la récupération de l'admin : données incomplètes.");
        }
      } catch (err) {
        console.error("❌ Erreur lors de la récupération de l'admin :", err.message);
      }
    };


    const fetchStats = async () => {
      try {
        const allVolunteersData = await fetchApi("/api/volunteers/all");

        if (Array.isArray(allVolunteersData)) {
          setAllVolunteers(allVolunteersData);
        } else {
          console.error("⚠️ Résultat inattendu des bénévoles :", allVolunteersData);
        }

        const volunteersData = await fetchApi("/api/admin/volunteers");
        if (Array.isArray(volunteersData)) {
          const pending = volunteersData.filter((v) => v.status === "pending" || !v.isValidated);
          setPendingVolunteers(pending);
        } else {
          console.error("⚠️ Résultat inattendu des bénévoles :", volunteersData);
        }

        const missionsData = await fetchApi("/api/admin/missions");
        if (Array.isArray(missionsData)) {
          setMissions(missionsData);
          const urgents = missionsData.filter((m) => m.isUrgent);
          setUrgentMissions(urgents);
        } else {
          console.error("⚠️ Résultat inattendu des missions :", missionsData);
        }

        const testimoniesData = await fetchApi("/api/admin/testimony/moderation");
        if (Array.isArray(testimoniesData)) {
          setModerations(testimoniesData);
        } else {
          console.error("⚠️ Résultat inattendu des témoignages :", testimoniesData);
        }

        const availableData = await fetchApi("/api/volunteers/available");
        if (Array.isArray(availableData)) {
          setAvailableVolunteers(availableData);
        } else {
          console.error("⚠️ Résultat inattendu bénévoles disponibles :", availableData);
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
    <div className="w-full mt-8">
      <AdminNavbar />
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
          allVolunteers={Array.isArray(allVolunteers) ? allVolunteers.length : 0}
          pendingVolunteers={Array.isArray(pendingVolunteers) ? pendingVolunteers.length : 0}
          missions={Array.isArray(missions) ? missions.length : 0}
          urgentMissions={Array.isArray(urgentMissions) ? urgentMissions.length : 0}
          moderations={Array.isArray(moderations) ? moderations.length : 0}
          availableVolunteers={Array.isArray(availableVolunteers) ? availableVolunteers.length : 0}
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
