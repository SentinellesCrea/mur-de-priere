"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";

const AdminNavbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("adminToken="))
      ?.split("=")[1];

    setIsLoggedIn(!!token);
  }, []);

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
    <nav className="fixed top-0 left-0 w-full bg-gray-900 shadow-md font-[Poppins] z-50">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <div className="text-3xl font-bold tracking-wide ml-20">
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
        <ul className="hidden md:flex space-x-6 text-white ml-auto items-center mr-20">
          <li>
            <Link href="/" className="hover:text-[#a60030]">Accueil</Link>
          </li>
          <li>
            <Link href="/admin/profile" className="hover:text-[#a60030]">🔹 Profil</Link>
          </li>
          <li>
            <Link href="/admin/create-admin" className="hover:text-[#a60030]">🔄 Céder l’administration</Link>
          </li>
          <li className="ml-4">
            <button
              onClick={handleLogout}
              style={{ backgroundColor: "#dc2626", color: "white" }}
              className="inline-block px-4 py-2 rounded hover:bg-red-600 font-semibold"
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

      {/* Menu mobile déroulant */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-md p-4 flex flex-col items-center space-y-4 z-40">
          <Link href="/" onClick={() => setIsOpen(false)} className="hover:text-[#a60030] font-medium">Accueil</Link>
          <Link href="/admin/profile" onClick={() => setIsOpen(false)} className="hover:text-[#a60030] font-medium">🔹 Profil</Link>
          <Link href="/admin/create-admin" onClick={() => setIsOpen(false)} className="hover:text-[#a60030] font-medium">🔄 Créer un administrateur</Link>

          <button
            onClick={handleLogout}
            style={{ backgroundColor: "#dc2626", color: "white" }}
            className="inline-block px-4 py-2 rounded hover:bg-red-600 font-semibold transition"
          >
            Déconnexion
          </button>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;