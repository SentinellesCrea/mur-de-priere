// 📁 /app/components/don/DonateHero.js
"use client";

import Link from "next/link";

export default function DonateHero() {
  return (
    <section className="bg-[#5F37EF] text-white px-6 py-20 mt-10">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
          Ensemble, changeons des vies
        </h1>
        <p className="text-lg md:text-xl mb-8">
          Votre don fait la différence. Rejoignez notre mission pour créer un monde meilleur et plus équitable.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="#don"
            className="bg-white text-[#5F37EF] font-semibold px-6 py-3 rounded-md shadow hover:bg-gray-100"
          >
            Faire un don maintenant
          </Link>
          <Link
            href="#impact"
            className="border border-white text-white font-semibold px-6 py-3 rounded-md hover:bg-white hover:text-[#5F37EF] transition"
          >
            En savoir plus
          </Link>
        </div>

        <div className="bg-white text-gray-800 p-10 rounded-lg shadow-lg max-w-xl mx-auto">
          <h3 className="text-xl font-bold mb-4">Notre objectif</h3>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Progression</span>
            <span className="text-[#5F37EF] font-semibold">68%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-[#5F37EF] h-3 rounded-full"
              style={{ width: "68%" }}
            ></div>
          </div>
          <div className="flex justify-between text-sm">
            <span>Collectés : <strong>68 000 €</strong></span>
            <span>Objectif : <strong>100 000 €</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
}
