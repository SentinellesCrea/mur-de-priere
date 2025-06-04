// 📁 /app/components/don/DonateContent.js
"use client";

import { CheckCircle, Shield, ReceiptText, Info } from "lucide-react";

export default function DonateContent() {
  return (
    <section className="bg-gray-50 text-gray-800 px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center mb-4">Faire un don</h2>
        <div className="w-16 h-1 mx-auto bg-[#5F37EF] rounded mb-8"></div>
        <p className="text-center text-gray-600 text-lg mb-12">
          Votre générosité permet de financer nos actions et de changer des vies.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Pourquoi donner ? */}
          <div className="bg-[#5F37EF] text-white p-8 rounded-xl space-y-4">
            <h3 className="text-xl font-bold mb-4">Pourquoi donner ?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-1" />
                66% de réduction d'impôt sur le revenu
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-1" />
                100% de transparence sur l'utilisation des fonds
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-1" />
                Rapports d'impact détaillés envoyés régulièrement
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-1" />
                Possibilité de cibler votre don vers un projet spécifique
              </li>
            </ul>

            <div className="bg-[#6f4dfc] mt-8 p-4 rounded-md">
              <h4 className="font-semibold text-white mb-2">Exemple d'impact</h4>
              <p className="text-l">30€ = 1 mois d’éducation pour un enfant</p>
              <p className="text-l">50€ = accès à l’eau potable pour 5 familles</p>
              <p className="text-l">100€ = soins médicaux pour 10 personnes</p>
            </div>
          </div>

          {/* Formulaire */}
          <div className="bg-white p-8 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-6">Faire un don</h3>

            <div className="grid grid-cols-3 gap-4 mb-4">
              {[5, 10, 20].map((val) => (
                <button
                  key={val}
                  className="border border-gray-300 rounded-md px-4 py-2 font-semibold hover:bg-gray-100"
                >
                  {val}€
                </button>
              ))}
            </div>

            <input
              type="number"
              placeholder="Autre montant"
              className="w-full px-4 py-3 border border-gray-300 rounded mb-4"
            />

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Fréquence</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="frequency" defaultChecked /> Ponctuel
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="frequency" /> Mensuel
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="frequency" /> Annuel
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Affectation du don (optionnel)</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded">
                <option>Là où les besoins sont les plus urgents</option>
                <option>Prières urgentes</option>
                <option>Encouragements & témoignages</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" /> Je souhaite recevoir un reçu fiscal
              </label>
            </div>

            <button className="w-full bg-[#5F37EF] text-white font-semibold py-3 rounded hover:bg-[#4a2bcf]">
              Faire un don de 50€
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">Paiement 100% sécurisé</p>
            <div className="flex justify-center gap-4 mt-2">
              <img src="/visa.svg" alt="Visa" className="h-6" />
              <img src="/mastercard.svg" alt="Mastercard" className="h-6" />
              <img src="/amex.svg" alt="Amex" className="h-6" />
            </div>
          </div>
        </div>

        {/* Bloc sécurité / reçu / transparence */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <div className="bg-white rounded-xl p-6 shadow text-left">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-[#5F37EF]" />
              <h4 className="font-bold">Sécurité</h4>
            </div>
            <p className="text-sm text-gray-700">
              Vos données personnelles et bancaires sont protégées par un cryptage SSL.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow text-left">
            <div className="flex items-center gap-3 mb-2">
              <ReceiptText className="text-[#5F37EF]" />
              <h4 className="font-bold">Reçu fiscal</h4>
            </div>
            <p className="text-sm text-gray-700">
              Un reçu fiscal vous sera envoyé automatiquement pour votre déclaration d’impôts.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow text-left">
            <div className="flex items-center gap-3 mb-2">
              <Info className="text-[#5F37EF]" />
              <h4 className="font-bold">Transparence</h4>
            </div>
            <p className="text-sm text-gray-700">
              Nous vous informons régulièrement de l'utilisation de vos dons et de leur impact.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
