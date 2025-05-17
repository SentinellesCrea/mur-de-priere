"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import AdminNavbar from "../components/admin/AdminNavbar";
import InactivityTimerAdmin from "../components/admin/InactivityTimerAdmin";
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
  const router = useRouter();
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
    async function init() {
      try {
        const adminData = await fetchApi("/api/admin/me");

        if (!adminData || !adminData.firstName) {
          router.push("/admin/login");
          return;
        }

        setAdminName(`${adminData.firstName} ${adminData.lastName}`);

        const [allVolunteersData, volunteersData, missionsData, testimoniesData, availableData] = await Promise.all([
          fetchApi("/api/volunteers/all"),
          fetchApi("/api/admin/volunteers"),
          fetchApi("/api/admin/missions"),
          fetchApi("/api/admin/testimony/moderation"),
          fetchApi("/api/volunteers/available"),
        ]);

        if (Array.isArray(allVolunteersData)) {
          setAllVolunteers(allVolunteersData);
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
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AdminNavbar />
      <InactivityTimerAdmin />
      <div className="px-4 py-8 max-w-6xl mx-auto pt-[90px]">
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
        />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <TabButton onClick={() => setActiveTab("manage_volunteers")} icon={FiUsers} label="Gérer les bénévoles" />
          <TabButton onClick={() => setActiveTab("volunteers_pending")} icon={FiCheck} label="Valider un bénévole" />
          <TabButton onClick={() => setActiveTab("missions")} icon={FiList} label="Attribuer des missions" />
          <TabButton onClick={() => setActiveTab("moderation")} icon={FiInbox} label="Modération témoignages" />
          <TabButton onClick={() => setActiveTab("moderationPrayers")} icon={FiInbox} label="Modération prières" />
          <TabButton onClick={() => setActiveTab("videos")} icon={FiVideo} label="Encouragements vidéos" />
        </div>

        {/* Rendu dynamique des pages */}
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
