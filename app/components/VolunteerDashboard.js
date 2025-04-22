"use client";

import { useEffect, useState } from "react";
import { FiLogOut, FiUser, FiHome } from "react-icons/fi";
import Button from "../components/ui/button";
import { FiUserCheck, FiInbox, FiSearch, FiPhoneCall, FiArrowLeftCircle, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { MdLocalPhone, MdOutlineEmail } from "react-icons/md";
import usePrayerRequestStore from "../store/prayerRequestStore";
import useVolunteerStore from "../store/VolunteerStore";
import VolunteerNavbar from "../components/VolunteerNavbar";
import { useRouter } from "next/navigation";
import ToggleSwitch from '../components/ToggleSwitch';

const VolunteerDashboard = () => {
  const [missionsCount, setMissionsCount] = useState(0);
  const [availablePrayersCount, setAvailablePrayersCount] = useState(0);
  const [handledPrayersCount, setHandledPrayersCount] = useState(0);
  const [volunteerName, setVolunteerName] = useState("Bénévole");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [assignedMissions, setAssignedMissions] = useState([]);
  const [completedPrayers, setCompletedPrayers] = useState([]);
  const [myMissions, setMyMissions] = useState([]);
  const [missionTab, setMissionTab] = useState("todo"); // "todo" ou "done"
  const [isAvailable, setIsAvailable] = useState(false);
  
  const { missionsDone } = usePrayerRequestStore();
  const { prayerRequests, fetchPrayerRequests, reservePrayer } = usePrayerRequestStore();
  const { volunteer } = useVolunteerStore();

  useEffect(() => {
    if (volunteer) {
      const fullName = [volunteer.firstName, volunteer.lastName].filter(Boolean).join(" ");
      setVolunteerName(fullName || "Bénévole");
      setLoading(false);
    }
  }, [volunteer]);

  useEffect(() => {
    fetchPrayerRequests();
  }, [fetchPrayerRequests]);

  useEffect(() => {
  if (missionsDone && Array.isArray(missionsDone)) {
    setHandledPrayersCount(missionsDone.length);
    }
  }, [missionsDone]);


  useEffect(() => {
    const fetchMissions = async () => {
      const res = await fetch("/api/volunteers/missions");
      const data = await res.json();
      setMyMissions(data); // Mettre à jour avec les missions récupérées
    };

    fetchMissions();
  }, []);

  const getCompletedPrayers = () => {
  return prayerRequests.filter((prayer) => prayer.finishedBy === volunteer._id);
  };

  useEffect(() => {
  async function fetchAssignedMissions() {
    try {
      const res = await fetch("/api/volunteers/assignedMissions", { credentials: "include" });

      // Vérification du statut de la réponse avant de tenter de la parser
      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }

      // Vérification si la réponse a un corps (pas vide)
      const text = await res.text();
      if (!text) {
        throw new Error("Réponse vide du serveur");
      }

      const data = JSON.parse(text);  // Parser la réponse

      if (Array.isArray(data)) {
        setAssignedMissions(data);  // Si c'est un tableau, mettre à jour l'état
      } else {
        console.error("⚠️ Résultat inattendu des missions :", data);
        setAssignedMissions([]);  // Réinitialiser les missions en cas de résultat inattendu
      }
    } catch (err) {
      console.error("Erreur de chargement des missions :", err);
      setAssignedMissions([]); // Fallback en cas d'erreur
    }
  }

  fetchAssignedMissions();
}, []);  // Le useEffect se déclenche une fois au montage du composant



  const handleTakePrayer = async (id) => {
  try {
    const res = await fetch("/api/volunteers/reserve-prayer", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("La prière a été ajoutée à vos missions 🙏");
      fetchPrayerRequests(); // refresh de la liste
    } else {
      alert(data.message || "Erreur lors de la réservation");
    }
  } catch (err) {
    console.error("Erreur prise de mission :", err);
    alert("Erreur côté réseau ou serveur");
  }
};


const handleAcceptMission = async (prayerId, accepted) => {
  try {
    const res = await fetch(`/api/volunteers/accept-mission/${prayerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include", // important si tu utilises les cookies sécurisés
      body: JSON.stringify({ accepted })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Erreur serveur :", data.message || "Échec de la mise à jour.");
      return;
    }

    alert(
      accepted
        ? "🙏 Merci ! La mission a été ajoutée à vos prières à faire."
        : "La mission a été refusée et libérée pour d'autres bénévoles."
    );

    // 🔁 Recharge les missions assignées après action
    fetchAssignedMissions(); // s'assurer que tu as bien cette fonction dans ton useEffect
    fetchPrayerRequests();   // s'assurer que les prières disponibles sont mises à jour
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la mission :", err);
  }
};

const markMissionAsDone = async (prayerRequestId) => {
  try {
    const volunteerId = volunteer._id;  // Utilise l'ID du bénévole actuel

    // Appelle l'API pour mettre à jour la prière comme terminée
    const res = await fetch("/api/volunteers/mark-prayer-done", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        prayerRequestId,
        volunteerId,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Prière marquée comme terminée !");
      // Réactualise les missions (par exemple)
      fetchPrayerRequests(); // Optionnel : recharge les prières disponibles
    } else {
      alert(data.message || "Erreur lors de la mise à jour de la mission.");
    }
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la prière :", err);
    alert("Erreur lors de la mise à jour de la prière");
  }
};

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        // Appel de l'API pour récupérer la disponibilité
        const res = await fetch('/api/volunteers/getAvailability');
        if (!res.ok) {
          throw new Error('Erreur lors de la récupération de la disponibilité');
        }

        const data = await res.json();
        setIsAvailable(data.isAvailable);  // Met à jour l'état avec la disponibilité
      } catch (error) {
        console.error('Erreur:', error);  // Affiche l'erreur dans la console
      }
    };

    fetchAvailability();
  }, []);

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



  return (
    <div className="w-full">
      <VolunteerNavbar />
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


        {activeTab === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-pink-100 rounded shadow">
                <p className="text-sm text-gray-600">🔔 Missions assignées</p>
                <h3 className="text-xl font-bold text-pink-700">{assignedMissions.length}</h3>
              </div>
              <div className="p-4 bg-blue-100 rounded shadow">
                <p className="text-sm text-gray-600">🙏 Prières disponibles</p>
                <h3 className="text-xl font-bold text-blue-700">{prayerRequests.length}</h3>
              </div>
              <div className="p-4 bg-green-100 rounded shadow">
                <p className="text-sm text-gray-600">📂 Historique de prières</p>
                <h3 className="text-xl font-bold text-green-700">{getCompletedPrayers.length}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Button onClick={() => setActiveTab("prayers")} className="w-full bg-[#d4967d] text-white flex items-center justify-center gap-2">
                <FiSearch /> Explorer les prières
              </Button>
              <Button onClick={() => setActiveTab("missions")} className="w-full bg-[#d4967d] text-white flex items-center justify-center gap-2">
                <FiInbox /> Voir mes missions
              </Button>
              <Button onClick={() => setActiveTab("assigned")} className="w-full bg-[#d4967d] text-white flex items-center justify-center gap-2">
                <FiUserCheck /> Missions assignées
              </Button>
            </div>

            <div className="bg-white rounded shadow p-4 border-l-4 border-pink-400">
              <p className="text-sm text-gray-600 mb-2">🌿 Encouragement du jour</p>
              <blockquote className="italic text-gray-800">
                “La prière fervente du juste a une grande efficacité.” <br />
                <span className="text-pink-600">– Jacques 5:16</span>
              </blockquote>
            </div>
          </>
        )}


        {activeTab === "prayers" && (
            <div className="p-4 bg-gray-50 rounded shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">🔎 Explorer les prières</h2>
                <Button
                  onClick={() => setActiveTab("dashboard")}
                  className="bg-gray-400 text-gray-800 hover:bg-gray-300 px-4 py-2 flex items-center gap-2 rounded"
                >
                  <FiArrowLeftCircle />
                  Retour à l'accueil
                </Button>
              </div>

              {[...prayerRequests]
                .filter((prayer) => !prayer.assignedTo && !prayer.reserveTo) // ❌ exclut les prières déjà assignées
                .sort((a, b) => {
                  if (a.isUrgent === b.isUrgent) {
                    return new Date(b.datePublication) - new Date(a.datePublication);
                  }
                  return b.isUrgent - a.isUrgent;
                })
                .map((prayer) => (
                  <div key={prayer._id} className="p-4 rounded-lg shadow bg-white border-l-4 border-blue-400 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-blue-700">{prayer.name}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(prayer.datePublication).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <p className="text-gray-800 mb-1">{prayer.prayerRequest}</p>
                    <p className="text-sm text-gray-500">Catégorie : {prayer.category}</p>
                    <p className="text-sm text-gray-500">Sous-catégorie : {prayer.subcategory}</p>
                    {prayer.isUrgent && <p className="text-sm font-bold text-red-600">🚨 Urgent</p>}
                    <Button
                      onClick={() => handleTakePrayer(prayer._id)}
                      className="mt-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Je m&apos;en occupe
                    </Button>
                  </div>
                ))}
            </div>
          )}


          {activeTab === "missions" && (
                <div className="p-4 bg-gray-50 rounded shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">📁 Mes missions</h2>
                    <Button
                      onClick={() => setActiveTab("dashboard")}
                      className="bg-gray-400 text-gray-800 hover:bg-gray-300 px-4 py-2 flex items-center gap-2 rounded"
                    >
                      <FiArrowLeftCircle />
                      Retour à l'accueil
                    </Button>
                  </div>

                  <div className="flex space-x-4 mb-6">
                    <button
                      onClick={() => setMissionTab("todo")}
                      className={`px-4 py-2 rounded ${
                        missionTab === "todo" ? "bg-[#d4967d] text-white" : "bg-gray-200"
                      }`}
                    >
                      À faire
                    </button>
                    <button
                      onClick={() => setMissionTab("done")}
                      className={`px-4 py-2 rounded ${
                        missionTab === "done" ? "bg-[#d4967d] text-white" : "bg-gray-200"
                      }`}
                    >
                      Missions terminées
                    </button>
                  </div>

                  {missionTab === "todo" ? (
                    myMissions.length === 0 ? (
                      <p className="text-gray-500">Aucune mission à faire pour le moment.</p>
                    ) : (
                      myMissions.map((prayer) => (
                        <div
                          key={prayer._id}
                          className="p-4 rounded-lg shadow bg-white border-l-4 border-yellow-400 mb-4"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-yellow-700">
                              🙏 {prayer.name}
                            </h3>
                            <span className="text-l text-gray-500">
                              {new Date(prayer.datePublication).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                          <p className="text-gray-700"><strong>✉️ Email :</strong> {prayer.email}</p>
                          {prayer.phone && (
                            <p className="text-gray-700">
                              <strong>📞 Téléphone :</strong> {prayer.phone}
                            </p>
                          )}
                          <p className="text-gray-800 my-2">
                            <strong>📝 Demande :</strong> {prayer.prayerRequest}
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>📂 Catégorie :</strong> {prayer.category}
                          </p>
                          {prayer.subcategory && (
                            <p className="text-sm text-gray-500">
                              <strong>📁 Sous-catégorie :</strong> {prayer.subcategory}
                            </p>
                          )}
                          {prayer.isUrgent && (
                            <p className="text-sm font-bold text-red-600 mt-2">🚨 Urgent</p>
                          )}
                          <div className="mt-4 flex justify-end">
                            <Button
                              className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 text-sm"
                              onClick={() => markMissionAsDone(prayer._id)}
                            >
                              ✅ Marquer comme terminé
                            </Button>
                          </div>

                        </div>
                      ))
                    )
                  ) : (
                    completedPrayers.length === 0 ? (
                      <p className="text-gray-500">Aucune mission terminée.</p>
                    ) : (
                      completedPrayers.map((prayer, index) => (
                        <div
                          key={`${prayer._id}-${index}`} // Combinaison de l'ID et de l'index pour garantir l'unicité
                          className="p-4 rounded-lg shadow bg-white border-l-4 border-green-400 mb-4"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-green-700">
                              🙌 {prayer.name}
                            </h3>
                            <span className="text-l text-gray-500">
                              {new Date(prayer.datePublication).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                          <p className="text-gray-700"><strong>✉️ Email :</strong> {prayer.email}</p>
                          {prayer.phone && (
                            <p className="text-gray-700">
                              <strong>📞 Téléphone :</strong> {prayer.phone}
                            </p>
                          )}
                          <p className="text-gray-800 my-2">
                            <strong>📝 Demande :</strong> {prayer.prayerRequest}
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>📂 Catégorie :</strong> {prayer.category}
                          </p>
                          {prayer.subcategory && (
                            <p className="text-sm text-gray-500">
                              <strong>📁 Sous-catégorie :</strong> {prayer.subcategory}
                            </p>
                          )}
                          {prayer.isUrgent && (
                            <p className="text-sm font-bold text-red-600 mt-2">🚨 Urgent</p>
                          )}
                        </div>
                      ))
                    )
                  )}
                </div>
              )}



        {activeTab === "assigned" && (
          <div className="p-4 bg-gray-50 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">📌 Missions assignées par l’admin</h2>
              <Button
                onClick={() => setActiveTab("dashboard")}
                className="bg-gray-400 text-gray-800 hover:bg-gray-300 px-4 py-2 flex items-center gap-2 rounded"
              >
                <FiArrowLeftCircle />
                Retour à l'accueil
              </Button>

            </div>

            {assignedMissions.length === 0 ? (
                <p className="text-gray-500">Aucune mission assignée pour le moment.</p>
              ) : (
                assignedMissions.map((mission) => (
                  <div key={mission._id} className="p-4 rounded-lg shadow bg-white border-l-4 border-purple-400 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold italic text-purple-700">
                        - {mission.name}
                      </h3>
                      <span className="text-m text-gray-500">
                        {new Date(mission.datePublication).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{mission.prayerRequest}</p>
                    <div className="text-m text-gray-500 flex items-center gap-2">
                        <MdLocalPhone />
                        <span>{mission.phone || "Numéro non fourni"}</span>
                      </div>

                      <div className="text-m text-gray-500 flex items-center gap-2">
                        <MdOutlineEmail />
                        <span>{mission.email || "Email non fourni"}</span>
                    </div>

                    <div className="flex justify-center gap-4 mt-4">
                        <button
                          onClick={() => handleAcceptMission(mission._id, true)}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          ✅ J'accepte
                        </button>
                        <button
                          onClick={() => handleAcceptMission(mission._id, false)}
                          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                        >
                          ❌ Je refuse
                        </button>
                    </div>


                  </div>
                ))
              )}


          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
