"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi"; // ✅ Ton helper sécurisé
import Swal from "sweetalert2";
import Button from "../../components/ui/button";

export default function AdminVolunteersPendingPage() {
  const router = useRouter();
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingVolunteers = async () => {
    try {
      const data = await fetchApi("/api/admin/volunteers");
      if (Array.isArray(data)) {
        setPendingVolunteers(data.filter((v) => !v.isValidated));
      } else {
        console.error("Résultat inattendu :", data);
        Swal.fire("Erreur", "Erreur lors du chargement des bénévoles.", "error");
      }
    } catch (err) {
      console.error("Erreur bénévoles en attente :", err.message);
      Swal.fire("Erreur", "Erreur serveur lors du chargement.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id) => {
    try {
      await fetchApi(`/api/admin/volunteers/validate/${id}`, {
        method: "PATCH",
      });

      Swal.fire('✅ Validé', 'Le bénévole a été validé avec succès.', 'success');
      fetchPendingVolunteers();
    } catch (err) {
      console.error("Erreur validation bénévole :", err.message);
      Swal.fire('Erreur', err.message || "Erreur lors de la validation.", 'error');
    }
  };

  const handleReject = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, rejeter !',
    });

    if (result.isConfirmed) {
      try {
        await fetchApi(`/api/admin/volunteers/reject/${id}`, {
          method: "PATCH",
        });

        Swal.fire('❌ Rejeté', 'Le bénévole a été rejeté.', 'success');
        fetchPendingVolunteers();
      } catch (err) {
        console.error("Erreur rejet bénévole :", err.message);
        Swal.fire('Erreur', err.message || "Erreur lors du rejet.", 'error');
      }
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const admin = await fetchApi("/api/admin/me");
        if (!admin || !admin.firstName) {
          router.push("/admin/login");
          return;
        }
        await fetchPendingVolunteers();
      } catch (error) {
        console.error("Erreur vérification admin :", error.message);
        router.push("/admin/login");
      }
    }

    init();
  }, [router]);

  if (loading) {
    return <p className="text-center mt-20">Chargement...</p>;
  }

  return (
    <div className="px-4 py-6">
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">👥 Bénévoles en attente de validation</h2>

        {pendingVolunteers.length === 0 ? (
          <p className="text-gray-500">Aucun bénévole en attente.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingVolunteers.map((v) => (
              <div
                key={v._id}
                className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-between"
              >
                <div className="space-y-2 mb-4">
                  <p className="text-gray-700 font-semibold text-lg">
                    {v.firstName} {v.lastName}
                  </p>
                  <p className="text-gray-600 text-sm"><strong>Email :</strong> {v.email}</p>
                  <p className="text-gray-600 text-sm"><strong>Téléphone :</strong> {v.phone}</p>                 
                  <p className="text-gray-500 text-xs mt-2">
                    Inscription : {new Date(v.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div className="flex gap-3 mt-auto">
                  <Button
                    onClick={() => handleValidate(v._id)}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  >
                    Valider
                  </Button>
                  <Button
                    onClick={() => handleReject(v._id)}
                    className="bg-red-600 hover:bg-red-700 text-white flex-1"
                  >
                    Rejeter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

}
