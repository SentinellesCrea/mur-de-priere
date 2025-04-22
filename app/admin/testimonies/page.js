"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function AdminTestimoniesPage() {
  const [moderations, setModerations] = useState([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const fetchModerations = async () => {
    try {
      const res = await fetch("/api/admin/testimony/moderation", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Erreur modération (status):", res.status, text);
        return;
      }

      const data = await res.json();
      setModerations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur modération:", err);
    }
  };

  const handleValidateTestimony = async (id) => {
  try {
    const res = await fetch("/api/admin/testimony/moderation", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();

    if (res.ok) {
      fetchModerations(); // 🔄 recharge la liste après validation
    } else {
      console.error("Erreur de validation :", data.message);
    }
  } catch (err) {
    console.error("Erreur validation témoignage:", err);
  }
};


    const handleDeleteTestimony = async (id) => {
      // Afficher une boîte de confirmation avant de supprimer le témoignage
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
        const res = await fetch(`/api/admin/testimony/${id}`, {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          alert("Témoignage supprimé avec succès.");
          fetchModerations(); // Recharger les données après suppression
        } else {
          alert("Erreur lors de la suppression du témoignage.");
        }
      } catch (err) {
        console.error("Erreur suppression témoignage:", err);
        alert("Une erreur est survenue.");
      }
    }
    };

    useEffect(() => {
      fetchModerations();
    }, []);


  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">💬 Modération des témoignages</h2>
      {moderations.length === 0 ? (
        <p>Rien à modérer pour l’instant.</p>
      ) : (
        <ul className="space-y-4">
          {moderations.map((t) => (
            <li key={t._id} className="border rounded p-4 shadow bg-white">
              <span><strong>Nom :</strong> {t.firstName}</span>
              <p><strong>Témoignage :</strong> {t.testimony}</p>
              <p className="text-sm text-gray-500 italic">
                Reçu le : {new Date(t.datePublication).toLocaleDateString("fr-FR", {
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
