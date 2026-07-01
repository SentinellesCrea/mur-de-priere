"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import Button from "../../components/ui/button";
import Swal from "sweetalert2";

export default function AdminManageSupervisorsPage() {
  const router = useRouter();
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  const fetchSupervisors = async () => {
    try {
      const res = await fetchApi("/api/volunteers/all");
      if (Array.isArray(res)) {
        const filtered = res.filter((v) => v.role === "supervisor");
        setSupervisors(filtered);
      } else {
        setFeedback(res.message || "Erreur lors de la récupération des superviseurs");
      }
    } catch (err) {
      console.error("Erreur récupération superviseurs:", err.message);
      setFeedback("Erreur de récupération");
    } finally {
      setLoading(false);
    }
  };

  const deactivateSupervisor = async (id) => {
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
        const res = await fetchApi(`/api/admin/volunteers/validate/${id}`, {
          method: "PUT",
        });

        setFeedback(res.message || "Désactivation réussie");
        fetchSupervisors();
      } catch (err) {
        console.error("Erreur désactivation superviseur :", err.message);
        setFeedback("Erreur lors de la désactivation");
      }
    }
  };

  const deleteSupervisor = async (id) => {
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
        const res = await fetchApi(`/api/admin/volunteers/${id}`, {
          method: "DELETE",
        });

        Swal.fire('Supprimé !', 'Le superviseur a été supprimé.', 'success');
        setFeedback(res.message || "Suppression réussie");
        fetchSupervisors();
      } catch (err) {
        console.error("Erreur suppression superviseur :", err.message);
        setFeedback("Erreur lors de la suppression");
      }
    }
  };


  const downgradeSupervisor = async (id) => {
    const result = await Swal.fire({
      title: 'Rétrograder ce superviseur ?',
      text: "Il redeviendra un bénévole classique.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Oui, rétrograder',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetchApi(`/api/admin/volunteers/role/${id}`, {
          method: "PUT",
          body: { role: "volunteer" }, // ✅ on change son rôle
        });

        Swal.fire('Rétrogradé !', res.message || "Le superviseur est maintenant bénévole.", 'success');
        fetchSupervisors(); // 🔄 recharge la liste
      } catch (err) {
        console.error("Erreur rétrogradation :", err.message);
        setFeedback("Erreur lors de la rétrogradation");
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
        await fetchSupervisors();
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
            Coordination
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#2f2a26]">Superviseurs</h2>
          <p className="mt-1 text-sm text-[#6B5B4D]">
            Pilote les responsables qui accompagnent les bénévoles et les missions.
          </p>
        </div>
        <div className="rounded-lg bg-[#F4F0FA] px-4 py-3 text-sm font-bold text-[#6D5A8D]">
          {supervisors.length} superviseur{supervisors.length > 1 ? "s" : ""}
        </div>
      </div>

      {loading ? (
        <p className="rounded-lg border border-[#eadfd3] bg-white p-6 text-center text-[#7a6b5f]">
          Chargement des superviseurs...
        </p>
      ) : supervisors.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#d9c7b8] bg-white p-8 text-center text-[#7a6b5f]">
          Aucun superviseur à gérer.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {supervisors.map((supervisor) => (
            <div
              key={supervisor._id}
              className="flex flex-col justify-between rounded-lg border border-[#eadfd3] bg-white p-5 shadow-sm"
            >
              <div className="space-y-2 mb-4">
                <p className="text-lg font-bold text-[#2f2a26]">
                  {supervisor.firstName} {supervisor.lastName}
                </p>
                <p className="text-sm text-[#6B5B4D]"><strong>Email :</strong> {supervisor.email}</p>
                <p className="text-sm text-[#6B5B4D]"><strong>Téléphone :</strong> {supervisor.phone}</p>
                <span className="inline-flex rounded-md bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-800">
                  {supervisor.status}
                </span>
                <p className="mt-2 text-xs text-[#7a6b5f]">
                  Créé le : {new Date(supervisor.date).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="mt-auto flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => deactivateSupervisor(supervisor._id)}
                  className="flex-1 rounded-lg bg-[#C76A2A] text-white hover:bg-[#a95520]"
                >
                  Désactiver
                </Button>

                <Button
                  onClick={() => downgradeSupervisor(supervisor._id)}
                  className="flex-1 rounded-lg bg-[#8B1E3F] text-white hover:bg-[#741733]"
                >
                  Rétrograder
                </Button>

                <Button
                  onClick={() => deleteSupervisor(supervisor._id)}
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
