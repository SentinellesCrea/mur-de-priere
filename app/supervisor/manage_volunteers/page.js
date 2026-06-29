"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import { useAutoRefresh } from "@/lib/useAutoRefresh";
import Button from "../../components/ui/button";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { FiClock, FiMail, FiPhone, FiPlus, FiShield, FiUsers, FiX } from "react-icons/fi";

export default function AdminManageVolunteersPage() {
  const router = useRouter();
  const [validatedVolunteers, setValidatedVolunteers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
  });

  const fetchAllValidatedVolunteers = async ({ silent = false } = {}) => {
    try {
      setFeedback("");
      const [volunteersResult, invitationsResult] = await Promise.allSettled([
        fetchApi("/api/supervisor/volunteers/validate"),
        fetchApi("/api/supervisor/volunteers/invite"),
      ]);

      if (volunteersResult.status === "fulfilled" && Array.isArray(volunteersResult.value)) {
        setValidatedVolunteers(volunteersResult.value);
      } else {
        setValidatedVolunteers([]);
        setFeedback("Erreur lors de la récupération des bénévoles");
      }

      if (invitationsResult.status === "fulfilled" && Array.isArray(invitationsResult.value)) {
        setPendingInvitations(invitationsResult.value);
      } else {
        setPendingInvitations([]);
      }
    } catch (err) {
      console.error("Erreur récupération bénévoles validés:", err.message);
      if (!silent) {
        setFeedback("Erreur de récupération");
      }
    } finally {
      setLoading(false);
    }
  };

  const deactivateVolunteer = async (volunteerId) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Le bénévole sera désactivé et retiré des bénévoles actifs.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, désactiver !',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetchApi(`/api/supervisor/volunteers/${volunteerId}`, {
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

  const handleInviteChange = (event) => {
    const { name, value } = event.target;
    setInviteForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInviteVolunteer = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      await fetchApi("/api/supervisor/volunteers/invite", {
        method: "POST",
        body: inviteForm,
      });

      toast.success("Invitation envoyée au bénévole.");
      setInviteForm({ firstName: "", lastName: "", email: "", phone: "", gender: "" });
      setDrawerOpen(false);
      fetchAllValidatedVolunteers();
    } catch (error) {
      toast.error(error.message || "Impossible d’envoyer l’invitation.");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    async function checkAdmin() {
      try {
        const admin = await fetchApi("/api/supervisor/me");
        if (!admin || !admin.firstName) {
          router.push("/volunteers/login");
        }
      } catch (error) {
        console.error("Erreur de vérification admin :", error.message);
        router.push("/volunteers/login");
      }
    }

    checkAdmin();
    fetchAllValidatedVolunteers();
  }, [router]);

  useAutoRefresh(() => fetchAllValidatedVolunteers({ silent: true }), {
    enabled: !loading,
    intervalMs: 9000,
  });

  const hasVolunteersToShow = validatedVolunteers.length > 0 || pendingInvitations.length > 0;

  return (
    <div className="space-y-8">
      <HeaderCard
        icon={<FiUsers />}
        eyebrow="Équipe"
        title="Bénévoles actifs"
        description="Retrouve les bénévoles validés, les invitations en attente et désactive un compte si nécessaire."
        count={validatedVolunteers.length}
        pendingCount={pendingInvitations.length}
        onCreate={() => setDrawerOpen(true)}
      />

      {loading ? (
        <p className="text-center py-16 text-gray-500 animate-pulse">Chargement des bénévoles...</p>
      ) : !hasVolunteersToShow ? (
        <EmptyCard text="Aucun bénévole actif ou en attente à gérer." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {pendingInvitations.map((invitation) => (
            <PendingInvitationCard key={invitation._id} invitation={invitation} />
          ))}

          {validatedVolunteers.map((volunteer) => (
            <div
              key={volunteer._id}
              className="bg-white shadow-sm border border-white/70 rounded-[2rem] p-6 flex flex-col justify-between"
            >
              <div className="space-y-4 mb-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="size-12 rounded-2xl bg-[#DBEAFE] text-blue-600 flex items-center justify-center">
                    <FiUsers />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-extrabold">
                    Validé
                  </span>
                </div>
                <p className="text-gray-900 font-extrabold text-lg">
                  {volunteer.firstName} {volunteer.lastName}
                </p>
                <InfoRow icon={<FiMail />} text={volunteer.email || "Email non fourni"} />
                <InfoRow icon={<FiPhone />} text={volunteer.phone || "Téléphone non fourni"} />
                <InfoRow icon={<FiShield />} text={`Statut : ${volunteer.status || "validated"}`} />
                <p className="text-gray-500 text-xs mt-2">
                  Créé le : {new Date(volunteer.date || volunteer.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="flex gap-3 mt-auto">
                <Button
                  onClick={() => deactivateVolunteer(volunteer._id)}
                  className="bg-amber-500 hover:bg-amber-600 text-white flex-1 rounded-2xl py-3"
                >
                  Désactiver
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {feedback && <p className="mt-6 text-center text-red-500 font-bold">{feedback}</p>}

      {drawerOpen && (
        <InviteDrawer
          form={inviteForm}
          creating={creating}
          onChange={handleInviteChange}
          onSubmit={handleInviteVolunteer}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}

function HeaderCard({ icon, eyebrow, title, description, count, pendingCount, onCreate }) {
  return (
    <div className="bg-white rounded-[2rem] p-6 lg:p-8 border border-white/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
      <div className="flex items-start gap-4">
        <span className="size-12 rounded-2xl bg-[#F1EEFF] text-[#5c40e7] flex items-center justify-center text-xl">
          {icon}
        </span>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#5c40e7] mb-2">{eyebrow}</p>
          <h2 className="text-3xl font-extrabold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">{description}</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="rounded-[1.5rem] bg-[#DBEAFE] px-6 py-4 text-center">
          <p className="text-3xl font-extrabold text-gray-900">{count}</p>
          <p className="text-xs font-bold uppercase text-gray-500">actifs</p>
        </div>
        <div className="rounded-[1.5rem] bg-amber-50 px-6 py-4 text-center">
          <p className="text-3xl font-extrabold text-gray-900">{pendingCount}</p>
          <p className="text-xs font-bold uppercase text-amber-600">en attente</p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 bg-[#5c40e7] text-white px-5 py-4 rounded-[1.5rem] text-sm font-extrabold shadow-lg shadow-[#5c40e7]/20 hover:scale-[1.02] transition"
        >
          <FiPlus /> Créer un bénévole
        </button>
      </div>
    </div>
  );
}

function PendingInvitationCard({ invitation }) {
  const createdAt = invitation.createdAt ? new Date(invitation.createdAt).toLocaleDateString("fr-FR") : "Date inconnue";
  const expiresAt = invitation.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString("fr-FR") : "Date inconnue";

  return (
    <div className="relative overflow-hidden bg-white/75 shadow-sm border border-dashed border-amber-200 rounded-[2rem] p-6 flex flex-col justify-between">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="-rotate-12 text-3xl font-black uppercase tracking-[0.18em] text-amber-200/80">
          En attente
        </span>
      </div>

      <div className="relative space-y-4 mb-5 opacity-80">
        <div className="flex items-center justify-between gap-3">
          <div className="size-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FiClock />
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[11px] font-extrabold">
            En attente d’activation
          </span>
        </div>
        <p className="text-gray-900 font-extrabold text-lg">
          {invitation.firstName} {invitation.lastName}
        </p>
        <InfoRow icon={<FiMail />} text={invitation.email || "Email non fourni"} />
        <InfoRow icon={<FiPhone />} text={invitation.phone || "Téléphone non fourni"} />
        <InfoRow icon={<FiShield />} text="Compte non activé" />
        <p className="text-gray-500 text-xs mt-2">
          Invitation envoyée le : {createdAt}
        </p>
        <p className="text-amber-600 text-xs font-bold">
          Expire le : {expiresAt}
        </p>
      </div>

      <div className="relative mt-auto rounded-2xl bg-amber-50/80 px-4 py-3 text-center text-xs font-extrabold text-amber-700">
        Activation du profil en attente
      </div>
    </div>
  );
}

function InfoRow({ icon, text }) {
  return (
    <p className="flex items-center gap-2 text-sm text-gray-600">
      <span className="text-[#5c40e7]">{icon}</span>
      <span className="truncate">{text}</span>
    </p>
  );
}

function EmptyCard({ text }) {
  return (
    <div className="bg-white rounded-[2rem] p-10 text-center text-gray-500 border border-white/70 shadow-sm">
      {text}
    </div>
  );
}

function InviteDrawer({ form, creating, onChange, onSubmit, onClose }) {
  return (
    <div className="fixed left-0 right-0 top-[50px] bottom-0 z-[45]">
      <button
        type="button"
        aria-label="Fermer le drawer"
        onClick={onClose}
        className="absolute inset-0 bg-black/20"
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl p-6 overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#5c40e7] mb-2">
              Invitation
            </p>
            <h3 className="text-2xl font-extrabold text-gray-900">Créer un bénévole</h3>
            <p className="text-sm text-gray-500 mt-2">
              Une invitation sera envoyée par email pour compléter le profil.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-10 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <DrawerField label="Prénom" name="firstName" value={form.firstName} onChange={onChange} required />
          <DrawerField label="Nom" name="lastName" value={form.lastName} onChange={onChange} required />
          <DrawerField label="Adresse email" name="email" type="email" value={form.email} onChange={onChange} required />
          <DrawerField label="Téléphone" name="phone" type="tel" value={form.phone} onChange={onChange} />

          <div>
            <label className="block text-sm font-extrabold text-gray-700 mb-2">Sexe</label>
            <select
              name="gender"
              value={form.gender}
              onChange={onChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm"
            >
              <option value="">Non renseigné</option>
              <option value="female">Femme</option>
              <option value="male">Homme</option>
              <option value="other">Autre</option>
              <option value="prefer_not_to_say">Préfère ne pas dire</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-[#5c40e7] text-white px-5 py-4 rounded-2xl font-extrabold shadow-lg shadow-[#5c40e7]/20 disabled:opacity-60"
          >
            {creating ? "Envoi en cours..." : "Envoyer l’invitation"}
          </button>
        </form>
      </aside>
    </div>
  );
}

function DrawerField({ label, name, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="block text-sm font-extrabold text-gray-700 mb-2">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c40e7]/20"
      />
    </div>
  );
}
