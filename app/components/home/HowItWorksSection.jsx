import Link from "next/link";
import { FiEdit3, FiEye, FiHeart, FiShield } from "react-icons/fi";

const steps = [
  {
    icon: FiEdit3,
    title: "Déposez votre demande",
    description:
      "Indiquez votre prénom pour rendre la prière plus personnelle, ou choisissez l’anonymat pour un sujet sensible.",
  },
  {
    icon: FiEye,
    title: "Elle rejoint le mur",
    description:
      "Votre texte est vérifié puis rendu visible afin que la communauté puisse le porter.",
  },
  {
    icon: FiHeart,
    title: "La communauté prie",
    description:
      "Les visiteurs peuvent s’engager à prier et laisser un encouragement si vous l’autorisez.",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      className="w-full bg-white py-16"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-[#b8755e]">
            Simple et bienveillant
          </p>
          <h2
            id="how-it-works-heading"
            className="text-3xl font-bold text-gray-900 lg:text-4xl"
          >
            Comment fonctionne le Mur de Prière ?
          </h2>
        </div>

        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <li
              key={title}
              className="rounded-2xl border border-[#d8947c]/20 bg-[#FAF7F4] p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="rounded-full bg-white p-3 text-xl text-[#b8755e] shadow-sm">
                  <Icon aria-hidden="true" />
                </span>
                <span className="text-sm font-bold text-[#b8755e]">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
              <p className="leading-relaxed text-gray-600">{description}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
          <FiShield className="mt-0.5 shrink-0 text-lg" aria-hidden="true" />
          <p>
            Vos coordonnées ne sont jamais affichées. Le Mur de Prière n’est pas
            un service d’urgence et ne remplace pas un accompagnement médical ou
            psychologique. En cas de danger immédiat, contactez les services
            d’urgence ou un professionnel.{" "}
            <Link href="/confidentialite" className="font-bold underline">
              En savoir plus sur la confidentialité
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
