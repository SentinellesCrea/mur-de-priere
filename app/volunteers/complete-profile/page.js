"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import { fetchApi } from "@/lib/fetchApi";
import { toast } from "react-toastify";
import { FiCamera, FiLock, FiMapPin, FiPhone, FiUser } from "react-icons/fi";

export default function CompleteVolunteerProfilePage() {
  return (
    <Suspense fallback={<CompleteProfileLoading />}>
      <CompleteVolunteerProfileContent />
    </Suspense>
  );
}

function CompleteProfileLoading() {
  return (
    <main className="min-h-screen bg-[#f6f6f8] flex items-center justify-center">
      <p className="animate-pulse text-gray-500">Vérification de l’invitation...</p>
    </main>
  );
}

function CompleteVolunteerProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [form, setForm] = useState({
    phone: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    async function loadInvitation() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchApi(`/api/volunteers/invitations/${token}`);
        setInvitation(data);
        setForm((prev) => ({
          ...prev,
          phone: data.phone || "",
          gender: data.gender || "",
        }));
      } catch (error) {
        toast.error(error.message || "Invitation invalide ou expirée.");
      } finally {
        setLoading(false);
      }
    }

    loadInvitation();
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (profileImage) formData.append("profileImage", profileImage);

      const response = await fetchApi(`/api/volunteers/invitations/${token}`, {
        method: "POST",
        body: formData,
      });

      toast.success("Profil complété. Bienvenue !");
      router.push(response.redirectTo || "/volunteers/dashboard");
    } catch (error) {
      toast.error(error.message || "Impossible de compléter le profil.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <CompleteProfileLoading />
    );
  }

  if (!invitation) {
    return (
      <main className="min-h-screen bg-[#f6f6f8]">
        <Navbar />
        <section className="max-w-xl mx-auto px-6 pt-40 text-center">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Invitation invalide</h1>
            <p className="text-gray-500">Ce lien est invalide, expiré ou déjà utilisé.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f6f8]">
      <Navbar />

      <section className="max-w-[1100px] mx-auto px-6 lg:px-20 pt-32 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8">
          <aside className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-white/70 h-fit">
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#5c40e7] mb-3">
              Invitation bénévole
            </p>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
              Bienvenue {invitation.firstName}
            </h1>
            <p className="text-sm text-gray-600 leading-6">
              Complète ton profil, crée ton mot de passe et tu seras connecté automatiquement à ton espace bénévole.
            </p>

            <div className="mt-6 rounded-[1.5rem] bg-[#F1EEFF] p-5">
              <p className="font-extrabold text-gray-900">
                {invitation.firstName} {invitation.lastName}
              </p>
              <p className="text-sm text-gray-500 break-all">{invitation.email}</p>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-white/70 space-y-5">
            <h2 className="text-2xl font-extrabold text-gray-900">Compléter mon profil</h2>

            <div>
              <label className="flex items-center gap-2 text-sm font-extrabold text-gray-700 mb-2">
                <FiPhone className="text-[#5c40e7]" /> Téléphone
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-gray-200 px-4 py-3"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-extrabold text-gray-700 mb-2">
                <FiUser className="text-[#5c40e7]" /> Sexe
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3"
              >
                <option value="">Non renseigné</option>
                <option value="female">Femme</option>
                <option value="male">Homme</option>
                <option value="other">Autre</option>
                <option value="prefer_not_to_say">Préfère ne pas dire</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-gray-700 mb-2">Date de naissance</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-extrabold text-gray-700 mb-2">
                <FiMapPin className="text-[#5c40e7]" /> Adresse physique
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-extrabold text-gray-700 mb-2">
                <FiCamera className="text-[#5c40e7]" /> Photo de profil
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => setProfileImage(event.target.files?.[0] || null)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 file:mr-4 file:rounded-xl file:border-0 file:bg-[#F1EEFF] file:px-4 file:py-2 file:text-[#5c40e7] file:font-bold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PasswordField name="password" label="Mot de passe" value={form.password} onChange={handleChange} />
              <PasswordField name="confirmPassword" label="Confirmation" value={form.confirmPassword} onChange={handleChange} />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#5c40e7] text-white px-5 py-4 rounded-2xl font-extrabold shadow-lg shadow-[#5c40e7]/20 disabled:opacity-60"
            >
              {submitting ? "Finalisation..." : "Valider et accéder à mon espace"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function PasswordField({ name, label, value, onChange }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-extrabold text-gray-700 mb-2">
        <FiLock className="text-[#5c40e7]" /> {label}
      </label>
      <input
        type="password"
        name={name}
        value={value}
        onChange={onChange}
        required
        minLength={12}
        className="w-full rounded-2xl border border-gray-200 px-4 py-3"
      />
    </div>
  );
}
