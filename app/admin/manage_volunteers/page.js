"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import Button from "../../components/ui/button";
import Swal from "sweetalert2";

export default function AdminManageVolunteersPage() {
  const router = useRouter();
  const [validatedVolunteers, setValidatedVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  const fetchAllValidatedVolunteers = async () => {
    try {
      const res = await fetchApi("/api/volunteers/all");
      if (Array.isArray(res)) {
        const filtered = res.filter((v) => v.role === "volunteer");
        setValidatedVolunteers(filtered);
      } else {
        setFeedback(res.message || "Erreur lors de la récupération des bénévoles");
      }
    } catch (err) {
      console.error("Erreur récupération bénévoles validés:", err.message);
      setFeedback("Erreur de récupération");
    } finally {
      setLoading(false);
    }
  };


  const deactivateVolunteer = async (volunteerId) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, désactiver !',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetchApi(`/api/admin/volunteers/validate/${volunteerId}`, {
          method: "PUT",
        });

        setFeedback(res.message || "Désactivation réussie");
        fetchAllValidatedVolunteers();
      } catch (err) {
        console.error("Erreur désactivation bénévole :", err.message);
        setFeedback("Erreur lors de la désactivation");
      }
    }
  };


  const promoteVolunteer = async (id) => {
      const result = await Swal.fire({
        title: "Promouvoir ce bénévole ?",
        text: "Il deviendra superviseur et pourra gérer des missions.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#aaa",
        confirmButtonText: "Oui, promouvoir",
      });

      if (result.isConfirmed) {
        try {
          const res = await fetchApi(`/api/admin/volunteers/promote/${id}`, {
            method: "PUT",
          });

          Swal.fire("Promu !", res.message || "Le bénévole est maintenant superviseur.", "success");
          fetchAllValidatedVolunteers(); // 🔄 recharge la liste
        } catch (err) {
          console.error("Erreur promotion :", err.message);
          setFeedback("Erreur lors de la promotion");
        }
      }
    };


  const deleteVolunteer = async (volunteerId) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetchApi(`/api/admin/volunteers/${volunteerId}`, {
          method: "DELETE",
        });

        Swal.fire('Supprimé !', 'Le bénévole a été supprimé.', 'success');
        setFeedback(res.message || "Suppression réussie");
        fetchAllValidatedVolunteers();
      } catch (err) {
        console.error("Erreur suppression bénévole :", err.message);
        setFeedback("Erreur lors de la suppression");
      }
    }
  };

  useEffect(() => {
    async function checkAdmin() {
      try {
        const admin = await fetchApi("/api/admin/me");
        if (!admin || !admin.firstName) {
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Erreur de vérification admin :", error.message);
        router.push("/admin/login");
      }
    }

    checkAdmin();
    fetchAllValidatedVolunteers();
  }, [router]);

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">✅ Gérer les bénévoles</h2>

      {loading ? (
        <p>Chargement...</p>
      ) : validatedVolunteers.length === 0 ? (
        <p className="text-gray-500">Aucun bénévole à gérer.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {validatedVolunteers.map((volunteer) => (
            <div
              key={volunteer._id}
              className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-between"
            >
              <div className="space-y-2 mb-4">
                <p className="text-gray-700 font-semibold text-lg">
                  {volunteer.firstName} {volunteer.lastName}
                </p>
                <p className="text-gray-600 text-sm"><strong>Email :</strong> {volunteer.email}</p>
                <p className="text-gray-600 text-sm"><strong>Téléphone :</strong> {volunteer.phone}</p>
                <p className="text-gray-600 text-sm"><strong>Statut :</strong> {volunteer.status}</p>
                <p className="text-gray-500 text-xs mt-2">
                  Créé le : {new Date(volunteer.date).toLocaleDateString('fr-FR')}
                </p>
              </div>

             <div className="flex gap-3 mt-auto">
              <Button
                onClick={() => deactivateVolunteer(volunteer._id)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white flex-1"
              >
                Désactiver
              </Button>

              <Button
                onClick={() => promoteVolunteer(volunteer._id)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
              >
                Promouvoir
              </Button>

              <Button
                onClick={() => deleteVolunteer(volunteer._id)}
                className="bg-red-600 hover:bg-red-700 text-white flex-1"
              >
                Supprimer
              </Button>
            </div>

            </div>
          ))}
        </div>
      )}

      {feedback && <p className="mt-6 text-center text-red-500">{feedback}</p>}
    </div>
  );
}
