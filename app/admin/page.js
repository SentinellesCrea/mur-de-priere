'use client';

import { useState, useEffect } from "react";
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

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminName, setAdminName] = useState("Admin");
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [missions, setMissions] = useState([]);
  const [moderations, setModerations] = useState([]);
  const [urgentMissions, setUrgentMissions] = useState([]);

  useEffect(() => {
  const fetchStats = async () => {
    try {
      // 1. Bénévoles (non validés)
      const resVolunteers = await fetch("/api/admin/volunteers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      const volunteersData = await resVolunteers.json();

      if (!Array.isArray(volunteersData)) {
        console.error("⚠️ Résultat inattendu des bénévoles :", volunteersData);
      } else {
        const pending = volunteersData.filter((v) => !v.isValidated);
        setPendingVolunteers(pending);
      }

      // 2. Missions
      const resMissions = await fetch("/api/admin/missions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      const missionsData = await resMissions.json();

      if (!Array.isArray(missionsData)) {
        console.error("⚠️ Résultat inattendu des missions :", missionsData);
      } else {
        setMissions(missionsData);
        const urgents = missionsData.filter((m) => m.isUrgent);
        setUrgentMissions(urgents);
      }

      // 3. Témoignages à modérer
      const resTestimonies = await fetch("/api/admin/testimony/moderation", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      const testimoniesData = await resTestimonies.json();

      if (!Array.isArray(testimoniesData)) {
        console.error("⚠️ Résultat inattendu des témoignages :", testimoniesData);
      } else {
        setModerations(testimoniesData);
      }

    } catch (err) {
        console.error("❌ Erreur chargement stats dashboard :", err);
      }
    };

  fetchStats();
}, []);



  return (
    <div className="w-full mt-20">
      <AdminNavbar />

      <div className="px-4 py-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Bienvenue {adminName} 👋</h1>
          <p className="text-gray-600 text-sm">Tableau de bord de gestion des bénévoles et prières</p>
        </div>

        <DashboardStats
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

        {activeTab === "videos" && <AdminVideosPage />}
        {activeTab === "volunteers_pending" && <AdminVolunteersPendingPage />}
        {activeTab === "manage_volunteers" && <AdminManageVolunteersPage />}
        {activeTab === "missions" && <AdminMissionsPage />}
        {activeTab === "moderation" && <AdminTestimoniesPage />}
        {activeTab === "moderationPrayers" && <AdminPrayersPage />}
      </div>
    </div>
  );
};

export default AdminDashboard;
