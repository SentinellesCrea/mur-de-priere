"use client";

import { FiSearch } from "react-icons/fi";
import { FaChurch, FaSignInAlt } from "react-icons/fa";
import Button  from "../../components/ui/button";
import Link from "next/link";
import Image from "next/image";


export default function FindChurchHeader() {
  return (
  <div className="fixed w-full mb-4 shadow-md z-50">
    <div className="bg-white text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6">
        
            <Link href="/">
                <Image
                  src="/images/Logo_mur_de_priere.png"
                  alt="Logo"
                  width={200}
                  height={80}
                  className="cursor-pointer transition transform hover:-translate-y-1 duration-300"
                />
            </Link>

        <div className="flex text-gray-700 items-center gap-3 text-2xl font-bold">
          <FaChurch className="text-gray-700 text-3xl" />
          Trouver une Église
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4">
        <Button
              variant="outline"
              onClick={() => window.location.href = "/ajouter-eglise"}
              className="hover:bg-brandDark font-semibold px-4 py-2 rounded-xl shadow-md transition transform hover:-translate-y-2 duration-300"
            >
             <FaSignInAlt className="inline mr-2"/>
             Inscrivez votre église
        </Button>
      </div>
      </div>
    </div>
    <div>
      
    </div>
  </div>
  );
}
