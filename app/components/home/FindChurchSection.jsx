import Link from "next/link";
import { FiMapPin, FiPlusCircle, FiSearch, FiUsers } from "react-icons/fi";

const benefits = [
  {
    icon: FiSearch,
    text: "Recherchez par ville ou par adresse",
  },
  {
    icon: FiMapPin,
    text: "Consultez les coordonnées utiles",
  },
  {
    icon: FiUsers,
    text: "Rejoignez une communauté chrétienne locale",
  },
];

export default function FindChurchSection() {
  return (
    <section
      className="w-full bg-[#253047] py-16 text-white sm:py-20"
      aria-labelledby="find-church-heading"
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#efb8a3]">
            Aller plus loin ensemble
          </p>
          <h2
            id="find-church-heading"
            className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl"
          >
            Ne restez pas seul dans votre foi
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            Trouvez une église près de chez vous pour prier, grandir
            spirituellement et rejoindre une communauté chrétienne locale.
          </p>

          <ul className="mt-7 grid gap-3 sm:grid-cols-3">
            {benefits.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-white/90">
                <span className="rounded-full bg-white/10 p-2 text-[#efb8a3]">
                  <Icon aria-hidden="true" />
                </span>
                <span className="pt-1">{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/trouver-eglise"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d8947c] px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#c6816a]"
            >
              <FiMapPin aria-hidden="true" />
              Trouver une église près de moi
            </Link>
            <Link
              href="/ajouter-eglise"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition hover:border-white/70 hover:bg-white/10"
            >
              <FiPlusCircle aria-hidden="true" />
              Ajouter une église
            </Link>
          </div>

          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-white/60">
            Ce répertoire est proposé à titre informatif. Nous vous invitons à
            vérifier les horaires et les informations directement auprès de
            l’église concernée.
          </p>
        </div>

        <div
          className="relative hidden min-h-[360px] overflow-hidden rounded-3xl border border-white/10 bg-[#f7eee9] shadow-2xl lg:block"
          aria-hidden="true"
        >
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(#253047_1px,transparent_1px),linear-gradient(90deg,#253047_1px,transparent_1px)] [background-size:42px_42px]" />
          <div className="absolute left-[14%] top-[18%] h-24 w-40 rotate-6 rounded-[50%] border-8 border-[#d9c9bf]" />
          <div className="absolute bottom-[14%] right-[8%] h-32 w-52 -rotate-6 rounded-[45%] border-8 border-[#d9c9bf]" />
          <div className="absolute left-[47%] top-[44%] h-40 w-3 rotate-[38deg] rounded-full bg-[#d9c9bf]" />

          {[
            "left-[18%] top-[24%]",
            "left-[54%] top-[20%]",
            "left-[42%] top-[57%]",
            "right-[16%] bottom-[20%]",
          ].map((position) => (
            <span
              key={position}
              className={`absolute ${position} flex h-12 w-12 items-center justify-center rounded-full bg-[#d8947c] text-2xl text-white shadow-lg ring-4 ring-white`}
            >
              <FiMapPin />
            </span>
          ))}

          <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white p-5 text-[#253047] shadow-xl">
            <p className="text-xs font-bold uppercase tracking-wider text-[#b8755e]">
              Près de chez vous
            </p>
            <p className="mt-1 text-lg font-bold">Une communauté vous attend</p>
          </div>
        </div>
      </div>
    </section>
  );
}
