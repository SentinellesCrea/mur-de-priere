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
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // ✅ très important pour utiliser le cookie HTTPOnly
      });

      const data = await res.json();
      console.log("Réponse API login admin:", data);

      if (res.ok) {
        // ✅ Si la connexion est réussie, on redirige vers le dashboard
        router.push("/admin");
      } else {
        setError(data.message || "Erreur lors de la connexion.");
      }
    } catch (err) {
      console.error("Erreur handleLogin admin:", err);
      setError("Erreur de connexion. Veuillez réessayer.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-md mx-auto mt-40 mb-20 p-6 bg-white shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Connexion Admin</h1>

        <form onSubmit={handleLogin}>
          <label className="block mb-2">
            Email :
            <input
              type="email"
              className="border p-2 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="block mb-2">
            Mot de passe :
            <input
              type="password"
              className="border p-2 w-full "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className="w-full bg-gray-800 text-white p-2 hover:bg-blue-700"
          >
            Se connecter
          </button>
        </form>

        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>
      <Footer />
    </div>
  );
}
