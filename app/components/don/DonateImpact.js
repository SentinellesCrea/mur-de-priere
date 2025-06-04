"use client";

import { ShieldCheck, HeartHandshake, Server, Users } from "lucide-react";

export default function DonateImpact() {
  return (
    <section className="bg-gray-50 py-12 px-6 text-gray-700">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-center">
        <div>
          <HeartHandshake className="mx-auto mb-2 text-[#d8947c]" size={36} />
          <p className="font-semibold">Accompagnement spirituel</p>
        </div>
        <div>
          <Server className="mx-auto mb-2 text-[#d8947c]" size={36} />
          <p className="font-semibold">Hébergement & outils</p>
        </div>
        <div>
          <Users className="mx-auto mb-2 text-[#d8947c]" size={36} />
          <p className="font-semibold">Équipe de bénévoles</p>
        </div>
        <div>
          <ShieldCheck className="mx-auto mb-2 text-[#d8947c]" size={36} />
          <p className="font-semibold">Paiement sécurisé</p>
        </div>
      </div>
    </section>
  );
}
