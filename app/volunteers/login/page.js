"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import useVolunteerStore from "../../store/VolunteerStore";
import { fetchApi } from "@/lib/fetchApi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";

const VolunteerLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const setVolunteer = useVolunteerStore((state) => state.setVolunteer);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetchApi("/api/volunteers/login", {
        method: "POST",
        body: { email, password },
      });

      const profileRes = await fetchApi("/api/volunteers/me");

      if (profileRes?.role) {
        setVolunteer(profileRes);
        if (profileRes.role === "supervisor") {
          router.push("/supervisor/dashboard");
        } else if (profileRes.role === "volunteer") {
          router.push("/volunteers/dashboard");
        } else {
          toast.error("Rôle non reconnu.");
        }
      } else {
        toast.error("Impossible de récupérer votre profil.");
      }
    } catch (error) {
      console.error("Erreur connexion :", error.message);
      toast.error(error.message || "Identifiants incorrects.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error("Veuillez entrer votre e-mail.");
      return;
    }

    try {
      await fetchApi("/api/volunteers/reset-password", {
        method: "POST",
        body: { email: resetEmail },
      });

      Swal.fire(
        "Lien envoyé 📧",
        "Un lien de réinitialisation a été envoyé à votre adresse e-mail.",
        "success"
      );
      setShowModal(false);
    } catch (error) {
      console.error("Erreur reset password :", error.message);
      Swal.fire("Erreur", error.message || "Erreur lors de la demande.", "error");
    }
  };

  return (
    <div>
      <Navbar />

      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-12 shadow-lg w-120">
          <h2 className="text-2xl font-semibold text-center mb-6">Espace des Bénévoles</h2>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <input
                type="email"
                className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 pr-10"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-800 text-white py-3 hover:bg-gray-900 transition"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Connexion...
                </span>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <div className="text-center mt-4 text-sm text-gray-600">
            <button
              onClick={() => setShowModal(true)}
              className="hover:underline text-gray-600"
            >
              Mot de passe oublié ?
            </button>
            &nbsp; | &nbsp;
            <Link href="/volunteers/signup" className="hover:underline">Créer un compte</Link><br /><br />
            <Link href="/admin" className="hover:underline">Accès Admin</Link>
          </div>
        </div>
      </div>

      {/* Modal de reset password */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Réinitialiser le mot de passe</h3>
            <p className="text-sm text-gray-600 mb-4">
              Entrez votre e-mail et nous vous enverrons un lien de réinitialisation.
            </p>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Votre e-mail"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
            <div className="flex justify-between">
              <button
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-900"
                onClick={handleResetPassword}
              >
                Envoyer
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={() => setShowModal(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default VolunteerLoginPage;
