"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { fetchApi } from "@/lib/fetchApi";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const PASSWORD_RULES = [
  { key: "length", label: "12 caractères minimum", test: (password) => password.length >= 12 },
  { key: "uppercase", label: "Au moins une majuscule", test: (password) => /[A-Z]/.test(password) },
  { key: "number", label: "Au moins un chiffre", test: (password) => /\d/.test(password) },
  { key: "special", label: "Au moins un caractère spécial", test: (password) => /[^A-Za-z0-9]/.test(password) },
];

const VolunteerSignupPage = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const passwordChecks = PASSWORD_RULES.map((rule) => ({
    ...rule,
    valid: rule.test(form.password),
  }));
  const isPasswordStrong = passwordChecks.every((rule) => rule.valid);
  const hasConfirmPassword = form.confirmPassword.length > 0;
  const passwordsMatch = hasConfirmPassword && form.password === form.confirmPassword;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!isPasswordStrong) {
      toast.error("Le mot de passe n’est pas suffisamment sécurisé.");
      return;
    }

    setIsLoading(true);

    try {
      await fetchApi("/api/volunteers/signup", {
        method: "POST",
        body: form,
      });

      toast.success("✅ Votre candidature a été envoyée ! Nous vous contacterons bientôt.");

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gender: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        router.push("/volunteers/login");
      }, 3000);
    } catch (error) {
      console.error("Erreur inscription bénévole :", error.message);
      toast.error(error.message || "Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#F7F5F2]">
      <Navbar />

      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#F8E8DD,_transparent_35%),linear-gradient(135deg,_#F7F5F2,_#F3F0EC)] py-16 px-4 md:px-12 flex flex-col md:flex-row items-start md:items-start justify-center gap-12">
        {/* Texte animé */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="md:w-1/2 text-gray-800 bg-white/60 border border-white/70 rounded-[2rem] p-8 shadow-sm shadow-black/5"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#d8947c] mb-3">
            Mur de Prière
          </p>
          <h1 className="text-3xl font-extrabold mb-6 text-gray-900">Pourquoi devenir bénévole ?</h1>

          <p className="mb-4">
            Rejoindre l'équipe des bénévoles du <strong>Mur de Prière</strong>, c'est choisir de mettre son temps et son cœur au service des autres. Vous serez un maillon précieux d'une chaîne de compassion, d'écoute et d'encouragement pour tous ceux qui déposent des sujets de prière.
          </p>

          <h2 className="text-xl font-extrabold mt-6 mb-2 text-gray-900">Nos valeurs</h2>
          <p className="mb-4">
            Nous croyons en une foi vivante, en la puissance de la prière et en l’amour fraternel. Chaque bénévole agit dans un esprit de bienveillance, de respect et de confidentialité. Aucune demande n’est traitée à la légère.
          </p>

          <h2 className="text-xl font-extrabold mt-6 mb-2 text-gray-900">Un grand merci</h2>
          <p className="mb-4 italic text-gray-700">
            Merci pour votre volonté d’aider et d’aimer. Grâce à vous, cette œuvre peut grandir, toucher des vies, et porter toujours plus de fruits. Que Dieu vous bénisse richement pour votre cœur ouvert et disponible.
          </p>
        </motion.div>

        {/* Formulaire */}
        <div className="md:w-[30rem] w-full bg-white/90 backdrop-blur-md p-8 md:p-10 shadow-xl shadow-black/5 border border-white/70 rounded-[2rem]">
          <div className="mx-auto mb-5 size-14 rounded-2xl bg-[#F8E8DD] text-[#d8947c] flex items-center justify-center font-black text-xl">
            MP
          </div>
          <h2 className="text-2xl font-extrabold text-center text-gray-900 mb-2">Inscription bénévole</h2>
          <p className="text-center text-sm text-gray-500 mb-6">
            Créez votre compte, puis un superviseur validera votre accès.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input 
                type="text" 
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="w-full p-4 border border-gray-200 bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d8947c]/30 rounded-2xl transition"
                placeholder="Prénom"
                required
              />
            </div>
            <div className="mb-4">
              <input 
                type="text" 
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="w-full p-4 border border-gray-200 bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d8947c]/30 rounded-2xl transition"
                placeholder="Nom"
                required
              />
            </div>
            <div className="mb-4">
              <input 
                type="email" 
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-4 border border-gray-200 bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d8947c]/30 rounded-2xl transition"
                placeholder="E-mail"
                required
              />
            </div>
            <div className="mb-4">
              <input 
                type="tel" 
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full p-4 border border-gray-200 bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d8947c]/30 rounded-2xl transition"
                placeholder="Téléphone"
                required
              />
            </div>
            <div className="mb-4">
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full p-4 border border-gray-200 bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d8947c]/30 rounded-2xl transition"
                required
              >
                <option value="">Genre</option>
                <option value="female">Femme</option>
                <option value="male">Homme</option>
                <option value="other">Autre</option>
                <option value="prefer_not_to_say">Préfère ne pas dire</option>
              </select>
            </div>
            <div className="mb-4">
              <input 
                type="password" 
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-4 border border-gray-200 bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d8947c]/30 rounded-2xl transition"
                placeholder="Mot de passe"
                required
              />
            </div>
            {form.password && (
              <div className="mb-4 rounded-2xl bg-gray-50 border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Sécurité du mot de passe</p>
                <div className="space-y-1">
                  {passwordChecks.map((rule) => (
                    <p
                      key={rule.key}
                      className={`text-xs font-medium ${rule.valid ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {rule.valid ? "✓" : "✕"} {rule.label}
                    </p>
                  ))}
                </div>
              </div>
            )}
            <div className="mb-6">
              <input 
                type="password" 
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full p-4 border border-gray-200 bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d8947c]/30 rounded-2xl transition"
                placeholder="Confirmez le mot de passe"
                required
              />
              {hasConfirmPassword && (
                <p className={`mt-2 text-xs font-semibold ${passwordsMatch ? "text-emerald-600" : "text-red-500"}`}>
                  {passwordsMatch
                    ? "✓ Les mots de passe correspondent."
                    : "✕ Les mots de passe ne correspondent pas."}
                </p>
              )}
            </div>

            <div className="mb-4 flex items-start gap-2">
              <input
                type="checkbox"
                defaultChecked
                required
                className="mt-1 accent-[#d8947c]"
              />
              <label className="text-sm text-gray-700">
                J’accepte les{" "}
                <Link href="/volunteers/conditions" className="underline text-[#d8947c] hover:text-gray-700">
                  conditions pour devenir bénévole
                </Link>
              </label>
            </div>

            <button 
              type="submit" 
              className="w-full bg-gray-900 text-white py-4 hover:bg-gray-800 hover:scale-[1.01] transition rounded-2xl font-extrabold shadow-lg shadow-gray-900/10 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={isLoading || !isPasswordStrong || !passwordsMatch}
            >
              {isLoading ? "Inscription en cours..." : "S'inscrire"}
            </button>
          </form>

          <div className="text-center mt-4 text-sm text-gray-600">
            Vous avez déjà un compte ? {" "}
            <Link href="/volunteers/login" className="hover:underline text-[#d8947c] font-bold">
              Connectez-vous
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VolunteerSignupPage;
