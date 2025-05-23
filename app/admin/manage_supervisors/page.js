"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import Button from "../../components/ui/button";
import Swal from "sweetalert2";

export default function AdminManageSupervisorsPage() {
  const router = useRouter();
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  const fetchSupervisors = async () => {
    try {
      const res = await fetchApi("/api/volunteers/all");
      if (Array.isArray(res)) {
        const filtered = res.filter((v) => v.role === "supervisor");
        setSupervisors(filtered);
      } else {
        setFeedback(res.message || "Erreur lors de la récupération des superviseurs");
      }
    } catch (err) {
      console.error("Erreur récupération superviseurs:", err.message);
      setFeedback("Erreur de récupération");
    } finally {
      setLoading(false);
    }
  };

  const deactivateSupervisor = async (id) => {
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
        const res = await fetchApi(`/api/admin/volunteers/validate/${id}`, {
          method: "PUT",
        });

        setFeedback(res.message || "Désactivation réussie");
        fetchSupervisors();
      } catch (err) {
        console.error("Erreur désactivation superviseur :", err.message);
        setFeedback("Erreur lors de la désactivation");
      }
    }
  };

  const deleteSupervisor = async (id) => {
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
        const res = await fetchApi(`/api/admin/volunteers/${id}`, {
          method: "DELETE",
        });

        Swal.fire('Supprimé !', 'Le superviseur a été supprimé.', 'success');
        setFeedback(res.message || "Suppression réussie");
        fetchSupervisors();
      } catch (err) {
        console.error("Erreur suppression superviseur :", err.message);
        setFeedback("Erreur lors de la suppression");
      }
    }
  };


  const downgradeSupervisor = async (id) => {
    const result = await Swal.fire({
      title: 'Rétrograder ce superviseur ?',
      text: "Il redeviendra un bénévole classique.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Oui, rétrograder',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetchApi(`/api/admin/volunteers/role/${id}`, {
          method: "PUT",
          body: { role: "volunteer" }, // ✅ on change son rôle
        });

        Swal.fire('Rétrogradé !', res.message || "Le superviseur est maintenant bénévole.", 'success');
        fetchSupervisors(); // 🔄 recharge la liste
      } catch (err) {
        console.error("Erreur rétrogradation :", err.message);
        setFeedback("Erreur lors de la rétrogradation");
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
    fetchSupervisors();
  }, [router]);

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">👤 Gérer les superviseurs</h2>

      {loading ? (
        <p>Chargement...</p>
      ) : supervisors.length === 0 ? (
        <p className="text-gray-500">Aucun superviseur à gérer.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {supervisors.map((supervisor) => (
            <div
              key={supervisor._id}
              className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-between"
            >
              <div className="space-y-2 mb-4">
                <p className="text-gray-700 font-semibold text-lg">
                  {supervisor.firstName} {supervisor.lastName}
                </p>
                <p className="text-gray-600 text-sm"><strong>Email :</strong> {supervisor.email}</p>
                <p className="text-gray-600 text-sm"><strong>Téléphone :</strong> {supervisor.phone}</p>
                <p className="text-gray-600 text-sm"><strong>Statut :</strong> {supervisor.status}</p>
                <p className="text-gray-500 text-xs mt-2">
                  Créé le : {new Date(supervisor.date).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="flex gap-3 mt-auto">
                <Button
                  onClick={() => deactivateSupervisor(supervisor._id)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white flex-1"
                >
                  Désactiver
                </Button>

                <Button
                  onClick={() => downgradeSupervisor(supervisor._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  Rétrograder
                </Button>

                <Button
                  onClick={() => deleteSupervisor(supervisor._id)}
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
