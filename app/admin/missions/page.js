"use client";
import { useEffect, useState } from "react";

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [assignments, setAssignments] = useState({});

  const fetchMissions = async () => {
    try {
      const res = await fetch("/api/admin/missions");
      const data = await res.json();

      if (!res.ok) {
        console.error("Erreur API missions:", data.message);
        return;
      }

      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.datePublication) - new Date(a.datePublication))
        : [];
      setMissions(sorted);
    } catch (err) {
      console.error("Erreur missions:", err);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const res = await fetch("/api/admin/volunteers");
      const data = await res.json();

      if (!res.ok) {
        console.error("Erreur API bénévoles:", data.message);
        return;
      }

      if (!Array.isArray(data)) {
        console.error("Résultat inattendu:", data);
        return;
      }

      setVolunteers(data.filter(v => v.isValidated));
    } catch (err) {
      console.error("Erreur bénévoles:", err);
    }
  };

      const handleAssignVolunteer = async (prayerId, volunteerId) => {
        try {
          // Récupère le token d'admin depuis les cookies
          const adminToken = document.cookie.split('; ').find(row => row.startsWith('adminToken='));

          if (!adminToken) {
            alert("Token administrateur introuvable !");
            return;
          }

          // Extraire la valeur du cookie
          const tokenValue = adminToken.split('=')[1];

          const res = await fetch("/api/admin/assign-missions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokenValue}`, // Utilisation du token admin
            },
            body: JSON.stringify({
              volunteerId,
              prayerRequestIds: [prayerId], // Le tableau d'ID de prière
            }),
          });

          const data = await res.json();
          if (res.ok) {
            alert("Mission attribuée !");
            fetchMissions(); // Recharge les missions
          } else {
            alert(data.message || "Erreur lors de l’attribution.");
          }
        } catch (err) {
          console.error("Erreur d’attribution :", err);
        }
      };



  const isNew = (dateString) => {
    const now = new Date();
    const publishedDate = new Date(dateString);
    const diffInHours = (now - publishedDate) / (1000 * 60 * 60);
    return diffInHours < 24;
  };

  useEffect(() => {
    fetchMissions();
    fetchVolunteers();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">📤 Missions à attribuer</h2>
      {missions.length === 0 ? (
        <p>Aucune mission disponible.</p>
      ) : (
        <ul className="space-y-4">
          {missions.map((m) => (
            <li key={m._id} className="border rounded p-4">
              <div className="flex items-center gap-2">
                {isNew(m.datePublication) && (
                  <span className="text-xs text-white bg-green-600 px-2 py-1 rounded-full font-semibold">
                    Nouveau
                  </span>
                )}
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:gap-6 font-medium text-gray-800 mb-2">
                <span className="md:min-w-[25%]">
                  <strong>Nom :</strong> {m.name}
                </span>
                <span className="md:min-w-[35%]">
                  <strong>Email :</strong> {m.email}
                </span>
                <span className="md:min-w-[30%]">
                  <strong>Tél :</strong> {m.phone}
                </span>
              </div>
              <p><strong>Message :</strong> {m.prayerRequest}</p>
              <p className="text-sm text-gray-500">Catégorie : {m.category}</p>
              <p className="text-sm text-gray-500">Sous-catégorie : {m.subcategory}</p>
              {m.isUrgent && (
                <p className="text-sm font-bold text-red-600">🚨 Urgent</p>
              )}
              <p className="text-sm text-gray-500 italic">
                Reçue le : {new Date(m.datePublication).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>

              <div className="mt-4 flex items-end gap-2">
                <div className="flex flex-col w-48">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Choisir un bénévole :
                  </label>
                  <select
                    className="border rounded px-3 py-2"
                    value={assignments[m._id] || ""}
                    onChange={(e) =>
                      setAssignments({ ...assignments, [m._id]: e.target.value })
                    }
                  >
                    <option value="">-- Sélectionner --</option>
                    {volunteers.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.firstName} {v.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                {assignments[m._id] && (
                  <button
                    onClick={() => handleAssignVolunteer(m._id, assignments[m._id])}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Attribuer à ce bénévole
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}