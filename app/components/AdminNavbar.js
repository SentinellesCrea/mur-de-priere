"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";

const AdminNavbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);  // 🔥 ref pour détecter les clics en dehors
  const router = useRouter();

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("adminToken="))
      ?.split("=")[1];

    setIsLoggedIn(!!token);
  }, []);

  // 🔥 Ajout de l'écouteur pour fermer quand on clique ailleurs
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
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      localStorage.removeItem("adminToken");
      router.push("/admin/login");
    } catch (err) {
      console.error("Erreur déconnexion :", err);
    }
  };

  return (
    <>
      {/* NAVBAR FIXE */}
      <nav className="fixed top-0 left-0 w-full bg-gray-900 shadow-md font-[Poppins] z-50 h-[80px] flex items-center">
        <div className="flex justify-between items-center px-6 w-full">
          {/* Logo */}
          <div className="text-3xl font-bold tracking-wide">
            <Link href="/">
              <Image
                src="/images/Logo_mur_de_priere_blanc.png"
                alt="Logo"
                width={150}
                height={80}
                className="cursor-pointer"
              />
            </Link>
          </div>

          {/* Menu Desktop */}
          <ul className="hidden md:flex space-x-6 text-white ml-auto items-center">
            <li><Link href="/" className="hover:text-[#a60030]">Accueil Mur de prière</Link></li>
            <li><Link href="/admin/profile" className="hover:text-[#a60030]">Modifier mon Profil</Link></li>
            <li><Link href="/admin/create-admin" className="hover:text-[#a60030]">Créer un Admin</Link></li>
            <li>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold"
              >
                Déconnexion
              </button>
            </li>
          </ul>

          {/* Menu Burger Mobile */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <FiX size={24} color="#fff" /> : <FiMenu size={24} color="#fff" />}
            </button>
          </div>
        </div>
      </nav>

      {/* MENU MOBILE déroulant */}
      {isOpen && (
        <div ref={menuRef} className="mt-[80px] bg-white shadow-md py-4 flex flex-col items-center space-y-4 z-40">
          <Link href="/" onClick={() => setIsOpen(false)} className="hover:text-[#a60030] font-medium">
            Accueil Mur de prière
          </Link>
          <Link href="/admin/profile" onClick={() => setIsOpen(false)} className="hover:text-[#a60030] font-medium">
            Modifier mon Profil
          </Link>
          <Link href="/admin/create-admin" onClick={() => setIsOpen(false)} className="hover:text-[#a60030] font-medium">
            Créer un Admin
          </Link>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold"
          >
            Déconnexion
          </button>
        </div>
      )}
    </>
  );
};

export default AdminNavbar;
