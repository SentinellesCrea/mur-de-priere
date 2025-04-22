"use client";
import { useState, useEffect } from "react";
import AdminNavbar from "../../components/AdminNavbar";

const AdminManageVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    // Récupérer les bénévoles validés
    async function fetchVolunteers() {
      try {
        const res = await fetch("/api/admin/volunteers/validate", {
          credentials: "include",  // Inclure les cookies d'authentification
        });
        const data = await res.json();

        if (Array.isArray(data)) {
          setVolunteers(data);  // Mettre à jour la liste des bénévoles
        } else {
          setFeedback(data.message);  // Afficher le message si aucun bénévole
        }
      } catch (err) {
        console.error("Erreur de récupération des bénévoles :", err);
        setFeedback("Une erreur est survenue.");
      }
    }

    fetchVolunteers();
  }, []);

  async function transformToAdmin(volunteerId) {
  const confirmTransform = window.confirm("Êtes-vous sûr de vouloir transformer ce bénévole en admin ?");

  if (!confirmTransform) return;  // Si l'utilisateur annule, ne rien faire

  try {
    const res = await fetch(`/api/admin/volunteer/transformToAdmin/${volunteerId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,  // Authentifier avec le token d'admin
      },
    });

    const data = await res.json();
    console.log(data.message);  // Afficher le message de succès ou d'erreur

    // Mettre à jour l'état ou donner un retour d'information à l'utilisateur
    setFeedback(data.message);
    fetchVolunteers();  // Rafraîchir la liste des bénévoles après transformation
  } catch (err) {
    console.error("Erreur de transformation du bénévole en admin :", err);
    setFeedback("Une erreur est survenue.");
  }
}


  return (
    <div className="w-full mt-40">
      <AdminNavbar />
      <div className="max-w-xl mx-auto p-6 bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Gérer les bénévoles</h2>
      
      {/* Menu déroulant pour sélectionner un bénévole */}
      <select
        onChange={(e) => {
          const selected = volunteers.find(
            (volunteer) => volunteer._id === e.target.value
          );
          setSelectedVolunteer(selected);  // Met à jour le bénévole sélectionné
        }}
        className="border px-4 py-2 rounded-md"
      >
        <option value="">Sélectionnez un bénévole</option>
        {volunteers.map((volunteer) => (
          <option key={volunteer._id} value={volunteer._id}>
            {volunteer.firstName} {volunteer.lastName}
          </option>
        ))}
      </select>

      {/* Afficher les informations du bénévole sélectionné */}
      {selectedVolunteer && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-md">
          <h3 className="font-semibold text-lg">{selectedVolunteer.firstName} {selectedVolunteer.lastName}</h3>
          <p><strong>Email :</strong> {selectedVolunteer.email}</p>
          <p><strong>Phone :</strong> {selectedVolunteer.phone}</p>
          <p><strong>Status :</strong> {selectedVolunteer.status}</p>
          <p><strong>Role :</strong> {selectedVolunteer.role}</p>

          {/* Bouton pour transformer en admin */}
          <button
            onClick={() => transformToAdmin(selectedVolunteer._id)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mt-4"
          >
            Transformer en Admin
          </button>
        </div>
      )}

      {/* Afficher le retour d'information */}
      {feedback && <p className="mt-4 text-red-500">{feedback}</p>}
    </div>
    </div>
  );
};

export default AdminManageVolunteers;