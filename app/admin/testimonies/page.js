"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi"; // Helper sécurisé
import Swal from "sweetalert2";

export default function AdminTestimoniesPage() {
  const router = useRouter();
  const [moderations, setModerations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchModerations = async () => {
    try {
      const data = await fetchApi("/api/admin/testimony/moderation");
      if (Array.isArray(data)) {
        setModerations(data);
      } else {
        console.error("Résultat inattendu :", data);
        Swal.fire("Erreur", "Erreur lors du chargement des témoignages.", "error");
      }
    } catch (err) {
      console.error("Erreur modération :", err.message);
      Swal.fire("Erreur", "Erreur serveur lors du chargement.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleValidateTestimony = async (id) => {
    try {
      await fetchApi("/api/admin/testimony/moderation", {
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
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
    });

    if (result.isConfirmed) {
      try {
        await fetchApi(`/api/admin/testimony/${id}`, {
          method: "DELETE",
        });

        Swal.fire('Supprimé !', 'Le témoignage a été supprimé.', 'success');
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
        const admin = await fetchApi("/api/admin/me");

        if (!admin || !admin.firstName) {
          router.push("/admin/login");
          return;
        }
        await fetchModerations();
      } catch (error) {
        console.error("Erreur de vérification admin :", error.message);
        router.push("/admin/login");
      }
    }

    init();
  }, [router]);

  if (loading) {
    return <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">Chargement...</p>;
  }

  return (
    <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">
            Modération
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">Témoignages</h2>
          <p className="mt-1 text-sm text-slate-600">
            Relis et publie les témoignages prêts à apparaître sur le site.
          </p>
        </div>
        <div className="rounded-lg bg-cyan-100 px-4 py-3 text-sm font-bold text-cyan-800">
          {moderations.length} à modérer
        </div>
      </div>

      {moderations.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
          Aucun témoignage à modérer.
        </p>
      ) : (
        <ul className="space-y-4">
          {moderations.map((t) => (
            <li key={t._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-sm font-bold text-slate-950">{t.firstName || "Anonyme"}</span>
              <p className="mt-3 text-sm leading-6 text-slate-700">{t.testimony}</p>
              <p className="mt-3 text-xs text-slate-500">
                Reçu le : {new Date(t.datePublication).toLocaleDateString('fr-FR', {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleValidateTestimony(t._id)}
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                  Valider
                </button>
                <button
                  onClick={() => handleDeleteTestimony(t._id)}
                  className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
