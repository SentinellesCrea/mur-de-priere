"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBookOpen,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiGift,
  FiHeart,
  FiMessageCircle,
  FiPlay,
  FiRefreshCw,
  FiShield,
  FiSun,
  FiUsers,
  FiWind,
} from "react-icons/fi";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import VideoCard from "../components/VideoCard";
import VideoModal from "../components/VideoModal";
import TextModal from "../components/TextModal";

const PRAYER_STEPS = [
  {
    number: "01",
    icon: FiHeart,
    source: "« Notre Père qui es aux cieux »",
    title: "Reconnaître Dieu comme Père et Seigneur",
    text: "Avant de parler de vous, tournez vos regards vers lui. Reconnaissez la proximité du Père, mais aussi la grandeur et l’autorité du Dieu des cieux.",
  },
  {
    number: "02",
    icon: FiSun,
    source: "« Que ton nom soit sanctifié »",
    title: "Louer et sanctifier son nom",
    text: "Prenez le temps de dire qui il est : saint, fidèle, juste, bon et puissant. La prière commence par l’adoration, pas par la liste de nos besoins.",
  },
  {
    number: "03",
    icon: FiWind,
    source: "« Que ton règne vienne »",
    title: "Accueillir son règne et sa présence",
    text: "Appelez le Saint-Esprit et demandez que la présence, l’autorité et la paix de Dieu prennent toute leur place en vous et autour de vous.",
  },
  {
    number: "04",
    icon: FiCheckCircle,
    source: "« Que ta volonté soit faite »",
    title: "Soumettre ses projets à sa volonté",
    text: "Remettez-lui vos décisions, vos attentes et vos propres plans. Demandez que ses desseins s’accomplissent, sur la terre comme au ciel.",
  },
  {
    number: "05",
    icon: FiGift,
    source: "« Donne-nous aujourd’hui notre pain »",
    title: "Présenter ses besoins",
    text: "Après avoir placé Dieu au centre, présentez vos besoins concrets : la nourriture, le travail, la santé, la sagesse et tout ce qui est nécessaire aujourd’hui.",
  },
  {
    number: "06",
    icon: FiRefreshCw,
    source: "« Pardonne-nous… comme nous pardonnons »",
    title: "Demander pardon et choisir de pardonner",
    text: "Confessez vos fautes, recevez sa grâce et sa miséricorde, puis demandez-lui la force de pardonner sincèrement à ceux qui vous ont offensé.",
  },
  {
    number: "07",
    icon: FiShield,
    source: "« Délivre-nous du mal »",
    title: "Demander sa protection",
    text: "Demandez à Dieu de vous garder de la tentation, de vous donner du discernement et de vous délivrer de ce qui cherche à vous éloigner de lui.",
  },
  {
    number: "08",
    icon: FiHeart,
    source: "« Demander au Père en mon nom » — Jean 16.23",
    title: "Remercier, confier et conclure au nom de Jésus",
    text: "Remerciez Dieu pour son écoute et sa fidélité, puis confiez-lui la réponse, le moment et la manière d’agir. Terminez toujours votre prière en vous adressant au Père au nom de Jésus.",
  },
];

const PRAYER_HABITS = [
  "Choisissez un moment réaliste, même cinq minutes au début.",
  "Trouvez un lieu calme où vous pourrez revenir régulièrement.",
  "Gardez une Bible et un carnet à portée de main.",
  "Notez vos sujets et les réponses reçues pour cultiver la reconnaissance.",
  "Priez avec d’autres chrétiens lorsque vous en avez la possibilité.",
];

const VIDEOS_PER_PAGE = 6;

export default function ApprendreAPrierPage() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
  const displayedVideos = videos.slice(
    currentPage * VIDEOS_PER_PAGE,
    (currentPage + 1) * VIDEOS_PER_PAGE
  );

  useEffect(() => {
    const controller = new AbortController();

    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/videos", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Les enseignements sont indisponibles.");

        const data = await response.json();
        setVideos(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Erreur chargement vidéos :", error);
          setLoadError(
            "Les enseignements ne peuvent pas être affichés pour le moment."
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchVideos();
    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-[#2f2a26]">
      <Navbar />

      <main>
        <section
          className="bg-[#253047] px-4 py-8 text-white sm:py-10"
          aria-labelledby="learn-prayer-title"
        >
          <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#efb8a3]">
                <FiHeart aria-hidden="true" />
                Faire ses premiers pas
              </p>
              <h1
                id="learn-prayer-title"
                className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
              >
                Apprendre à prier,
                <span className="block text-[#efb8a3]">
                  simplement et avec foi
                </span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                La prière n’est pas une performance. C’est une relation vivante
                avec Dieu, qui commence par quelques mots sincères et grandit
                jour après jour.
              </p>
            </div>

            <a
              href="#commencer"
              className="inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-full bg-[#d8947c] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#c6816a]"
            >
              Commencer maintenant
              <FiArrowRight aria-hidden="true" />
            </a>
          </div>
        </section>

        <section
          id="commencer"
          className="scroll-mt-24 px-4 py-10 sm:px-6 sm:py-14"
          aria-labelledby="prayer-intro-title"
        >
          <div className="mx-auto grid max-w-[1200px] gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8b1e3f]">
                Avant de commencer
              </p>
              <h2
                id="prayer-intro-title"
                className="mt-2 text-2xl font-bold leading-tight sm:text-3xl"
              >
                Dieu vous accueille tel que vous êtes
              </h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-gray-600">
                Prier, ce n’est pas réciter une formule parfaite. C’est ouvrir
                son cœur à notre Père céleste avec confiance : lui parler de
                nos joies, de nos peurs, de nos fautes et de nos espérances.
              </p>
              <p className="mt-3 max-w-2xl leading-relaxed text-gray-600">
                Si vous ne savez pas quoi dire, commencez par une phrase simple :
                « Seigneur, me voici. Aide-moi à te connaître et à t’écouter. »
              </p>
            </div>

            <blockquote className="relative overflow-hidden rounded-2xl bg-[#f0e7df] p-6 sm:p-8">
              <span
                className="absolute -right-2 -top-8 font-serif text-[9rem] leading-none text-[#8b1e3f]/10"
                aria-hidden="true"
              >
                “
              </span>
              <FiBookOpen
                className="text-2xl text-[#8b1e3f]"
                aria-hidden="true"
              />
              <p className="relative mt-4 text-lg font-semibold leading-relaxed sm:text-xl">
                Jésus nous invite à entrer dans un lieu retiré et à parler au
                Père qui voit dans le secret.
              </p>
              <footer className="mt-4 text-sm font-bold text-[#8b1e3f]">
                D’après Matthieu 6.6
              </footer>
            </blockquote>
          </div>
        </section>

        <section className="bg-white px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-[1200px]">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8b1e3f]">
                Le modèle donné par Jésus
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Suivre la logique du Notre Père
              </h2>
              <p className="mt-3 leading-relaxed text-gray-600">
                Jésus ne nous donne pas seulement des paroles à répéter : il
                nous enseigne un ordre spirituel. Dieu, son nom, son règne et sa
                volonté viennent avant nos demandes personnelles.
              </p>
              <p className="mt-2 text-sm font-semibold text-[#8b1e3f]">
                Cette progression s’appuie sur Matthieu 6.9-13.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {PRAYER_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <article
                    key={step.number}
                    className="group rounded-2xl border border-[#e8e2dc] bg-[#fbfaf8] p-5 transition hover:-translate-y-1 hover:border-[#d8947c]/60 hover:shadow-lg sm:p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-[#8b1e3f]/10 text-lg text-[#8b1e3f]">
                        <Icon aria-hidden="true" />
                      </span>
                      <span className="text-sm font-bold text-[#d8947c]">
                        {step.number}
                      </span>
                    </div>
                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.08em] text-[#8b1e3f]">
                      {step.source}
                    </p>
                    <h3 className="mt-2 text-lg font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {step.text}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-[#e8e2dc] bg-[#f7f5f2] px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto grid max-w-[1200px] gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8b1e3f]">
                <FiBookOpen aria-hidden="true" />
                Prier avec la Parole
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Fonder ses demandes sur ce que Dieu a dit
              </h2>
              <p className="mt-4 leading-relaxed text-gray-600">
                Lire la Bible est une discipline importante. Mais dans le
                cheminement de la prière, l’enjeu est surtout d’appuyer nos
                demandes sur le caractère de Dieu, ses promesses et sa volonté
                révélée dans sa Parole.
              </p>
              <p className="mt-3 leading-relaxed text-gray-600">
                Nous ne citons pas un verset pour contraindre Dieu. Nous lui
                présentons notre situation en nous accordant avec ce qu’il a
                déjà déclaré.
              </p>

              <ol className="mt-5 space-y-3">
                {[
                  "Nommer avec sincérité la situation ou le besoin.",
                  "Rappeler la vérité biblique sur laquelle la demande s’appuie.",
                  "Formuler sa requête avec foi, puis la soumettre à la volonté de Dieu.",
                ].map((item, index) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#8b1e3f] text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-gray-700">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <article className="rounded-2xl bg-white p-6 shadow-[0_14px_40px_rgba(37,48,71,0.08)] sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#d8947c]">
                Exemple : présenter un besoin matériel
              </p>
              <div className="mt-5 space-y-4 border-l-2 border-[#d8947c] pl-5">
                <div>
                  <p className="text-xs font-bold text-[#8b1e3f]">
                    La situation
                  </p>
                  <p className="mt-1 leading-relaxed text-gray-700">
                    « Seigneur, tu vois mon besoin et l’inquiétude que cette
                    situation produit en moi. »
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#8b1e3f]">
                    La Parole
                  </p>
                  <p className="mt-1 leading-relaxed text-gray-700">
                    « Ta Parole m’enseigne que mon Père céleste sait ce dont
                    j’ai besoin et m’appelle à ne pas vivre dans l’inquiétude. »
                  </p>
                  <p className="mt-1 text-xs font-semibold text-gray-500">
                    D’après Matthieu 6.31-32
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#8b1e3f]">
                    La demande
                  </p>
                  <p className="mt-1 leading-relaxed text-gray-700">
                    « Je te demande donc mon pain pour aujourd’hui. Donne-moi
                    aussi la sagesse d’agir, et que ta volonté s’accomplisse
                    dans cette situation. »
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto grid max-w-[1200px] gap-6 lg:grid-cols-2">
            <article className="rounded-2xl bg-[#253047] p-6 text-white sm:p-8">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#efb8a3]">
                <FiMessageCircle aria-hidden="true" />
                Un exemple pour aujourd’hui
              </p>
              <h2 className="mt-3 text-2xl font-bold">
                Une prière qui suit cette progression
              </h2>
              <p className="mt-5 whitespace-pre-line leading-relaxed text-white/85">
                Notre Père, tu es au-dessus de toute chose et pourtant tu
                m’accueilles comme ton enfant. Tu es saint, bon, fidèle et digne
                de toute ma louange.
                {"\n\n"}
                Que ton règne vienne. Saint-Esprit, remplis-moi de ta présence.
                Que ta volonté s’accomplisse dans ma vie, et que tes desseins
                passent avant les miens.
                {"\n\n"}
                Tu connais mes besoins d’aujourd’hui. Pourvois à ce qui est
                nécessaire et donne-moi la sagesse d’agir selon ta Parole.
                Pardonne mes péchés et accorde-moi la grâce de pardonner à ceux
                qui m’ont offensé.
                {"\n\n"}
                Garde-moi de la tentation et délivre-moi du mal. Merci parce que
                tu m’écoutes. Je te confie la réponse et je choisis de te faire
                confiance. Au nom de Jésus. Amen.
              </p>
            </article>

            <article className="rounded-2xl border border-[#e8e2dc] bg-white p-6 sm:p-8">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8b1e3f]">
                <FiClock aria-hidden="true" />
                Installer une habitude
              </p>
              <h2 className="mt-3 text-2xl font-bold">
                Faire grandir sa vie de prière
              </h2>
              <ul className="mt-5 space-y-3">
                {PRAYER_HABITS.map((habit) => (
                  <li key={habit} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#d8947c]/15 text-xs text-[#8b1e3f]">
                      <FiCheck aria-hidden="true" />
                    </span>
                    <span className="text-sm leading-relaxed text-gray-600">
                      {habit}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section
          id="enseignements"
          className="scroll-mt-24 border-y border-[#e8e2dc] bg-white px-4 py-10 sm:px-6 sm:py-14"
          aria-labelledby="teachings-title"
        >
          <div className="mx-auto max-w-[1200px]">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8b1e3f]">
                  <FiPlay aria-hidden="true" />
                  Ressources pour aller plus loin
                </p>
                <h2
                  id="teachings-title"
                  className="mt-2 text-2xl font-bold sm:text-3xl"
                >
                  Vidéos et enseignements
                </h2>
                <p className="mt-3 leading-relaxed text-gray-600">
                  Prenez le temps d’écouter, de méditer et de mettre en pratique
                  un enseignement à la fois.
                </p>
              </div>
              {videos.length > 0 && (
                <p className="text-sm font-semibold text-gray-500">
                  {videos.length} ressource{videos.length > 1 ? "s" : ""}
                </p>
              )}
            </div>

            {isLoading && (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-72 animate-pulse rounded-2xl bg-[#f0ece8]"
                  />
                ))}
              </div>
            )}

            {!isLoading && loadError && (
              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-900">
                {loadError}
              </div>
            )}

            {!isLoading && !loadError && videos.length === 0 && (
              <div className="mt-8 rounded-2xl border border-dashed border-[#d8d1ca] bg-[#fbfaf8] p-8 text-center">
                <FiBookOpen
                  className="mx-auto text-2xl text-[#d8947c]"
                  aria-hidden="true"
                />
                <p className="mt-3 font-bold">
                  De nouveaux enseignements arrivent bientôt
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Revenez prochainement pour découvrir les prochaines
                  ressources.
                </p>
              </div>
            )}

            {!isLoading && displayedVideos.length > 0 && (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {displayedVideos.map((video) => (
                  <VideoCard
                    key={video._id}
                    video={video}
                    onTextClick={setSelectedText}
                    onVideoClick={setSelectedVideo}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav
                className="mt-8 flex items-center justify-center gap-3"
                aria-label="Pagination des enseignements"
              >
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(page - 1, 0))
                  }
                  disabled={currentPage === 0}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d8d1ca] bg-white px-4 py-2 text-sm font-bold transition hover:border-[#d8947c] hover:text-[#8b1e3f] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiArrowLeft aria-hidden="true" />
                  Précédent
                </button>
                <span className="px-2 text-sm font-semibold text-gray-500">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(page + 1, totalPages - 1)
                    )
                  }
                  disabled={currentPage + 1 >= totalPages}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d8d1ca] bg-white px-4 py-2 text-sm font-bold transition hover:border-[#d8947c] hover:text-[#8b1e3f] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Suivant
                  <FiArrowRight aria-hidden="true" />
                </button>
              </nav>
            )}
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 rounded-2xl bg-[#f0e7df] p-6 sm:p-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8b1e3f]">
                <FiUsers aria-hidden="true" />
                Ne restez pas seul
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                La prière grandit aussi dans la communauté
              </h2>
              <p className="mt-2 leading-relaxed text-gray-600">
                Confiez un sujet à la communauté ou trouvez une église près de
                chez vous pour avancer avec d’autres chrétiens.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/#PrayerWallSection"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8b1e3f] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#721733]"
              >
                Déposer un sujet
                <FiArrowRight aria-hidden="true" />
              </Link>
              <Link
                href="/trouver-eglise"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#8b1e3f]/25 bg-white px-5 py-3 text-sm font-bold text-[#8b1e3f] transition hover:-translate-y-0.5 hover:border-[#8b1e3f]"
              >
                Trouver une église
              </Link>
            </div>
          </div>
        </section>

        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
        <TextModal
          text={selectedText}
          onClose={() => setSelectedText(null)}
        />
      </main>

      <Footer />
    </div>
  );
}
