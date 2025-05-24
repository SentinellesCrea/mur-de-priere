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
      const data = await fetchApi("/api/supervisor/testimony/moderation");
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
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
    });

    if (result.isConfirmed) {
      try {
        await fetchApi(`/api/supervisor/testimony/${id}`, {
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

  if (loading) {
    return <p className="text-center mt-20">Chargement...</p>;
  }

  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-semibold mb-4">💬 Modération des témoignages</h2>

      {moderations.length === 0 ? (
        <p>Aucun témoignage à modérer.</p>
      ) : (
        <ul className="space-y-4">
          {moderations.map((t) => (
            <li key={t._id} className="border rounded p-4 shadow bg-white">
              <span><strong>Nom :</strong> {t.firstName}</span>
              <p><strong>Témoignage :</strong> {t.testimony}</p>
              <p className="text-sm text-gray-500 italic">
                Reçu le : {new Date(t.datePublication).toLocaleDateString('fr-FR', {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleValidateTestimony(t._id)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Valider
                </button>
                <button
                  onClick={() => handleDeleteTestimony(t._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
