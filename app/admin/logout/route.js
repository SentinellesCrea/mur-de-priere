"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi"; // Ton helper sécurisé

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      try {
        await fetchApi("/api/auth/logout", {
          method: "POST",
        });
      } catch (error) {
        console.error("Erreur lors de la déconnexion :", error.message);
      } finally {
        router.push("/admin/login"); // Redirection dans tous les cas
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
