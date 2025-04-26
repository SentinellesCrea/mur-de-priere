"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi"; // Ton helper sécurisé
import NavbarOther from "../../components/NavbarOther";

export default function CreateAdminPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setFeedback("");

    try {
      const res = await fetchApi("/api/admin/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res && res.message) {
        setFeedback(res.message);
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      console.error("Erreur création admin:", error.message);
      setFeedback(error.message || "Erreur serveur.");
    }
  };

  return (
    <div>
      <NavbarOther />
      <div className="max-w-md mx-auto mt-40 p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Créer un nouvel administrateur</h1>

        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom complet</label>
            <input
              type="text"
              placeholder="Entrez le nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Entrez l'email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe</label>
            <input
              type="password"
              placeholder="Mot de passe sécurisé"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Créer Admin
          </button>

          {feedback && <p className="mt-4 text-center text-sm text-green-700">{feedback}</p>}
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
