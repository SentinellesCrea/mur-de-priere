"use client";

import { useEffect, useState } from "react";
import Button from "../../components/ui/button";
import VolunteerNavbar from "../../components/volunteers/VolunteerNavbar";
import useVolunteerStore from "../../store/VolunteerStore";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { fetchApi } from "@/lib/fetchApi"; // Ton helper sécurisé
import { toast } from "react-toastify";
import { CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

const VolunteerProfile = () => {
  const { setVolunteer } = useVolunteerStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await fetchApi("/api/volunteers/me");

        if (data) {
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          setGender(data.gender || data.profile?.gender || "");
          setDateOfBirth(data.dateOfBirth ? String(data.dateOfBirth).slice(0, 10) : "");
          setAddress(data.address || data.profile?.address || "");
          setProfileImage(data.profileImage || "");
          setVolunteer(data);
        }
      } catch (err) {
        console.error("Erreur lors du chargement du profil :", err.message);
        toast.error("Erreur lors du chargement de votre profil.");
      }
    };
    fetchProfile();
  }, [setVolunteer]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("gender", gender);
    formData.append("dateOfBirth", dateOfBirth);
    formData.append("address", address);
    if (password) formData.append("password", password);

    try {
      const res = await fetch("/api/volunteers/profile", {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const updated = await res.json();

      if (res.ok) {
        let finalProfile = updated;

        if (photo) {
          const uploadFormData = new FormData();
          uploadFormData.append("file", photo);

          const uploadResponse = await fetch("/api/volunteers/upload", {
            method: "POST",
            credentials: "include",
            body: uploadFormData,
          });

          const uploadData = await uploadResponse.json();
          if (!uploadResponse.ok) {
            throw new Error(uploadData.error || "Erreur upload image");
          }

          const imageResponse = await fetchApi("/api/volunteers/profile-image", {
            method: "PUT",
            body: { path: uploadData.url || uploadData.path },
          });

          finalProfile = {
            ...updated,
            profileImage: imageResponse.profileImage,
          };
          setProfileImage(imageResponse.profileImage || "");
          setPhoto(null);
        }

        setVolunteer(finalProfile);
        toast.success("✅ Profil mis à jour avec succès !");
      } else {
        console.error("Erreur mise à jour profil:", updated.error);
        toast.error(updated.error || "Erreur lors de la mise à jour.");
      }
    } catch (err) {
      console.error("Erreur mise à jour profil :", err.message);
      toast.error("Erreur serveur lors de la mise à jour.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[radial-gradient(circle_at_top_left,_#F8E8DD,_transparent_34%),linear-gradient(135deg,_#FAF7F2,_#F3EEE7)]">
      <VolunteerNavbar />
      <div className="max-w-4xl mx-auto px-4 pt-32 pb-12">
        <div className="bg-white/90 rounded-[2rem] shadow-sm border border-white/70 p-6 lg:p-8 mb-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#B97952] mb-3">
            Espace bénévole
          </p>
          <h1 className="text-3xl font-extrabold text-[#3F3328]">👤 Mon profil</h1>
          <p className="text-sm text-[#6F6256] mt-2">
            Garde tes informations à jour pour faciliter les suivis de prière.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white/90 rounded-[2rem] shadow-sm border border-white/70 p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 font-extrabold text-[#3F3328]">Prénom</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-[#F2DEC9] bg-[#FFFCF7] p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B97952]/20"
            />
          </div>

          <div>
            <label className="block mb-2 font-extrabold text-[#3F3328]">Nom</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-[#F2DEC9] bg-[#FFFCF7] p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B97952]/20"
            />
          </div>

          <div>
            <label className="block mb-2 font-extrabold text-[#3F3328]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#F2DEC9] bg-[#FFFCF7] p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B97952]/20"
            />
          </div>

          <div>
            <label className="block mb-2 font-extrabold text-[#3F3328]">Téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-[#F2DEC9] bg-[#FFFCF7] p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B97952]/20"
            />
          </div>

          <div>
            <label className="block mb-2 font-extrabold text-[#3F3328]">Genre</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border border-[#F2DEC9] bg-[#FFFCF7] p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B97952]/20"
            >
              <option value="">Non renseigné</option>
              <option value="female">Femme</option>
              <option value="male">Homme</option>
              <option value="other">Autre</option>
              <option value="prefer_not_to_say">Préfère ne pas dire</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-extrabold text-[#3F3328]">Date de naissance</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full border border-[#F2DEC9] bg-[#FFFCF7] p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B97952]/20"
            />
          </div>
          </div>

          <div>
            <label className="block mb-2 font-extrabold text-[#3F3328]">Adresse</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full border border-[#F2DEC9] bg-[#FFFCF7] p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B97952]/20"
            />
          </div>

          <div>
            <label className="block mb-2 font-extrabold text-[#3F3328]">Photo de profil</label>
            {profileImage && (
              <Image
                src={profileImage}
                alt="Photo de profil"
                width={80}
                height={80}
                className="mb-3 h-20 w-20 rounded-full object-cover border"
              />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="w-full border border-[#F2DEC9] bg-[#FFFCF7] p-4 rounded-2xl file:mr-4 file:rounded-xl file:border-0 file:bg-[#FFF0CF] file:px-4 file:py-2 file:text-[#8A5A3B] file:font-bold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 font-extrabold text-[#3F3328]">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#F2DEC9] bg-[#FFFCF7] p-4 rounded-2xl pr-10 focus:outline-none focus:ring-2 focus:ring-[#B97952]/20"
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
            <label className="block mb-2 font-extrabold text-[#3F3328]">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-[#F2DEC9] bg-[#FFFCF7] p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B97952]/20"
            />
          </div>
          </div>

          <Button type="submit" className="bg-[#B97952] hover:bg-[#8A5A3B] text-white w-full rounded-2xl py-4 font-extrabold">
            Mettre à jour
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VolunteerProfile;
