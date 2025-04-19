"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const useAdminAuth = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.push("/admin/login"); // Redirige vers la connexion si pas de token
    } else {
      setLoading(false);
    }
  }, [router]);

  return { loading };
};

export default useAdminAuth;
