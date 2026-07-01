"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/fetchApi";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { toast } from "react-toastify";

export default function CreateAdminPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const res = await fetchApi("/api/admin/volunteers/promote"); // ✅ GET par défaut
        if (Array.isArray(res)) {
          setVolunteers(res);
        } else {
          toast.error(res.message || "Erreur de chargement des bénévoles");
        }
      } catch (error) {
        console.error("Erreur chargement bénévoles:", error.message);
        toast.error("Erreur serveur lors du chargement");
      }
    };

    fetchVolunteers();
  }, []);

    const handlePromote = async () => {
    if (!selectedVolunteer) return;

    const fullName = `${selectedVolunteer.firstName} ${selectedVolunteer.lastName}`;

    try {
      const res = await fetchApi(`/api/admin/volunteers/promote/${selectedVolunteer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res && res.message) {
        toast.success(`${fullName} est maintenant superviseur ✅`);
        setVolunteers((prev) => prev.filter((v) => v._id !== selectedVolunteer._id));
        setSelectedVolunteer(null);
      } else {
        toast.error(res?.error || "Erreur lors de la promotion.");
      }
    } catch (error) {
      console.error("Erreur promotion:", error.message);
      toast.error(error.message || "Erreur serveur.");
    }
  };


  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
          Supervision
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Créer un superviseur</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sélectionne un bénévole validé, vérifie ses informations, puis change son rôle.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        {/* Liste des bénévoles */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-950">Bénévoles disponibles</h2>
            <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
              {volunteers.length}
            </span>
          </div>
          {volunteers.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              Aucun bénévole disponible.
            </p>
          ) : (
            <ul className="space-y-2">
              {volunteers.map((volunteer) => (
                <li
                  key={volunteer._id}
                  onClick={() => setSelectedVolunteer(volunteer)}
                  className={`cursor-pointer rounded-lg border p-3 text-sm transition ${
                    selectedVolunteer?._id === volunteer._id
                      ? "border-blue-700 bg-blue-50 text-blue-900"
                      : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                  }`}
                >
                  <p className="font-bold">{volunteer.firstName} {volunteer.lastName}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{volunteer.email}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Détails du bénévole sélectionné */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {selectedVolunteer ? (
            <>
              <h2 className="mb-4 text-2xl font-bold text-slate-950">Détails du bénévole</h2>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <dt className="font-bold text-slate-950">Prénom</dt>
                  <dd className="mt-1 text-slate-600">{selectedVolunteer.firstName}</dd>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <dt className="font-bold text-slate-950">Nom</dt>
                  <dd className="mt-1 text-slate-600">{selectedVolunteer.lastName}</dd>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <dt className="font-bold text-slate-950">Email</dt>
                  <dd className="mt-1 break-all text-slate-600">{selectedVolunteer.email}</dd>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <dt className="font-bold text-slate-950">Téléphone</dt>
                  <dd className="mt-1 text-slate-600">{selectedVolunteer.phone}</dd>
                </div>
              </dl>

              <button
                onClick={handlePromote}
                className="mt-6 h-11 rounded-lg bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800"
              >
                Promouvoir en superviseur
              </button>
            </>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
              Sélectionne un bénévole pour voir ses informations.
            </p>
          )}
        </div>
      </div>
      </main>
    </div>
  );
}
