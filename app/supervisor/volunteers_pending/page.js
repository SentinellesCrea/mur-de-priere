"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi"; // ✅ Ton helper sécurisé
import { useAutoRefresh } from "@/lib/useAutoRefresh";
import Swal from "sweetalert2";
import Button from "../../components/ui/button";
import { FiCheckCircle, FiClock, FiMail, FiPhone, FiUserPlus, FiXCircle } from "react-icons/fi";

export default function AdminVolunteersPendingPage() {
  const router = useRouter();
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingVolunteers = async ({ silent = false } = {}) => {
    try {
      const data = await fetchApi("/api/supervisor/volunteers/pending");
      if (Array.isArray(data)) {
        setPendingVolunteers(data.filter((v) => !v.isValidated));
      } else {
        console.error("Résultat inattendu :", data);
        if (!silent) {
          Swal.fire("Erreur", "Erreur lors du chargement des bénévoles.", "error");
        }
      }
    } catch (err) {
      console.error("Erreur bénévoles en attente :", err.message);
      if (!silent) {
        Swal.fire("Erreur", "Erreur serveur lors du chargement.", "error");
      }
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
      text: "Le bénévole sera rejeté et désactivé.",
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

  useAutoRefresh(() => fetchPendingVolunteers({ silent: true }), {
    enabled: !loading,
    intervalMs: 9000,
  });

  if (loading) {
    return <p className="text-center py-16 text-gray-500 animate-pulse">Chargement des validations...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-sm rounded-[2rem] p-6 lg:p-8 border border-white/70 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <span className="size-12 rounded-2xl bg-[#FEF9C3] text-amber-600 flex items-center justify-center text-xl">
            <FiUserPlus />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#5c40e7] mb-2">Validations</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Bénévoles en attente</h2>
            <p className="text-sm text-gray-600 mt-2">Valide uniquement les profils qui peuvent rejoindre l’équipe de prière.</p>
          </div>
        </div>
        <div className="rounded-[1.5rem] bg-[#FEF9C3] px-6 py-4 text-center">
          <p className="text-3xl font-extrabold text-gray-900">{pendingVolunteers.length}</p>
          <p className="text-xs font-bold uppercase text-gray-500">à traiter</p>
        </div>
      </div>

        {pendingVolunteers.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-10 text-center text-gray-500 border border-white/70 shadow-sm">
            Aucun bénévole en attente.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {pendingVolunteers.map((v) => (
              <div
                key={v._id}
                className="bg-white shadow-sm rounded-[2rem] p-6 flex flex-col justify-between border border-white/70"
              >
                <div className="space-y-4 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="size-12 rounded-2xl bg-[#F1EEFF] text-[#5c40e7] flex items-center justify-center">
                      <FiClock />
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[11px] font-extrabold">
                      En attente
                    </span>
                  </div>
                  <p className="text-gray-900 font-extrabold text-lg">
                    {v.firstName} {v.lastName}
                  </p>
                  <p className="flex items-center gap-2 text-gray-600 text-sm"><FiMail className="text-[#5c40e7]" /> {v.email || "Email non fourni"}</p>
                  <p className="flex items-center gap-2 text-gray-600 text-sm"><FiPhone className="text-[#5c40e7]" /> {v.phone || "Téléphone non fourni"}</p>                 
                  <p className="text-gray-500 text-xs mt-2">
                    Inscription : {new Date(v.date || v.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div className="flex gap-3 mt-auto">
                  <Button
                    onClick={() => handleValidate(v._id)}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1 rounded-2xl py-3"
                  >
                    <FiCheckCircle /> Valider
                  </Button>
                  <Button
                    onClick={() => handleReject(v._id)}
                    className="bg-red-600 hover:bg-red-700 text-white flex-1 rounded-2xl py-3"
                  >
                    <FiXCircle /> Rejeter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );

}
