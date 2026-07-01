"use client";

import Link from "next/link";
import Image from "next/image";

export default function NavbarSimple() {
  return (
    <nav className="w-full bg-white shadow-md px-8 flex justify-between items-center">
            <Link href="/">
                <Image
                  src="/images/logos/mur-de-priere-navbar.png"
                  alt="Logo Mur de Prière"
                  width={240}
                  height={58}
                  className="h-12 w-auto cursor-pointer object-contain transition transform hover:-translate-y-1 duration-300 md:h-14"
                />
            </Link>
      <div className="hidden lg:flex space-x-6 text-gray-800 ml-auto items-center">
        <Link href="/" className="hover:text-[#a60030]">Accueil</Link>
      </div>
    </nav>
  );
}
