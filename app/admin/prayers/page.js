"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function AdminPrayersPage() {
  const [prayerRequests, setPrayerRequests] = useState([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const fetchPrayerRequests = async () => {
    try {
      const response = await fetch("/api/prayerRequests", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      setPrayerRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement prières :", error);
    }
  };

  const handleDeletePrayer = async (id) => {
    // Afficher une boîte de confirmation avec SweetAlert2
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
      const res = await fetch(`/api/admin/prayer-request/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("Suppression échouée");

      setPrayerRequests((prev) => prev.filter((req) => req._id !== id));
      alert("Demande supprimée avec succès.");
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("Erreur lors de la suppression.");
    }
  }
  };

  useEffect(() => {
    fetchPrayerRequests();
  }, []);

  const unmoderated = prayerRequests.filter((p) => !p.isModerated);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Demandes de Prière à modérer</h2>
      {unmoderated.length === 0 ? (
        <p>Aucune demande à modérer.</p>
      ) : (
        <div className="grid gap-4">
          {unmoderated.map((prayer) => (
            <div key={prayer._id} className="border p-4 rounded shadow">
              <p><strong>Prénom :</strong> {prayer.name}</p>
              <p><strong>Texte :</strong> {prayer.prayerRequest}</p>
              <p><strong>Date :</strong> {new Date(prayer.datePublication).toLocaleDateString()}</p>

              <div className="mt-4">
                <button
                  onClick={() => handleDeletePrayer(prayer._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
