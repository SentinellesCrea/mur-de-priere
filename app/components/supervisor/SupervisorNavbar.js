"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiMenu, FiX, FiLogOut, FiUser, FiHome } from "react-icons/fi";
import Swal from "sweetalert2";

const SupervisorNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Se déconnecter ?",
      text: "Tu vas quitter ton espace superviseur.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, me déconnecter",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    try {
      setIsOpen(false);
      await fetch("/api/supervisor/logout", {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("supervisorToken");
      router.push("/volunteers/login");
    } catch (err) {
      console.error("Erreur déconnexion :", err);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md border-b border-[#eeeafd] z-50 h-[82px] flex items-center">
        <div className="flex max-w-[1300px] mx-auto justify-between items-center px-6 lg:px-20 w-full">
          <Link href="/supervisor/dashboard" className="flex items-center gap-3">
            <Image
              src="/images/Logo_mur_de_priere.png"
              alt="Logo Mur de Prière"
              width={150}
              height={80}
              className="cursor-pointer"
              style={{ width: "auto", height: "auto" }}
            />
            <span className="hidden lg:inline-flex px-3 py-1 rounded-full bg-[#F1EEFF] text-[#5c40e7] text-[11px] font-extrabold uppercase tracking-wide">
              Superviseur
            </span>
          </Link>

          <ul className="hidden md:flex gap-2 text-gray-700 ml-auto items-center">
            <li>
              <Link href="/supervisor/dashboard" className="px-4 py-2 rounded-2xl hover:bg-[#F1EEFF] hover:text-[#5c40e7] font-bold text-sm transition">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/" className="px-4 py-2 rounded-2xl hover:bg-[#F1EEFF] hover:text-[#5c40e7] font-bold text-sm transition">
                Mur de prière
              </Link>
            </li>
            <li>
              <Link href="/supervisor/profile" className="px-4 py-2 rounded-2xl hover:bg-[#F1EEFF] hover:text-[#5c40e7] font-bold text-sm transition">
                Profil
              </Link>
            </li>
            <li className="ml-2">
              <button
              onClick={handleLogout}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-sm hover:bg-red-100 transition"
            >
              <FiLogOut /> Déconnexion
            </button>
            </li>
          </ul>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="size-11 rounded-2xl bg-[#F1EEFF] text-[#5c40e7] flex items-center justify-center"
              aria-label="Ouvrir le menu superviseur"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div ref={menuRef} className="fixed top-[82px] left-4 right-4 bg-white shadow-xl border border-[#eeeafd] rounded-[2rem] py-4 px-4 flex flex-col gap-2 z-40 md:hidden">
          <Link href="/supervisor/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#F1EEFF] text-gray-800 font-bold">
            <FiHome className="text-[#5c40e7]" /> Dashboard
          </Link>
          <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#F1EEFF] text-gray-800 font-bold">
            <FiHome className="text-[#5c40e7]" /> Mur de prière
          </Link>
          <Link href="/supervisor/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#F1EEFF] text-gray-800 font-bold">
            <FiUser className="text-[#5c40e7]" /> Profil
          </Link>

          <button
            onClick={() => {
              handleLogout();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 text-red-600 font-bold"
          >
            <FiLogOut /> Déconnexion
          </button>
        </div>
      )}
    </>
  );
};

export default SupervisorNavbar;
