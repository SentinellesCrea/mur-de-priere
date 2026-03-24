"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      try {
        await fetch("/api/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.error("Erreur logout :", error);
      } finally {
        router.replace("/");
      }
    }

    logout();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600 text-lg">Déconnexion...</p>
    </div>
  );
}