"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { fetchApi } from "@/lib/fetchApi";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const VolunteerSignupPage = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);

    try {
      await fetchApi("/api/volunteers/signup", {
        method: "POST",
        body: JSON.stringify(form),
      });

      toast.success("✅ Votre candidature a été envoyée ! Nous vous contacterons bientôt.");

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        router.push("/volunteers/login");
      }, 3000);
    } catch (error) {
      console.error("Erreur inscription bénévole :", error.message);
      toast.error("Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-20">
      <Navbar />

      <div className="min-h-screen bg-gray-100 py-16 px-4 md:px-12 flex flex-col md:flex-row items-start md:items-start justify-center gap-12">
        {/* Texte animé */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="md:w-1/2 text-gray-800"
        >
          <h1 className="text-3xl font-bold mb-6">Pourquoi devenir bénévole ?</h1>

          <p className="mb-4">
            Rejoindre l'équipe des bénévoles du <strong>Mur de Prière</strong>, c'est choisir de mettre son temps et son cœur au service des autres. Vous serez un maillon précieux d'une chaîne de compassion, d'écoute et d'encouragement pour tous ceux qui déposent des sujets de prière.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">Nos valeurs</h2>
          <p className="mb-4">
            Nous croyons en une foi vivante, en la puissance de la prière et en l’amour fraternel. Chaque bénévole agit dans un esprit de bienveillance, de respect et de confidentialité. Aucune demande n’est traitée à la légère.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">Un grand merci</h2>
          <p className="mb-4 italic text-gray-700">
            Merci pour votre volonté d’aider et d’aimer. Grâce à vous, cette œuvre peut grandir, toucher des vies, et porter toujours plus de fruits. Que Dieu vous bénisse richement pour votre cœur ouvert et disponible.
          </p>
        </motion.div>

        {/* Formulaire */}
        <div className="md:w-[30rem] w-full bg-white p-10 shadow-lg rounded-md">
          <h2 className="text-2xl font-semibold text-center mb-6">Inscription Bénévole</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input 
                type="text" 
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-md"
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
                className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-md"
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
                className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-md"
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
                className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-md"
                placeholder="Téléphone"
                required
              />
            </div>
            <div className="mb-4">
              <input 
                type="password" 
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-md"
                placeholder="Mot de passe"
                required
              />
            </div>
            <div className="mb-6">
              <input 
                type="password" 
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-md"
                placeholder="Confirmez le mot de passe"
                required
              />
            </div>

            <div className="mb-4 flex items-start gap-2">
              <input
                type="checkbox"
                defaultChecked
                required
                className="mt-1"
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
              className="w-full bg-gray-800 text-white py-3 hover:bg-gray-900 transition rounded-md"
              disabled={isLoading}
            >
              {isLoading ? "Inscription en cours..." : "S'inscrire"}
            </button>
          </form>

          <div className="text-center mt-4 text-sm text-gray-600">
            Vous avez déjà un compte ? {" "}
            <Link href="/volunteers/login" className="hover:underline text-[#d8947c]">
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
