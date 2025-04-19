"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NavbarOther from "../../components/NavbarOther";
import useVolunteerStore from "../../store/VolunteerStore";

const VolunteerLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const router = useRouter();
  const setVolunteer = useVolunteerStore((state) => state.setVolunteer);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/volunteers/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const { token } = await res.json();
      document.cookie = `volunteerToken=${token}; path=/`;

      const profileRes = await fetch("/api/volunteers/profile", {
        method: "GET",
        credentials: "include",
      });

      if (profileRes.ok) {
        const volunteerData = await profileRes.json();
        console.log("✅ Données bénévole récupérées :", volunteerData);
        setVolunteer(volunteerData);
      } else {
        console.warn("❌ Impossible de charger les données du bénévole");
      }

      router.push("/volunteers/dashboard");
    } else {
      setError("Identifiants incorrects. Veuillez réessayer.");
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) return;

    const res = await fetch("/api/volunteers/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetEmail }),
    });

    if (res.ok) {
      alert("Un lien de réinitialisation a été envoyé à votre e-mail.");
      setShowModal(false);
    } else {
      alert("Erreur lors de la demande de réinitialisation.");
    }
  };

  return (
    <div>
      <NavbarOther />
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
              />
            </div>
            <div className="mb-6">
              <input 
                type="password" 
                className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400" 
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <button 
              type="submit" 
              className="w-full bg-gray-800 text-white py-3 hover:bg-gray-900 transition"
            >
              Se connecter
            </button>
          </form>
          <div className="text-center mt-4 text-sm text-gray-600">
            <button onClick={() => setShowModal(true)} className="hover:underline text-gray-600">
              Mot de passe oublié ?
            </button>
            &nbsp; | &nbsp;
            <Link href="/volunteers/signup" className="hover:underline">Créer un compte</Link><br/><br/>
            <Link href="/admin/login" className="hover:underline">Espace Admin</Link>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default VolunteerLoginPage;