"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Suppression du token (si stocké dans localStorage ou cookies)
    localStorage.removeItem("adminToken");

    // Redirection vers la page de connexion
    router.push("/admin/login");
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-lg text-gray-600">Déconnexion en cours...</p>
    </div>
  );
};

export default LogoutPage;
