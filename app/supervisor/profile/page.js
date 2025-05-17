"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { useRouter } from "next/navigation";
import SupervisorNavbar from "../../components/supervisor/SupervisorNavbar";
import { toast } from "react-toastify";

export default function AdminProfilePage() {
  const router = useRouter();
  const [adminInfo, setAdminInfo] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const data = await fetchApi("/api/admin/me");

        if (!data || !data.firstName) {
          router.push("/admin/login");
        } else {
          setAdminInfo(data);
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

    if (!email && !password) {
      toast.error("Veuillez entrer un nouvel email ou un nouveau mot de passe !");
      return;
    }

    try {
      const res = await fetchApi("/api/admin/me", {
        method: "PUT",
        body: JSON.stringify({ email, password }),
      });

      if (res.requireReconnect) {
        toast.error("Mot de passe modifié. Veuillez vous reconnecter.");
        router.push("/admin/login");
        return;
      }

      toast.success("✅ Profil mis à jour avec succès !");
      setEmail("");
      setPassword("");
      // Recharge les infos admin
      const updated = await fetchApi("/api/admin/me");
      setAdminInfo(updated);
    } catch (err) {
      console.error("Erreur profil admin :", err.message);
      toast.error(`❌ ${err.message}`);
    }
  };

  if (loading) {
    return <p className="text-center mt-20">Chargement...</p>;
  }

  return (
    <div className="w-full mt-40">
      <AdminNavbar />
      <div className="max-w-xl mx-auto p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-6">Mon profil Admin</h1>

        {adminInfo && (
          <div className="mb-6 bg-gray-100 p-4 rounded">
            <p><strong>Email actuel :</strong> {adminInfo.email}</p>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nouvel email</label>
            <input
              type="email"
              placeholder="Entrez un nouvel email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              placeholder="Entrez un nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <button
            type="submit"
            className="bg-[#d4967d] text-white px-4 py-2 rounded hover:bg-[#bb7f68]"
          >
            Mettre à jour
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/admin")}
            className="text-sm text-blue-600 hover:underline"
          >
            ⬅ Retour au tableau de bord
          </button>
        </div>
      </div>
    </div>
  );
}
