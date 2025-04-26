"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import useVolunteerStore from "../store/VolunteerStore";

export default function VolunteerNavbar() {
  const router = useRouter();
  const { volunteer, setVolunteer } = useVolunteerStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchVolunteer() {
      try {
        const res = await fetch("/api/volunteers/me", {
          credentials: "include",
        });
        const data = await res.json();
        setVolunteer(data);
      } catch (error) {
        console.error("Erreur chargement bénévole :", error);
      }
    }

    fetchVolunteer();
  }, []);

  if (!volunteer) return null;

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow z-50">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="text-3xl font-bold tracking-wide ml-20">
          <Link href="/">
              <Image
                src="/images/Logo_mur_de_priere.png" // Remplace avec le chemin de ton logo
                alt="Logo"
                width={180} // Largeur de l'image en pixels
                height={80} // Hauteur de l'image en pixels
                className="cursor-pointer" // Ajoute un curseur au survol
              />
            </Link>
        </div>

        {/* Menu burger (mobile) */}
        <div className="md:hidden ">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Liens (desktop) */}
        <div className="hidden md:flex space-x-5 items-center mr-20">
          <Link href="/volunteers/dashboard" className="text-l text-blue-600 hover:underline">
            Accueil
          </Link>
          <Link href="/volunteers/profile" className="text-l text-blue-600 hover:underline">
            Modifier mon Profil
          </Link>
          <Link href="/" className="text-l text-gray-600 hover:underline">
            Retour au site
          </Link>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/");
            }}
            className="text-l text-red-600 hover:underline flex items-center gap-1"
          >
            <FiLogOut />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Menu mobile (affiché si ouvert) */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white shadow-md p-4 absolute top-full left-0 w-full flex flex-col items-center">
          <Link href="/volunteers/dashboard" className="text-blue-600 hover:underline">
            Accueil
          </Link>
          <Link href="/volunteers/profile" className="text-blue-600 hover:underline">
            Modifier mon Profil
          </Link>
          <Link href="/" className="text-gray-600 hover:underline">
            Retour au site
          </Link>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/");
            }}
            className="text-red-600 hover:underline flex items-center gap-1"
          >
            <FiLogOut />
            Déconnexion
          </button>
        </div>
      )}
    </nav>
  );
}
