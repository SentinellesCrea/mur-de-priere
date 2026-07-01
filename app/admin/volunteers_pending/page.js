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
    return <p className="rounded-lg border border-[#eadfd3] bg-[#fffaf5] p-6 text-center text-[#7a6b5f]">Chargement...</p>;
  }

  return (
    <section className="space-y-5 rounded-lg border border-[#eadfd3] bg-[#fffaf5] p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C76A2A]">
            Validation
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#2f2a26]">Bénévoles en attente</h2>
          <p className="mt-1 text-sm text-[#6B5B4D]">
            Vérifie les nouvelles inscriptions avant de leur ouvrir l&apos;accès.
          </p>
        </div>
        <div className="rounded-lg bg-[#FFF4E8] px-4 py-3 text-sm font-bold text-[#9A4B16]">
          {pendingVolunteers.length} en attente
        </div>
      </div>

        {pendingVolunteers.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#d9c7b8] bg-white p-8 text-center text-[#7a6b5f]">
            Aucun bénévole en attente.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {pendingVolunteers.map((v) => (
              <div
                key={v._id}
                className="flex flex-col justify-between rounded-lg border border-[#eadfd3] bg-white p-5 shadow-sm"
              >
                <div className="space-y-2 mb-4">
                  <p className="text-lg font-bold text-[#2f2a26]">
                    {v.firstName} {v.lastName}
                  </p>
                  <p className="text-sm text-[#6B5B4D]"><strong>Email :</strong> {v.email}</p>
                  <p className="text-sm text-[#6B5B4D]"><strong>Téléphone :</strong> {v.phone}</p>
                  <p className="mt-2 text-xs text-[#7a6b5f]">
                    Inscription : {new Date(v.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div className="mt-auto flex flex-col gap-2 sm:flex-row">
                  <Button
                    onClick={() => handleValidate(v._id)}
                    className="flex-1 rounded-lg bg-[#5F8A61] text-white hover:bg-[#4d744f]"
                  >
                    Valider
                  </Button>
                  <Button
                    onClick={() => handleReject(v._id)}
                    className="flex-1 rounded-lg bg-[#A3193F] text-white hover:bg-[#871433]"
                  >
                    Rejeter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
    </section>
  );

}
