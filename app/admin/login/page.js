'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi"; // On utilise ton helper sécurisé
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const data = await fetchApi("/api/admin/login", {
      method: "POST",
      body: { email, password },
      credentials: "include",
    });

    router.push("/admin");
  } catch (err) {
    console.error("Erreur handleLogin admin:", err);
    setError(err.message || "Erreur de connexion. Veuillez réessayer.");
  }
};


  return (
  <div className="min-h-screen flex flex-col">
    <Navbar />

    {/* ===== Background ===== */}
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 px-4">
      
      {/* ===== Card ===== */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 md:p-10 transition-all">
        
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-2">
          Connexion Administrateur
        </h1>
        <p className="text-center text-sm text-gray-500 mb-8">
          Accès sécurisé à l’interface d’administration
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email */}
          <input
            type="email"
            placeholder="Adresse e-mail"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500/60 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500/60 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-xl bg-gray-800 text-white py-3 font-medium hover:bg-gray-900 transition"
          >
            Se connecter
          </button>
        </form>

        {/* Error */}
        {error && (
          <p className="mt-4 text-center text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  </div>
);

}
