"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { useRouter } from "next/navigation";
import SupervisorNavbar from "../../components/supervisor/SupervisorNavbar";
import { toast } from "react-toastify";
import Image from "next/image";
import { FiArrowLeft, FiCamera, FiLock, FiMail, FiShield, FiUser } from "react-icons/fi";

export default function SupervisorProfilePage() {
  const router = useRouter();
  const [supervisorInfo, setSupervisorInfo] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSupervisorData() {
      try {
        const data = await fetchApi("/api/supervisor/me");

        if (!data || data.role !== "supervisor") {
          router.push("/volunteers/login");
        } else {
          setSupervisorInfo(data);
          setProfileImage(data.profileImage || "");
        }
      } catch (err) {
        console.error("Erreur chargement profil superviseur :", err.message);
        router.push("/volunteers/login");
      } finally {
        setLoading(false);
      }
    }

    fetchSupervisorData();
  }, [router]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!email && !password && !photo) {
      toast.error("Veuillez entrer une nouvelle information à modifier.");
      return;
    }

    try {
      setSaving(true);
      let uploadedImage = "";

      if (photo) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", photo);
        uploadFormData.append("context", "profile");

        const uploadResponse = await fetch("/api/uploads/cloudinary", {
          method: "POST",
          credentials: "include",
          body: uploadFormData,
        });

        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || "Erreur upload image");
        }
        uploadedImage = uploadData.url;
      }

      const res = await fetchApi("/api/supervisor/me", {
        method: "PUT",
        body: { email, password, ...(uploadedImage ? { profileImage: uploadedImage } : {}) },
      });

      if (res.requireReconnect) {
        toast.error("Mot de passe modifié. Veuillez vous reconnecter.");
        router.push("/volunteers/login");
        return;
      }

      toast.success("✅ Profil mis à jour avec succès !");
      setEmail("");
      setPassword("");
      setPhoto(null);

      // Recharge les infos superviseur
      const updated = await fetchApi("/api/supervisor/me");
      setSupervisorInfo(updated);
      setProfileImage(updated.profileImage || "");
    } catch (err) {
      console.error("Erreur mise à jour superviseur :", err.message);
      toast.error(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f6f8] flex items-center justify-center">
        <p className="animate-pulse text-gray-500">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f6f8]">
      <SupervisorNavbar />

      <section className="max-w-[1200px] mx-auto px-6 lg:px-20 pt-32 pb-16">
        <button
          type="button"
          onClick={() => router.push("/supervisor/dashboard")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#5c40e7] hover:underline"
        >
          <FiArrowLeft /> Retour au tableau de bord
        </button>

        <div className="rounded-[2rem] bg-white shadow-sm border border-white/70 p-6 lg:p-8 mb-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#5c40e7] mb-3">
            Paramètres superviseur
          </p>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            Mon profil
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl leading-6">
            Mets à jour tes informations de connexion et ta photo de profil. Les images sont envoyées dans l’espace Cloudinary sécurisé du superviseur.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] shadow-sm border border-white/70 p-6 sticky top-28">
              <div className="rounded-[1.75rem] bg-[#F1EEFF] p-6 text-center">
                <div className="mx-auto size-28 rounded-full bg-white border-4 border-white shadow-sm overflow-hidden flex items-center justify-center mb-4">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt="Photo de profil superviseur"
                      width={112}
                      height={112}
                      className="h-28 w-28 rounded-full object-cover"
                    />
                  ) : (
                    <FiUser className="text-4xl text-[#5c40e7]" />
                  )}
                </div>
                <h2 className="font-extrabold text-gray-900 text-xl">
                  {supervisorInfo?.firstName || "Superviseur"} {supervisorInfo?.lastName || ""}
                </h2>
                <p className="text-sm text-gray-500 mt-1 break-all">{supervisorInfo?.email}</p>
                <span className="mt-4 inline-flex items-center gap-2 bg-white text-[#5c40e7] rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-wide">
                  <FiShield /> Superviseur
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <InfoLine icon={<FiMail />} label="Email actuel" value={supervisorInfo?.email || "Non renseigné"} />
                <InfoLine icon={<FiLock />} label="Sécurité" value="Mot de passe protégé" />
              </div>
            </div>
          </aside>

          <div className="lg:col-span-2">
            <form onSubmit={handleUpdate} className="bg-white rounded-[2rem] shadow-sm border border-white/70 p-6 lg:p-8 space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">Modifier mes informations</h3>
                <p className="text-sm text-gray-500">
                  Tu peux modifier un seul champ ou plusieurs en même temps.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div className="rounded-[1.5rem] border border-gray-100 bg-[#F7F7FB] p-5">
                  <label className="flex items-center gap-2 text-sm font-extrabold text-gray-800 mb-3">
                    <FiCamera className="text-[#5c40e7]" /> Photo de profil
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                    className="w-full rounded-2xl bg-white border border-gray-200 px-4 py-3 text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-[#F1EEFF] file:px-4 file:py-2 file:text-[#5c40e7] file:font-bold"
                  />
                  {photo && (
                    <p className="text-xs text-gray-500 mt-3">
                      Nouvelle image sélectionnée : {photo.name}
                    </p>
                  )}
                </div>

                <div className="rounded-[1.5rem] border border-gray-100 bg-[#F7F7FB] p-5">
                  <label className="flex items-center gap-2 text-sm font-extrabold text-gray-800 mb-3">
                    <FiMail className="text-[#5c40e7]" /> Nouvel email
                  </label>
                  <input
                    type="email"
                    placeholder="exemple@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c40e7]/20"
                  />
                </div>

                <div className="rounded-[1.5rem] border border-gray-100 bg-[#F7F7FB] p-5">
                  <label className="flex items-center gap-2 text-sm font-extrabold text-gray-800 mb-3">
                    <FiLock className="text-[#5c40e7]" /> Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    placeholder="12 caractères minimum"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c40e7]/20"
                  />
                  <p className="text-xs text-gray-500 mt-3">
                    Si tu modifies ton mot de passe, une reconnexion sera demandée.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/supervisor/dashboard")}
                  className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-700 text-sm font-extrabold hover:bg-gray-200 transition"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-2xl bg-[#5c40e7] text-white text-sm font-extrabold shadow-lg shadow-[#5c40e7]/20 hover:scale-[1.02] transition disabled:opacity-60 disabled:hover:scale-100"
                >
                  {saving ? "Mise à jour..." : "Mettre à jour le profil"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoLine({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-[#F7F7FB] p-4">
      <span className="mt-0.5 text-[#5c40e7]">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-extrabold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="text-sm font-bold text-gray-800 break-all">{value}</p>
      </div>
    </div>
  );
}
