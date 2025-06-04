"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const questions = [
  {
    q: "Comment puis-je être sûr que mon don est bien utilisé ?",
    a: "Nous envoyons régulièrement des rapports d'impact et faisons preuve d'une transparence totale sur l'utilisation des fonds.",
  },
  {
    q: "Quel pourcentage de mon don va directement aux bénéficiaires ?",
    a: "Environ 90% des dons sont affectés directement aux actions sur le terrain, les 10% restants servent à l'administration et aux frais techniques.",
  },
  {
    q: "Puis-je annuler mon don mensuel ?",
    a: "Oui, vous pouvez annuler votre don mensuel à tout moment depuis votre espace donateur ou en nous contactant.",
  },
  {
    q: "Comment fonctionne la déduction fiscale ?",
    a: "Vous recevez un reçu fiscal par email. En France, 66% de votre don peut être déduit de vos impôts, dans la limite autorisée.",
  },
];

export default function DonateFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white px-6 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold mb-2">Questions fréquentes</h2>
        <div className="w-16 h-1 mx-auto bg-[#5F37EF] rounded mb-10" />
        <div className="space-y-4 text-left">
          {questions.map((item, index) => (
            <div
              key={index}
              className="bg-gray-100 p-4 rounded-md cursor-pointer"
              onClick={() => toggle(index)}
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold">{item.q}</p>
                {openIndex === index ? (
                  <ChevronUp className="text-[#5F37EF]" />
                ) : (
                  <ChevronDown className="text-[#5F37EF]" />
                )}
              </div>
              {openIndex === index && (
                <p className="text-gray-700 mt-2 text-sm">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
