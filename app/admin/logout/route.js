"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi"; // On utilise ton helper sécurisé

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include", // Important pour envoyer les cookies
        });
      } catch (error) {
        console.error("Erreur lors de la déconnexion :", error.message);
      } finally {
        router.push("/admin/login"); // Redirection même en cas d'erreur
      }
    }

    logout();
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-lg text-gray-600">Déconnexion en cours...</p>
    </div>
  );
};

export default LogoutPage;
