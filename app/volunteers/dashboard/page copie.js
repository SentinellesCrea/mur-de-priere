"use client";

import { useState, useEffect } from "react";
import { FiUserCheck, FiInbox, FiUsers, FiSearch, FiList, FiCheck, FiPhoneCall, FiArrowLeftCircle, FiToggleLeft, FiToggleRight, FiCheckCircle, FiBell } from "react-icons/fi";
import { FcCalendar, FcFolder } from "react-icons/fc";
import { toast } from "react-toastify";  // Pour afficher des toasts d'erreur ou de succès
import VolunteerNavbar from "../../components/VolunteerNavbar";  // Navbar du bénévole
import InactivityTimer from '../../components/InactivityTimer';  // Timer d'inactivité pour gérer la déconnexion
import usePrayerRequestStore from "../../store/prayerRequestStore";
import useVolunteerStore from "../../store/VolunteerStore";
import TabButton from "../../components/volunteers/TabButton";
import DashboardStats from "../../components/volunteers/DashboardStats";
import Button from "../../components/ui/button";  // Composant de bouton
import ToggleSwitch from '../../components/ToggleSwitch';  // Composant pour basculer la disponibilité du bénévole


import PrayersPage from "../prayers/page";
import MissionsPage from "../missions/page";
import AssignedPage from "../assigned/page";
import CompletedMissionsPage from "../completed/page";

const VolunteerDashboard = () => {
  const [volunteerName, setVolunteerName] = useState("Bénévole");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [assignedMissions, setAssignedMissions] = useState([]);
  const [completedPrayers, setCompletedPrayers] = useState([]);
  const [myMissions, setMyMissions] = useState([]);
  const [isAvailable, setIsAvailable] = useState(false);

  // Données de mission et prière
  const { missionsDone } = usePrayerRequestStore();
  const { prayerRequests, fetchPrayerRequests } = usePrayerRequestStore();
  const { volunteer } = useVolunteerStore();


  // Récupérer le nom du bénévole
  useEffect(() => {
    if (volunteer) {
      const fullName = [volunteer.firstName, volunteer.lastName].filter(Boolean).join(" ");
      setVolunteerName(fullName || "Bénévole");
      setLoading(false);
    }
  }, [volunteer]);


  useEffect(() => {
    if (missionsDone && Array.isArray(missionsDone)) {
      setCompletedPrayers(missionsDone);
    }
  }, [missionsDone]);

  // Fonction pour récupérer les missions assignées
  const fetchAssignedMissions = async () => {
    try {
      const token = localStorage.getItem("volunteerToken");  // Récupère le token du bénévole depuis le localStorage

      if (!token) {
        toast.error("Token du bénévole manquant");
      }

      const response = await fetch("/api/volunteers/assignedMissions", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,  // Envoie le token dans l'en-tête Authorization
          "Content-Type": "application/json",  // Assurez-vous que l'API attend du JSON
        },
        credentials: "include",  // Si tu utilises des cookies
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setAssignedMissions(data);  // Mettre à jour l'état avec les missions assignées
      } else {
        console.error("⚠️ Résultat inattendu des missions :", data);
        setAssignedMissions([]);  // Réinitialiser les missions en cas de résultat inattendu
      }
    } catch (err) {
      console.error("Erreur de chargement des missions :", err);
      toast.error("Erreur de chargement des missions.");
      setAssignedMissions([]);  // Fallback en cas d'erreur
    } finally {
      setLoading(false);  // Fin du chargement
    }
  };

  useEffect(() => {
    fetchAssignedMissions();  // Récupérer les missions au montage du composant
  }, []);  // Le useEffect se déclenche une seule fois au montage du composant

  
  // Fonction pour basculer la disponibilité du bénévole
  const handleToggle = async () => {
    const updatedAvailability = !isAvailable;
    setIsAvailable(updatedAvailability);  // Met à jour l'état du toggle

    try {
      const res = await fetch("/api/volunteers/updateAvailability", {
        method: "PUT",
        body: JSON.stringify({ isAvailable: updatedAvailability }), // Envoie l'état mis à jour
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la mise à jour de la disponibilité");
      }

      const data = await res.json();
      console.log("Disponibilité mise à jour:", data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const getCompletedPrayers = () => {
  return prayerRequests.filter((prayer) => prayer.finishedBy === volunteer._id);
  };

  const [reservePrayer, setreservePrayer] = useState(0);
  const fetchReservedPrayersCount = async () => {
    try {
      const token = localStorage.getItem("volunteerToken");  // Récupérer le token du bénévole

      if (!token) {
        toast.error("Token du bénévole manquant");
        return;
      }

      const response = await fetch("/api/volunteers/reserve-prayer", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,  // Envoie du token dans l'en-tête Authorization
          "Content-Type": "application/json",  // Assurez-vous que l'API attend du JSON
        },
        credentials: "include",  // Si tu utilises des cookies
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.reservedCount !== undefined) {
        setGetReservePrayers(data.reservedCount);  // Mettre à jour l'état avec le nombre de prières réservées
      } else {
        console.error("⚠️ Résultat inattendu de l'API :", data);
        setGetReservePrayers(0);  // Réinitialiser le nombre en cas de résultat inattendu
      }
    } catch (err) {
      console.error("Erreur de chargement du nombre de prières réservées :", err);
      toast.error("Erreur de chargement du nombre de prières.");
      setGetReservePrayers(0);  // Fallback en cas d'erreur
    } finally {
      setLoading(false);  // Fin du chargement
    }
  };

  useEffect(() => {
    fetchReservedPrayersCount();  // Appeler la fonction au montage du composant
  }, []);

  return (
    <div className="w-full mt-20">
      <VolunteerNavbar />
      //<InactivityTimer /> {/* Ajouter le composant d'inactivité */}
      <div className="px-4 py-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl text-gray-800 mb-2 flex items-center">
            <span className="flex-grow">Bienvenue <span className="font-bold">{volunteerName}</span> 👋</span>
            
            {/* ToggleSwitch à droite */}
            <ToggleSwitch isAvailable={isAvailable} onToggle={handleToggle} />
          </h1>
          
          <p className="text-gray-600 text-sm">
            Ici, tu as <b>un rôle précieux</b> : celui de soutenir spirituellement celles et ceux qui ont déposé une demande de prière.<br/>
            Depuis ton tableau de bord, tu peux :<br/>
            - Explorer les prières en attente d’un bénévole. - Choisir celles pour lesquelles tu souhaites t'engager en cliquant sur “Je m’en occupe”.<br/>
            - Suivre les missions qui t'ont été assignées ou que tu as prises en charge. - Clôturer une mission une fois ta prière effectuée.<br/>
            Merci pour ton engagement 💛 Ta prière peut faire une vraie différence.
          </p>
        </div>


        <DashboardStats
          assignedMissions={assignedMissions.length}
          prayerRequests={prayerRequests.length}
          reservePrayer={reservePrayer.length}
          completedPrayers={completedPrayers.length}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <TabButton onClick={() => setActiveTab("assigned")} icon={FiBell} label="Missions assignées" />
          <TabButton onClick={() => setActiveTab("prayers")} icon={FiSearch} label="Explorer les prières" />
          <TabButton onClick={() => setActiveTab("missions")} icon={FiList} label="Voir mes missions" />          
          <TabButton onClick={() => setActiveTab("completed")} icon={FiCheck} label="Missions Terminés" />
        </div>
   
        {activeTab === "missions" && <MissionsPage />}
        {activeTab === "prayers" && <PrayersPage />}
        {activeTab === "assigned" && <AssignedPage />}
        {activeTab === "completed" && <CompletedMissionsPage />}
        

      {/*  <div className="bg-white rounded shadow p-4 border-l-4 border-pink-400 mt-10">
          <p className="text-sm text-gray-600 mb-2">🌿 Encouragement du jour</p>
          <blockquote className="italic text-gray-800">
            “La prière fervente du juste a une grande efficacité.” <br />
            <span className="text-pink-600">– Jacques 5:16</span>
          </blockquote>
        </div>

      */}

      </div>
    </div>
  );
};

export default VolunteerDashboard;
