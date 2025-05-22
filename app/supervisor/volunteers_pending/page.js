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
      await fetchApi(`/api/supervisor/volunteers/validate/${id}`, {
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
        await fetchApi(`/api/supervisor/volunteers/reject/${id}`, {
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
        const admin = await fetchApi("/api/supervisor/me");
        if (!admin || !admin.firstName) {
          router.push("/volunteers/login");
          return;
        }
        await fetchPendingVolunteers();
      } catch (error) {
        console.error("Erreur vérification admin :", error.message);
        router.push("/volunteers/login");
      }
    }

    init();
  }, [router]);

  if (loading) {
    return <p className="text-center mt-20">Chargement...</p>;
  }

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">👥 Bénévoles en attente</h2>

      {pendingVolunteers.length === 0 ? (
        <p>Aucun bénévole en attente.</p>
      ) : (
        <ul className="space-y-2">
          {pendingVolunteers.map((v) => (
            <li key={v._id} className="border rounded p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{v.firstName} ({v.email})</p>
                <p className="text-sm text-gray-500">Téléphone : {v.phone}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-green-600 text-white"
                  onClick={() => handleValidate(v._id)}
                >
                  Valider
                </Button>
                <Button
                  className="bg-red-600 text-white"
                  onClick={() => handleReject(v._id)}
                >
                  Rejeter
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
