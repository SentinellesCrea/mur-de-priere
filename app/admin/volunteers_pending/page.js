"use client";
import { useEffect, useState } from "react";
import Button from "../../components/ui/button";

export default function AdminVolunteersPendingPage() {
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem("adminToken") : null;

  const fetchPendingVolunteers = async () => {
    try {
      const res = await fetch("/api/admin/volunteers", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setPendingVolunteers(Array.isArray(data) ? data.filter(v => !v.isValidated) : []);
    } catch (err) {
      console.error("Erreur bénévoles en attente:", err);
    }
  };

  const handleValidate = async (id) => {
    try {
      const res = await fetch(`/api/admin/volunteers/validate/${id}`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Erreur validation bénévole:", data.message);
        alert("Erreur : " + data.message);
        return;
      }

      alert("✅ Bénévole validé !");
      fetchPendingVolunteers(); // Recharge la liste
    } catch (err) {
      console.error("Erreur validation bénévole:", err);
    }
  };

  const handleReject = async (id) => {
  if (!confirm("Confirmer le rejet de ce bénévole ?")) return;

  try {
    const res = await fetch(`/api/admin/volunteers/reject/${id}`, {
      method: "PATCH",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType?.includes("application/json")) {
      throw new Error("Erreur API ou réponse non JSON");
    }

    alert("❌ Bénévole rejeté !");
    fetchPendingVolunteers(); // 🔄 recharge la liste
  } catch (err) {
    console.error("Erreur rejet bénévole:", err.message);
    alert("Erreur lors du rejet du bénévole");
  }
};


  useEffect(() => {
    fetchPendingVolunteers();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">👥 Bénévoles en attente</h2>
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
                <Button className="bg-red-600 text-white" onClick={() => handleReject(v._id)}>
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