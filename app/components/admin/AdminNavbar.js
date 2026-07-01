"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import {
  FiExternalLink,
  FiHome,
  FiLogOut,
  FiMenu,
  FiUser,
  FiUserPlus,
  FiX,
} from "react-icons/fi";

const navLinks = [
  { href: "/admin", label: "Tableau de bord", icon: FiHome },
  { href: "/", label: "Mur public", icon: FiExternalLink, external: true },
  { href: "/admin/profile", label: "Profil", icon: FiUser },
  { href: "/admin/promoteToSupervisor", label: "Créer un superviseur", icon: FiUserPlus },
];

export default function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await fetchApi("/api/admin/logout", { method: "POST" });
      localStorage.removeItem("adminToken");
      router.push("/admin/login");
    } catch (err) {
      console.error("Erreur déconnexion :", err);
    }
  };

  const renderLink = (link, mobile = false) => {
    const Icon = link.icon;

    return (
      <Link
        key={link.href}
        href={link.href}
        target={link.external ? "_blank" : undefined}
        rel={link.external ? "noopener noreferrer" : undefined}
        onClick={() => mobile && setIsOpen(false)}
        className={`inline-flex items-center gap-2 rounded-lg text-sm font-semibold transition ${
          mobile
            ? "w-full px-3 py-2 text-[#5f5146] hover:bg-[#FFF2E7] hover:text-[#8B1E3F]"
            : "px-3 py-2 text-[#6B5B4D] hover:bg-[#FFF2E7] hover:text-[#8B1E3F]"
        }`}
      >
        <Icon className="h-4 w-4" />
        {link.label}
      </Link>
    );
  };

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-[#eadfd3] bg-[#fffaf5]/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/images/logos/mur-de-priere-horizontal.png"
            alt="Logo Mur de Prière"
            width={220}
            height={54}
            priority
            className="h-11 w-auto object-contain"
          />
          <span className="hidden rounded-md bg-[#8B1E3F] px-2 py-1 text-xs font-bold uppercase tracking-wide text-white lg:inline-flex">
            Admin
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => renderLink(link))}
          <button
            onClick={handleLogout}
            className="ml-2 inline-flex items-center gap-2 rounded-lg border border-[#f2c8c8] bg-[#fff1f1] px-3 py-2 text-sm font-semibold text-[#9f1239] transition hover:bg-[#ffe4e6]"
          >
            <FiLogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>

        <button
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#eadfd3] text-[#5f5146] md:hidden"
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
        </button>
      </nav>

      {isOpen && (
        <div ref={menuRef} className="border-t border-[#eadfd3] bg-[#fffaf5] p-3 shadow-lg md:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => renderLink(link, true))}
            <button
              onClick={handleLogout}
              className="inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#9f1239] hover:bg-[#fff1f1]"
            >
              <FiLogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
