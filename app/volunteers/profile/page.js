"use client";

import { useEffect, useState } from "react";
import Button from "../../components/ui/button";
import VolunteerNavbar from "../../components/VolunteerNavbar";
import useVolunteerStore from "../../store/VolunteerStore";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

const VolunteerProfile = () => {
  const { setVolunteer } = useVolunteerStore();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/volunteers/me", { credentials: "include" });
      const data = await res.json();

      if (!res.ok) {
        console.error("Erreur API profil :", data.error);
        return;
      }

      setFirstName(data.firstName || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");

      // Optionnel : stocker en global
      setVolunteer(data);
    } catch (err) {
      console.error("Erreur lors du chargement du profil :", err);
    }
  };
  fetchProfile();
}, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast({
        title: (
          <div className="flex items-center space-x-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span>Erreur</span>
          </div>
        ),
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("email", email);
    formData.append("phone", phone);
    if (password) formData.append("password", password);

    try {
      const res = await fetch("/api/volunteers/profile", {
        method: "PUT",
        body: formData,
      });


      if (res.ok && updated) {
        setVolunteer(updated);
        toast({
          title: (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Profil mis à jour</span>
            </div>
          ),
          description: "Vos informations ont été enregistrées avec succès.",
          duration: 4000,
        });
      } else {
        toast({
          title: (
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>Erreur de mise à jour</span>
            </div>
          ),
          description: "Une erreur est survenue, veuillez réessayer.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Erreur mise à jour :", err);
    }
  };

  return (
    <div className="w-full">
      <VolunteerNavbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">👤 Mon Profil</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block mb-1 font-medium">Prénom</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-2 rounded pr-10"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <Button type="submit" className="bg-[#d4967d] text-white w-full">
            Mettre à jour
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VolunteerProfile;
