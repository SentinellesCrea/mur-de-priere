"use client";
import { useEffect, useState } from "react";
import Button from "../../components/ui/button";
import Swal from "sweetalert2";

export default function AdminManageVolunteersPage() {
  const [validatedVolunteers, setValidatedVolunteers] = useState([]);
  const [volunteer, setVolunteers] = useState([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem("adminToken") : null;

  const fetchValidatedVolunteers = async () => {
    try {
      const res = await fetch("/api/admin/volunteers", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setValidatedVolunteers(Array.isArray(data) ? data.filter(v => v.isValidated) : []);
    } catch (err) {
      console.error("Erreur bénévoles validés:", err);
    }
  };

  async function deactivateVolunteer(volunteerId) {
    // Afficher une boîte de confirmation avec SweetAlert2
  const result = await Swal.fire({
    title: 'Êtes-vous sûr ?',
    text: "Vous ne pourrez pas revenir en arrière !",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Oui, supprimer !',
  });

  if (result.isConfirmed) {
  try {
    const res = await fetch(`/api/admin/volunteers/validate/${volunteerId}`, {
      method: "PUT",  // Utilisation de la méthode PUT
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,  // Utilisation du token d'admin
      },
    });

    const data = await res.json();
    console.log(data.message);  // Afficher le message de succès ou d'erreur

    // Mettre à jour l'état ou donner un retour d'information à l'utilisateur
    setFeedback(data.message);
    fetchVolunteers();  // Rafraîchir la liste des bénévoles après désactivation
  } catch (err) {
    console.error("Erreur de connexion avec l'API :", err);
    setFeedback("Une erreur est survenue.");
  }
}
}
  
    async function deleteVolunteer(volunteerId) {
  // Afficher une boîte de confirmation avec SweetAlert2
  const result = await Swal.fire({
    title: 'Êtes-vous sûr ?',
    text: "Vous ne pourrez pas revenir en arrière !",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Oui, supprimer !',
  });

  if (result.isConfirmed) {
    try {
      const res = await fetch(`/api/admin/volunteers/${volunteerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      const data = await res.json();
      Swal.fire(
        'Désactivé !',
        'Le bénévole a été désactivé.',
        'success'
      );

      // Mettre à jour l'état ou donner un retour d'information à l'utilisateur
      setFeedback(data.message);
      fetchVolunteers();  // Rafraîchir la liste des bénévoles après suppression
    } catch (err) {
      console.error("Erreur de suppression du bénévole :", err);
      setFeedback("Une erreur est survenue.");
    }
  } else {
    console.log("Suppression annulée");
  }
}



  useEffect(() => {
    fetchValidatedVolunteers();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">✅ Gérer les bénévoles</h2>
      {validatedVolunteers.length === 0 ? (
        <p>Aucun bénévole à gérer.</p>
      ) : (
        <ul className="space-y-2">
          {validatedVolunteers.map((v) => (
            <li key={v._id} className="border rounded p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{v.firstName} ({v.email})</p>
                <p className="text-sm text-gray-500">Téléphone : {v.phone}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => deactivateVolunteer(volunteer._id)}
                  className="bg-yellow-600 text-white">

                  Désactiver
                </Button>

                <Button 
                  onClick={() => deleteVolunteer(volunteer._id)}
                  className="bg-red-600 text-white">

                  Supprimer
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
