"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { HiBellAlert, HiOutlineCheckCircle, HiOutlineUserGroup, HiOutlineArchiveBoxArrowDown } from "react-icons/hi2";
import { FiClipboard, FiSearch } from "react-icons/fi";

import SupervisorNavbar from "../../components/supervisor/SupervisorNavbar";
import InactivityTimer from "../../components/supervisor/InactivityTimer";
import { fetchApi } from "@/lib/fetchApi";
import TabButton from "../../components/supervisor/TabButton";
import DashboardStats from "../../components/supervisor/DashboardStats";

import MissionsTab from "../../components/supervisor/MissionsTab";
import VolunteersTab from "../../components/supervisor/VolunteersTab";
import PrayersModerationTab from "../../components/supervisor/PrayersModerationTab";
import TestimoniesModerationTab from "../../components/supervisor/TestimoniesModerationTab";
import ExploreTab from "../../components/supervisor/ExploreTab";

const SupervisorDashboard = () => {
  const router = useRouter();
  const [supervisor, setSupervisor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("missions");
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    totalMissions: 0,
    pendingPrayers: 0,
    pendingTestimonies: 0,
  });

  useEffect(() => {
    async function loadSupervisor() {
      try {
        const data = await fetchApi("/api/supervisor/me");
        if (!data || !data.firstName) {
          router.push("/volunteers/login");
        } else {
          setSupervisor(data);
        }
      } catch (error) {
        console.error("Erreur chargement superviseur :", error.message);
        router.push("/volunteers/login");
      } finally {
        setLoading(false);
      }
    }

    loadSupervisor();
  }, [router]);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchApi("/api/supervisor/stats");
        setStats(data);
      } catch (err) {
        console.warn("Erreur stats superviseur :", err.message);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Chargement du tableau de bord superviseur...</p>
      </div>
    );
  }

  const fullName = `${supervisor.firstName} ${supervisor.lastName}`;

  return (
    <div className="w-full mt-20">
      <SupervisorNavbar />
      <InactivityTimer />
      <div className="px-4 py-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            Bienvenue <span className="font-normal">{fullName}</span>
          </h1>
          <p className="text-gray-600 text-sm">
            En tant que <strong>Superviseur</strong>, tu as un rôle essentiel pour dispatcher les missions, accompagner les bénévoles et modérer les contenus du Mur de Prière 🙏
          </p>
        </div>

        <DashboardStats
          availableVolunteers={stats.totalVolunteers}
          totalMissions={stats.totalMissions}
          pendingPrayers={stats.pendingPrayers}
          pendingTestimonies={stats.pendingTestimonies}
        />


        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <TabButton onClick={() => setActiveTab("missions")} icon={FiClipboard} label="Attribuer missions" />
          <TabButton onClick={() => setActiveTab("volunteers")} icon={HiOutlineUserGroup} label="Bénévoles connectés" />
          <TabButton onClick={() => setActiveTab("prayers")} icon={FiSearch} label="Modérer prières" />
          <TabButton onClick={() => setActiveTab("testimonies")} icon={HiOutlineArchiveBoxArrowDown} label="Modérer témoignages" />
          <TabButton onClick={() => setActiveTab("explore")} icon={HiBellAlert} label="Explorer demandes" />
        </div>

        {activeTab === "missions" && <MissionsTab />}
        {activeTab === "volunteers" && <VolunteersTab />}
        {activeTab === "prayers" && <PrayersModerationTab />}
        {activeTab === "testimonies" && <TestimoniesModerationTab />}
        {activeTab === "explore" && <ExploreTab />}
      </div>
    </div>
  );
};

export default SupervisorDashboard;
