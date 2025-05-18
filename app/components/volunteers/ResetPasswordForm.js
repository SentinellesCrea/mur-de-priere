'use client';

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "../Navbar";
import { fetchApi } from "@/lib/fetchApi";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const res = await fetchApi("/api/volunteers/update-password", {
        method: "POST",
        body: { token, newPassword: password },
      });

      setSuccess("Mot de passe mis à jour. Redirection en cours...");
      setTimeout(() => router.push("/volunteers/login"), 3000);
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour.");
    }
  };

  if (!token) {
    return <p className="text-red-600 p-4">Lien invalide ou expiré.</p>;
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-md shadow-md w-full max-w-md"
        >
          <h2 className="text-2xl font-semibold mb-4">Réinitialiser votre mot de passe</h2>

          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-2">{success}</p>}

          {/* Champ nouveau mot de passe */}
          <label className="block mb-2 text-sm">Nouveau mot de passe</label>
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full border px-3 py-2 rounded pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-600"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {/* Champ confirmation */}
          <label className="block mb-2 text-sm">Confirmer le mot de passe</label>
          <div className="relative mb-6">
            <input
              type={showConfirm ? "text" : "password"}
              className="w-full border px-3 py-2 rounded pr-10"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-2.5 text-gray-600"
            >
              {showConfirm ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[#a60030] text-white py-2 rounded hover:bg-[#850026]"
          >
            Réinitialiser
          </button>
        </form>
      </div>
    </div>
  );
}
