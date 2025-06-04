"use client";

import { FaStar } from "react-icons/fa";

const testimonials = [
  {
    name: "Anne L.",
    role: "Demandeuse de prière",
    quote:
      "J’ai déposé une prière pendant un moment très dur. Une bénévole m’a contactée pour prier avec moi. J’ai senti que je n’étais plus seule.",
  },
  {
    name: "Thomas R.",
    role: "Donateur régulier",
    quote:
      "Je soutiens Mur de Prière chaque mois. C’est un projet transparent et inspirant. Je reçois des nouvelles concrètes sur les impacts.",
  },
  {
    name: "Sophie M.",
    role: "Bénévole",
    quote:
      "Prier pour les autres et les accompagner, c’est une mission qui me transforme autant qu’elle aide ceux que je soutiens.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-white py-16 px-4 text-center">
      <h2 className="text-3xl font-bold mb-4">Témoignages</h2>
      <div className="w-16 h-1 mx-auto bg-[#5F37EF] rounded mb-6"></div>
      <p className="text-gray-600 max-w-2xl mx-auto mb-10">
        Découvrez l’impact de vos dons et de vos prières à travers ceux qui en bénéficient chaque jour.
      </p>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimonials.map((t, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-6 shadow-sm text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#d8947c] text-white flex items-center justify-center font-bold">
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
            </div>
            <p className="italic text-gray-700">"{t.quote}"</p>
            <div className="flex mt-4 text-yellow-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
