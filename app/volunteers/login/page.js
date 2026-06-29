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
  <div className="min-h-screen flex flex-col bg-[#F7F5F2]">
    <Navbar />

    {/* ====== Background ====== */}
    <div className="flex-1 flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_#F8E8DD,_transparent_35%),linear-gradient(135deg,_#F7F5F2,_#F3F0EC)] px-4 py-16">
      
      {/* ====== Card ====== */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-[2rem] shadow-xl shadow-black/5 border border-white/70 p-8 md:p-10 transition-all">
        
        <div className="mx-auto mb-6 size-14 rounded-2xl bg-[#F8E8DD] text-[#d8947c] flex items-center justify-center font-black text-xl">
          MP
        </div>

        <h2 className="text-2xl font-extrabold text-center text-gray-900 mb-2">
          Espace des bénévoles
        </h2>
        <p className="text-center text-sm text-gray-500 mb-8">
          Connectez-vous pour accéder à votre espace personnel
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email */}
          <input
            type="email"
            className="w-full px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d8947c]/30 transition"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d8947c]/30 pr-12 transition"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-gray-900 text-white py-4 font-extrabold shadow-lg shadow-gray-900/10 hover:bg-gray-800 hover:scale-[1.01] transition disabled:opacity-70 disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Connexion…
              </span>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          <button
            onClick={() => setShowModal(true)}
            className="text-gray-600 hover:text-[#d8947c] hover:underline"
          >
            Mot de passe oublié ?
          </button>

          <div>
            <Link href="/volunteers/signup" className="text-[#d8947c] font-bold hover:underline">
              Créer un compte
            </Link>
            <span className="mx-2">•</span>
            <Link href="/admin/login" className="hover:underline">
              Accès admin
            </Link>
          </div>
        </div>
      </div>
    </div>

    {/* ====== Modal Reset Password ====== */}
    {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-sm p-6 animate-fade-in border border-white/70">
          <h3 className="text-lg font-extrabold text-gray-900 mb-2">
            Réinitialiser le mot de passe
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Entrez votre e-mail pour recevoir un lien de réinitialisation.
          </p>

          <input
            type="email"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/70 focus:ring-2 focus:ring-[#d8947c]/30 outline-none mb-4"
            placeholder="Votre e-mail"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-3 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition"
            >
              Annuler
            </button>
            <button
              onClick={handleResetPassword}
              className="px-4 py-3 rounded-2xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition"
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  ); 
};

export default VolunteerLoginPage;
