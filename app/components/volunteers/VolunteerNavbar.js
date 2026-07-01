"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FiMenu, FiX, FiLogOut } from "react-icons/fi";
import useVolunteerStore from "../../store/VolunteerStore";
import Swal from "sweetalert2";

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
  }, [setVolunteer]);

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
    const result = await Swal.fire({
      title: "Se déconnecter ?",
      text: "Tu vas quitter ton espace bénévole.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, me déconnecter",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    try {
      setIsMenuOpen(false);
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
      <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-sm border-b border-[#F2DEC9] z-50 h-[80px] flex items-center">
        <div className="flex justify-between items-center px-6 w-full">
          {/* Logo */}
          <div className="text-3xl font-bold tracking-wide">
            <Link href="/">
              <Image
                src="/images/logos/mur-de-priere-navbar.png"
                alt="Logo Mur de Prière"
                width={240}
                height={58}
                className="h-12 w-auto cursor-pointer object-contain md:h-14"
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
          <div className="hidden md:flex space-x-3 items-center mr-20">
            <Link href="/volunteers/dashboard" className="text-sm font-bold text-[#3F3328] hover:text-[#B97952] px-4 py-3 rounded-2xl hover:bg-[#FFF0CF] transition">
              Accueil
            </Link>
            <Link href="/volunteers/profile" className="text-sm font-bold text-[#3F3328] hover:text-[#B97952] px-4 py-3 rounded-2xl hover:bg-[#FFF0CF] transition">
              Modifier mon Profil
            </Link>
            <Link href="/" className="text-sm font-bold text-[#3F3328] hover:text-[#B97952] px-4 py-3 rounded-2xl hover:bg-[#FFF0CF] transition">
              Retour au site
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-bold text-[#D8614C] flex items-center gap-2 px-4 py-3 rounded-2xl hover:bg-[#FFE3DC] transition"
            >
              <FiLogOut /> Déconnexion
            </button>
          </div>
        </div>
      </nav> 

      {/* Menu mobile qui pousse le contenu */}
      {isMenuOpen && (
        <div ref={menuRef} className="bg-white/95 backdrop-blur-md shadow-md py-4 flex flex-col items-center space-y-4 z-40 border-b border-[#F2DEC9]">
          <Link href="/volunteers/dashboard" className="text-[#3F3328] font-bold hover:text-[#B97952]" onClick={() => setIsMenuOpen(false)}>
            Accueil
          </Link>
          <Link href="/volunteers/profile" className="text-[#3F3328] font-bold hover:text-[#B97952]" onClick={() => setIsMenuOpen(false)}>
            Modifier mon Profil
          </Link>
          <Link href="/" className="text-[#3F3328] font-bold hover:text-[#B97952]" onClick={() => setIsMenuOpen(false)}>
            Retour au site
          </Link>
          <button onClick={handleLogout}
            className="text-[#D8614C] font-bold flex items-center gap-1"
          >
            <FiLogOut /> Déconnexion
          </button>
        </div>
      )}
    </>
  );
}
