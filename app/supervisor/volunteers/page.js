"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi"; // Ton helper sécurisé
import Swal from "sweetalert2";

export default function VolunteersValidationPage() {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVolunteers = async () => {
    try {
      const data = await fetchApi("/api/supervisor/volunteers/pending");
      if (Array.isArray(data)) {
        setVolunteers(data);
      } else {
        console.error("Résultat inattendu :", data);
        Swal.fire("Erreur", "Erreur lors du chargement des bénévoles.", "error");
      }
    } catch (error) {
      console.error("Erreur chargement bénévoles :", error.message);
      Swal.fire("Erreur", "Erreur serveur lors du chargement.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id) => {
    try {
      await fetchApi(`/api/supervisor/volunteers/validate/${id}`, {
        method: "POST",
      });

      Swal.fire("Succès", "Bénévole validé avec succès ✅", "success");
      fetchVolunteers();
    } catch (error) {
      console.error("Erreur validation bénévole :", error.message);
      Swal.fire("Erreur", error.message || "Erreur lors de la validation.", "error");
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
          method: "POST",
        });

        Swal.fire("Supprimé", "Bénévole rejeté avec succès.", "success");
        fetchVolunteers();
      } catch (error) {
        console.error("Erreur rejet bénévole :", error.message);
        Swal.fire("Erreur", error.message || "Erreur lors du rejet.", "error");
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
        await fetchVolunteers();
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
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Validation des Bénévoles</h1>

      {volunteers.length === 0 ? (
        <p>Aucun bénévole en attente.</p>
      ) : (
        <ul className="space-y-4">
          {volunteers.map((v) => (
            <li key={v._id} className="border p-4 rounded shadow">
              <p><strong>Prénom :</strong> {v.firstName}</p>
              <p><strong>Email :</strong> {v.email}</p>

              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleValidate(v._id)}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                  Valider
                </button>
                <button
                  onClick={() => handleReject(v._id)}
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                >
                  Rejeter
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
