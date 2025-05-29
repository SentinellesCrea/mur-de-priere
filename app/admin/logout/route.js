"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      try {
        await fetch("/api/admin/logout", {
          method: "POST",
          credentials: "include", // 🔐 Nécessaire pour que le cookie HTTPOnly soit bien transmis
        });
      } catch (error) {
        console.error("Erreur lors de la déconnexion :", error.message);
      } finally {
        setTimeout(() => {
          router.push("/admin/login");
        }, 200); // ⏱ Laisse le temps au cookie d'être supprimé avant redirection
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
