"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FiMenu, FiX, FiLogOut } from "react-icons/fi";
import useVolunteerStore from "../../store/VolunteerStore";

export default function VolunteerNavbar() {
  const router = useRouter();
  const { volunteer, setVolunteer } = useVolunteerStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    async function fetchVolunteer() {
      try {
        const res = await fetch("/api/volunteers/me", {
          credentials: "include",
        });
        const data = await res.json();
        setVolunteer(data);
      } catch (error) {
        console.error("Erreur chargement bénévole:", error);
      }
    }

    fetchVolunteer();
  }, []);

  // Clic à l'extérieur pour fermer le menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/volunteers/login");
    } catch (err) {
      console.error("Erreur de déconnexion:", err);
    }
  };

  if (!volunteer) return null;

  return (
    <>
      {/* Navbar fixe en haut */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md font-[Poppins] z-50 h-[80px] flex items-center">
        <div className="flex justify-between items-center px-6 w-full">
          {/* Logo */}
          <div className="text-3xl font-bold tracking-wide">
            <Link href="/">
              <Image
                src="/images/Logo_mur_de_priere.png"
                alt="Logo"
                width={180}
                height={80}
                className="cursor-pointer"
              />
            </Link>
          </div>

          {/* Menu Burger Mobile */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex space-x-5 items-center mr-20">
            <Link href="/volunteers/dashboard" className="text-l text-gray-900 hover:text-blue-600 hover:scale-105 transform transition-transform duration-300">
              Accueil
            </Link>
            <Link href="/volunteers/profile" className="text-l text-gray-900 hover:text-blue-600 hover:scale-105 transform transition-transform duration-300">
              Modifier mon Profil
            </Link>
            <Link href="/" className="text-l text-gray-900 hover:text-blue-600 hover:scale-105 transform transition-transform duration-300">
              Retour au site
            </Link>
            <button
              onClick={handleLogout}
              className="text-l text-red-600 flex items-center gap-1 hover:scale-105 transform transition-transform duration-300"
            >
              <FiLogOut /> Déconnexion
            </button>
          </div>
        </div>
      </nav> 

      {/* Menu mobile qui pousse le contenu */}
      {isMenuOpen && (
        <div ref={menuRef} className="bg-white shadow-md py-4 flex flex-col items-center space-y-4 z-40 ">
          <Link href="/volunteers/dashboard" className="text-gray-900 hover:text-blue-600 hover:scale-105 transform transition-transform duration-300" onClick={() => setIsMenuOpen(false)}>
            Accueil
          </Link>
          <Link href="/volunteers/profile" className="text-gray-900 hover:text-blue-600 hover:scale-105 transform transition-transform duration-300" onClick={() => setIsMenuOpen(false)}>
            Modifier mon Profil
          </Link>
          <Link href="/" className="text-gray-900 hover:text-blue-600 hover:scale-105 transform transition-transform duration-300" onClick={() => setIsMenuOpen(false)}>
            Retour au site
          </Link>
          <button onClick={() => {setIsMenuOpen(false); handleLogout();}}
            className="text-red-600 hover:scale-105 transform transition-transform duration-300 flex items-center gap-1"
          >
            <FiLogOut /> Déconnexion
          </button>
        </div>
      )}
    </>
  );
}