"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi"; // Helper sécurisé
import { useAutoRefresh } from "@/lib/useAutoRefresh";
import Swal from "sweetalert2";
import { FiCheckCircle, FiFlag, FiMessageCircle, FiXCircle } from "react-icons/fi";

export default function AdminTestimoniesPage() {
  const router = useRouter();
  const [moderations, setModerations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchModerations = async ({ silent = false } = {}) => {
    try {
      const data = await fetchApi("/api/supervisor/testimony/moderation");
      if (Array.isArray(data)) {
        setModerations(data);
      } else {
        console.error("Résultat inattendu :", data);
        if (!silent) {
          Swal.fire("Erreur", "Erreur lors du chargement des témoignages.", "error");
        }
      }
    } catch (err) {
      console.error("Erreur modération :", err.message);
      if (!silent) {
        Swal.fire("Erreur", "Erreur serveur lors du chargement.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleValidateTestimony = async (id) => {
    try {
      await fetchApi("/api/supervisor/testimony/moderation", {
        method: "PUT",
        body: { id },
      });

      Swal.fire("Validé", "Témoignage validé avec succès !", "success");
      fetchModerations(); // 🔄 Recharge la liste
    } catch (err) {
      console.error("Erreur validation témoignage :", err.message);
      Swal.fire("Erreur", "Erreur lors de la validation.", "error");
    }
  };

  const handleDeleteTestimony = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Le témoignage sera rejeté et ne sera pas publié.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, rejeter !',
    });

    if (result.isConfirmed) {
      try {
        await fetchApi(`/api/supervisor/testimony/${id}`, {
          method: "DELETE",
        });

        Swal.fire('Rejeté !', 'Le témoignage a été retiré de la modération.', 'success');
        fetchModerations();
      } catch (err) {
        console.error("Erreur suppression témoignage :", err.message);
        Swal.fire('Erreur', 'Une erreur est survenue.', 'error');
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
        await fetchModerations();
      } catch (error) {
        console.error("Erreur de vérification admin :", error.message);
        router.push("/volunteers/login");
      }
    }

    init();
  }, [router]);

  useAutoRefresh(() => fetchModerations({ silent: true }), {
    enabled: !loading,
    intervalMs: 9000,
  });

  if (loading) {
    return <p className="text-center py-16 text-gray-500 animate-pulse">Chargement des témoignages...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-sm rounded-[2rem] p-6 lg:p-8 border border-white/70 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <span className="size-12 rounded-2xl bg-[#FCE7F3] text-pink-600 flex items-center justify-center text-xl">
            <FiMessageCircle />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#5c40e7] mb-2">Modération</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Témoignages à modérer</h2>
            <p className="text-sm text-gray-600 mt-2">Valide les témoignages édifiants ou rejette ceux qui ne doivent pas être publiés.</p>
          </div>
        </div>
        <div className="rounded-[1.5rem] bg-[#FCE7F3] px-6 py-4 text-center">
          <p className="text-3xl font-extrabold text-gray-900">{moderations.length}</p>
          <p className="text-xs font-bold uppercase text-gray-500">à modérer</p>
        </div>
      </div>

      {moderations.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-10 text-center text-gray-500 border border-white/70 shadow-sm">
          Aucun témoignage à modérer.
        </div>
      ) : (
        <ul className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {moderations.map((t) => (
            <li key={t._id} className="border border-white/70 rounded-[2rem] p-6 shadow-sm bg-white">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">{t.firstName}</h3>
                  <p className="text-xs text-gray-500">
                    Reçu le : {new Date(t.date || t.createdAt).toLocaleDateString('fr-FR', {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#F1EEFF] text-[#5c40e7] text-[11px] font-extrabold flex items-center gap-1">
                  <FiFlag /> À vérifier
                </span>
              </div>

              <p className="text-sm text-gray-700 leading-6 bg-[#F7F7FB] rounded-2xl p-4">
                {t.testimony}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  onClick={() => handleValidateTestimony(t._id)}
                  className="bg-green-600 text-white px-4 py-3 rounded-2xl hover:bg-green-700 font-extrabold text-sm flex-1 inline-flex items-center justify-center gap-2"
                >
                  <FiCheckCircle /> Valider
                </button>
                <button
                  onClick={() => handleDeleteTestimony(t._id)}
                  className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl hover:bg-red-100 font-extrabold text-sm flex-1 inline-flex items-center justify-center gap-2"
                >
                  <FiXCircle /> Rejeter
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
