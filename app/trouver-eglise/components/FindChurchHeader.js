"use client";

import { FiSearch } from "react-icons/fi";
import { FaChurch, FaSignInAlt } from "react-icons/fa";
import Button  from "../../components/ui/button";
import Link from "next/link";
import Image from "next/image";


export default function FindChurchHeader() {
  return (
  <div className="mb-4">
    <div className="bg-brand text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6">
        
            <Link href="/">
                <Image
                  src="/images/Logo_mur_de_priere_blanc.png"
                  alt="Logo"
                  width={200}
                  height={80}
                  className="cursor-pointer transition transform hover:-translate-y-1 duration-300"
                />
            </Link>

        <div className="flex items-center gap-3 text-2xl font-bold">
          <FaChurch className="text-white text-3xl" />
          Trouver une Église
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4">
        <button
              variant="outline"
              onClick={() => window.location.href = "/ajouter-eglise"}
              className=" bg-white text-brandDark hover:bg-white font-semibold px-4 py-2 rounded-xl shadow transition transform hover:-translate-y-2 duration-300"
            >
             <FaSignInAlt className="inline mr-2"/>
             Inscrivez votre église
        </button>
      </div>
      </div>
    </div>
    <div>
      
    </div>
  </div>
  );
}
