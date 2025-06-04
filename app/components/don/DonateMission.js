"use client";

import { Book, FlaskConical, Globe2 } from "lucide-react";

export default function DonateMission() {
  return (
    <section className="bg-white py-20 px-6 text-center">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-extrabold mb-2">Notre mission</h2>
        <div className="w-16 h-1 mx-auto bg-[#5F37EF] rounded mb-6"></div>
        
        <p className="text-gray-700 text-lg mb-12">
          Nous œuvrons chaque jour pour construire un avenir meilleur pour les plus vulnérables.
        </p>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-[#f9f9ff] p-6 rounded-xl shadow-sm">
            <Book className="text-[#5F37EF] mb-4" size={28} />
            <h3 className="font-bold text-lg mb-2">Éducation</h3>
            <p className="text-gray-700">
              Nous facilitons l'accès à l'éducation pour tous les enfants, peu importe leur situation.
            </p>
          </div>

          <div className="bg-[#f9f9ff] p-6 rounded-xl shadow-sm">
            <FlaskConical className="text-[#5F37EF] mb-4" size={28} />
            <h3 className="font-bold text-lg mb-2">Santé</h3>
            <p className="text-gray-700">
              Nous améliorons l'accès aux soins médicaux dans les communautés défavorisées.
            </p>
          </div>

          <div className="bg-[#f9f9ff] p-6 rounded-xl shadow-sm">
            <Globe2 className="text-[#5F37EF] mb-4" size={28} />
            <h3 className="font-bold text-lg mb-2">Environnement</h3>
            <p className="text-gray-700">
              Nous développons des projets durables pour protéger notre planète pour les générations futures.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
