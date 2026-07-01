"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { useRouter } from "next/navigation";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { toast } from "react-toastify";
import Image from "next/image";

export default function AdminProfilePage() {
  const router = useRouter();
  const [adminInfo, setAdminInfo] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const data = await fetchApi("/api/admin/me");

        if (!data || !data.firstName) {
          router.push("/admin/login");
        } else {
          setAdminInfo(data);
          setProfileImage(data.profileImage || "");
        }
      } catch (err) {
        console.error("Erreur chargement profil admin :", err.message);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, [router]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!email && !password && !photo) {
      toast.error("Veuillez entrer un nouvel email ou un nouveau mot de passe !");
      return;
    }

    try {
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

      const res = await fetchApi("/api/admin/me", {
        method: "PUT",
        body: { email, password, ...(uploadedImage ? { profileImage: uploadedImage } : {}) },
      });

      if (res.requireReconnect) {
        toast.error("Mot de passe modifié. Veuillez vous reconnecter.");
        router.push("/admin/login");
        return;
      }

      toast.success("✅ Profil mis à jour avec succès !");
      setEmail("");
      setPassword("");
      setPhoto(null);
      // Recharge les infos admin
      const updated = await fetchApi("/api/admin/me");
      setAdminInfo(updated);
      setProfileImage(updated.profileImage || "");
    } catch (err) {
      console.error("Erreur profil admin :", err.message);
      toast.error(`❌ ${err.message}`);
    }
  };

  if (loading) {
    return <p className="mt-28 rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">Chargement...</p>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />
      <main className="mx-auto max-w-3xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
          Compte
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">Profil admin</h1>
        <p className="mt-1 text-sm text-slate-600">
          Mets à jour ton email, ton mot de passe ou ta photo de profil.
        </p>

        {adminInfo && (
          <div className="my-6 flex items-center gap-4 rounded-lg bg-slate-50 p-4">
            {profileImage && (
              <Image
                src={profileImage}
                alt="Photo de profil admin"
                width={80}
                height={80}
                className="h-16 w-16 rounded-full border border-slate-200 object-cover"
              />
            )}
            <div>
              <p className="text-sm font-bold text-slate-950">
                {adminInfo.firstName} {adminInfo.lastName}
              </p>
              <p className="text-sm text-slate-600">{adminInfo.email}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Photo de profil</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Nouvel email</label>
            <input
              type="email"
              placeholder="Entrez un nouvel email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Nouveau mot de passe</label>
            <input
              type="password"
              placeholder="Entrez un nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            className="h-11 rounded-lg bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800"
          >
            Mettre à jour
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <button
            onClick={() => router.push("/admin")}
            className="text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
      </main>
    </div>
  );
}
