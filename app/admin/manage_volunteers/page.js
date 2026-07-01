"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import Button from "../../components/ui/button";
import Swal from "sweetalert2";

export default function AdminManageVolunteersPage() {
  const router = useRouter();
  const [validatedVolunteers, setValidatedVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  const fetchAllValidatedVolunteers = async () => {
    try {
      const res = await fetchApi("/api/volunteers/all");
      if (Array.isArray(res)) {
        const filtered = res.filter((v) => v.role === "volunteer");
        setValidatedVolunteers(filtered);
      } else {
        setFeedback(res.message || "Erreur lors de la récupération des bénévoles");
      }
    } catch (err) {
      console.error("Erreur récupération bénévoles validés:", err.message);
      setFeedback("Erreur de récupération");
    } finally {
      setLoading(false);
    }
  };


  const deactivateVolunteer = async (volunteerId) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, désactiver !',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetchApi(`/api/admin/volunteers/validate/${volunteerId}`, {
          method: "PUT",
        });

        setFeedback(res.message || "Désactivation réussie");
        fetchAllValidatedVolunteers();
      } catch (err) {
        console.error("Erreur désactivation bénévole :", err.message);
        setFeedback("Erreur lors de la désactivation");
      }
    }
  };


  const promoteVolunteer = async (id) => {
      const result = await Swal.fire({
        title: "Promouvoir ce bénévole ?",
        text: "Il deviendra superviseur et pourra gérer des missions.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#aaa",
        confirmButtonText: "Oui, promouvoir",
      });

      if (result.isConfirmed) {
        try {
          const res = await fetchApi(`/api/admin/volunteers/promote/${id}`, {
            method: "PUT",
          });

          Swal.fire("Promu !", res.message || "Le bénévole est maintenant superviseur.", "success");
          fetchAllValidatedVolunteers(); // 🔄 recharge la liste
        } catch (err) {
          console.error("Erreur promotion :", err.message);
          setFeedback("Erreur lors de la promotion");
        }
      }
    };


  const deleteVolunteer = async (volunteerId) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetchApi(`/api/admin/volunteers/${volunteerId}`, {
          method: "DELETE",
        });

        Swal.fire('Supprimé !', 'Le bénévole a été supprimé.', 'success');
        setFeedback(res.message || "Suppression réussie");
        fetchAllValidatedVolunteers();
      } catch (err) {
        console.error("Erreur suppression bénévole :", err.message);
        setFeedback("Erreur lors de la suppression");
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
        await fetchAllValidatedVolunteers();
      } catch (error) {
        console.error("Erreur de vérification admin :", error.message);
        router.push("/admin/login");
      }
    }

    init();
  }, [router]);

  return (
    <section className="space-y-5 rounded-lg border border-[#eadfd3] bg-[#fffaf5] p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8B1E3F]">
            Équipe
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#2f2a26]">Bénévoles validés</h2>
          <p className="mt-1 text-sm text-[#6B5B4D]">
            Gère les accès, les promotions et les comptes bénévoles actifs.
          </p>
        </div>
        <div className="rounded-lg bg-[#FFF2E7] px-4 py-3 text-sm font-bold text-[#8B1E3F]">
          {validatedVolunteers.length} bénévole{validatedVolunteers.length > 1 ? "s" : ""}
        </div>
      </div>

      {loading ? (
        <p className="rounded-lg border border-[#eadfd3] bg-white p-6 text-center text-[#7a6b5f]">
          Chargement des bénévoles...
        </p>
      ) : validatedVolunteers.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#d9c7b8] bg-white p-8 text-center text-[#7a6b5f]">
          Aucun bénévole à gérer.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {validatedVolunteers.map((volunteer) => (
            <div
              key={volunteer._id}
              className="flex flex-col justify-between rounded-lg border border-[#eadfd3] bg-white p-5 shadow-sm"
            >
              <div className="space-y-2 mb-4">
                <p className="text-lg font-bold text-[#2f2a26]">
                  {volunteer.firstName} {volunteer.lastName}
                </p>
                <p className="text-sm text-[#6B5B4D]"><strong>Email :</strong> {volunteer.email}</p>
                <p className="text-sm text-[#6B5B4D]"><strong>Téléphone :</strong> {volunteer.phone}</p>
                <span className="inline-flex rounded-md bg-[#EFF8ED] px-2 py-1 text-xs font-bold text-[#5F8A61]">
                  {volunteer.status}
                </span>
                <p className="mt-2 text-xs text-[#7a6b5f]">
                  Créé le : {new Date(volunteer.date).toLocaleDateString('fr-FR')}
                </p>
              </div>

             <div className="mt-auto flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => deactivateVolunteer(volunteer._id)}
                className="flex-1 rounded-lg bg-[#C76A2A] text-white hover:bg-[#a95520]"
              >
                Désactiver
              </Button>

              <Button
                onClick={() => promoteVolunteer(volunteer._id)}
                className="flex-1 rounded-lg bg-[#8B1E3F] text-white hover:bg-[#741733]"
              >
                Promouvoir
              </Button>

              <Button
                onClick={() => deleteVolunteer(volunteer._id)}
                className="flex-1 rounded-lg bg-[#A3193F] text-white hover:bg-[#871433]"
              >
                Supprimer
              </Button>
            </div>

            </div>
          ))}
        </div>
      )}

      {feedback && <p className="rounded-lg bg-[#fff1f1] p-3 text-center text-sm font-semibold text-[#9f1239]">{feedback}</p>}
    </section>
  );
}
