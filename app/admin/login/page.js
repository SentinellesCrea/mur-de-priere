'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi"; // On utilise ton helper sécurisé
import Image from "next/image";
import { FiLock, FiMail } from "react-icons/fi";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  try {
    await fetchApi("/api/admin/login", {
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
  <div className="min-h-screen bg-[#fff7ef] px-4 py-8 text-[#332c26]">
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-2xl border border-[#eadfd3] bg-[#fffdf9] shadow-2xl lg:grid-cols-[1fr_440px]">
      <div className="hidden bg-[#8B1E3F] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Image
          src="/images/logos/mur-de-priere-horizontal.png"
          alt="Logo Mur de Prière"
          width={260}
          height={64}
          priority
          className="h-14 w-auto object-contain brightness-0 invert"
        />
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#FFD9B8]">
            Administration
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-bold leading-tight">
            Piloter les prières, les bénévoles et les contenus depuis un espace clair.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-[#FFECDC]">
            Accès réservé à l&apos;administrateur principal de Mur de Prière.
          </p>
        </div>
        <p className="text-xs text-[#FFD9B8]">Mur de Prière Admin</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Image
            src="/images/logos/mur-de-priere-horizontal.png"
            alt="Logo Mur de Prière"
            width={220}
            height={54}
            priority
            className="mx-auto mb-8 h-12 w-auto object-contain lg:hidden"
          />

          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8B1E3F]">
            Connexion sécurisée
          </p>
          <h2 className="mt-2 text-3xl font-bold text-[#2f2a26]">Espace admin</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B5B4D]">
            Entre tes identifiants pour accéder au tableau de bord.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#5f5146]">Email</span>
              <span className="relative block">
                <FiMail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a58a75]" />
                <input
                  type="email"
                  placeholder="Adresse e-mail"
                  className="h-11 w-full rounded-lg border border-[#d9c7b8] bg-[#fffaf5] pl-10 pr-3 text-sm outline-none transition focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#f8d8e1]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#5f5146]">Mot de passe</span>
              <span className="relative block">
                <FiLock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a58a75]" />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  className="h-11 w-full rounded-lg border border-[#d9c7b8] bg-[#fffaf5] pl-10 pr-3 text-sm outline-none transition focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#f8d8e1]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </span>
            </label>

            <button
              type="submit"
              className="h-11 w-full rounded-lg bg-[#8B1E3F] text-sm font-bold text-white transition hover:bg-[#741733]"
            >
              Se connecter
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-lg bg-[#fff1f1] p-3 text-center text-sm font-semibold text-[#9f1239]">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);

}
