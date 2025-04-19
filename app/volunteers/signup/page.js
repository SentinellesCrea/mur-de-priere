"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const VolunteerSignupPage = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const res = await fetch("/api/volunteers/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSuccess("Votre candidature a bien été envoyée. Nous vous contacterons bientôt !");
      setForm({ firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" });
    } else {
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <div>
      <Navbar />

      {/* Message d'information */}
      <div className="flex justify-center items-center text-center bg-gray-100 p-4 rounded-lg max-w-2xl mx-auto mt-20">
        <p className="text-gray-800 font-semibold">
          Merci de votre envie de rejoindre notre équipe de bénévoles ! Votre engagement nous touche.  
          Chaque candidature est étudiée avec soin afin de garantir un accompagnement de qualité.  
          Nous reviendrons vers vous rapidement pour vous tenir informé(e). À bientôt !
        </p>
      </div>

      {/* Formulaire d'inscription */}
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-12 shadow-lg w-[30rem]">
          <h2 className="text-2xl font-semibold text-center mb-6">Inscription Bénévole</h2>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && <p className="text-green-500 text-center mb-4">{success}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input 
                type="text" 
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
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
                className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
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
                className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="E-mail"
                required
              />
            </div>
            <div className="mb-4">
              <input 
                type="phone" 
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
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
                className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
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
                className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="Confirmez le mot de passe"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-gray-800 text-white py-3 hover:bg-gray-900 transition"
            >
              S'inscrire
            </button>
          </form>

          <div className="text-center mt-4 text-sm text-gray-600">
            Déjà un compte ?{" "}
            <Link href="/volunteers/login" className="hover:underline text-gray-800">
              Se connecter
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VolunteerSignupPage;
