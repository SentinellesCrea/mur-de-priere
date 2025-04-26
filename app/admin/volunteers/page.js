"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi"; // Ton helper sécurisé
import Swal from "sweetalert2";

export default function VolunteersValidationPage() {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const data = await fetchApi("/api/admin/volunteers/pending");

      if (Array.isArray(data)) {
        setVolunteers(data);
      } else {
        console.error("Résultat inattendu :", data);
      }
    } catch (error) {
      console.error("Erreur chargement bénévoles :", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id) => {
    try {
      const res = await fetchApi(`/api/admin/volunteers/validate/${id}`, {
        method: "POST",
      });

      setFeedback(res.message || "Bénévole validé !");
      fetchVolunteers();
    } catch (error) {
      console.error("Erreur validation bénévole :", error.message);
      setFeedback("Erreur lors de la validation.");
    }
  };

  const handleReject = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, rejeter !',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetchApi(`/api/admin/volunteers/reject/${id}`, {
          method: "POST",
        });

        setFeedback(res.message || "Bénévole rejeté.");
        fetchVolunteers();
      } catch (error) {
        console.error("Erreur rejet bénévole :", error.message);
        setFeedback("Erreur lors du rejet.");
      }
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const admin = await fetchApi("/api/admin/me");

        if (!admin || !admin.name) {
          router.push("/admin/login");
        } else {
          await fetchVolunteers();
        }
      } catch (error) {
        console.error("Erreur de vérification admin :", error.message);
        router.push("/admin/login");
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

      {feedback && <div className="mb-4 text-green-600">{feedback}</div>}

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
