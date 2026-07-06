"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ResourceRenderer from "../../components/resources/ResourceRenderer";

import { fetchApi } from "@/lib/fetchApi";
import { safePublicImageUrl, safeResourceSlug } from "@/lib/publicSafeUrls";
import useScrollSpy from "@/hooks/useScrollSpy";

import { MdSchedule, MdGroups } from "react-icons/md";

const SAFE_RESOURCE_SLUG = /^[a-z0-9][a-z0-9-]{0,120}$/i;

/* ================= PAGE ================= */
export default function ResourcePage() {
  const { slug } = useParams();
  const slugValue = Array.isArray(slug) ? slug[0] : slug;
  const isInvalidSlug = !!slugValue && !SAFE_RESOURCE_SLUG.test(String(slugValue));

  const [resource, setResource] = useState(null);
  const [suggestedResources, setSuggestedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /* ================= DATA ================= */

  useEffect(() => {
    if (!slugValue || isInvalidSlug) return;

    const loadResource = async () => {
      try {
        setLoading(true);
        setError(false);

        const data = await fetchApi(`/api/resources/${encodeURIComponent(slugValue)}`);
        setResource(data);
      } catch (err) {
        console.error("Erreur chargement ressource :", err.message);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadResource();
  }, [slugValue, isInvalidSlug]);

  useEffect(() => {
    if (!resource?._id) return;

    const loadSuggestions = async () => {
      try {
        const res = await fetchApi("/api/resources");
        const suggestions = Array.isArray(res?.data)
          ? res.data
              .filter((item) => item._id !== resource._id && item.slug !== resource.slug)
              .filter((item) => safeResourceSlug(item.slug) || safeResourceSlug(item._id))
              .slice(0, 3)
          : [];

        setSuggestedResources(suggestions);
      } catch (error) {
        console.error("Erreur chargement ressources suggérées :", error);
        setSuggestedResources([]);
      }
    };

    loadSuggestions();
  }, [resource]);

  /* ================= SOMMAIRE ================= */

  const summaryItems = useMemo(() => {
    if (!resource || !Array.isArray(resource.blocks)) return [];

    return resource.blocks
      .filter(
        (b) =>
          b.type === "text" &&
          (b.data?.variant === "title" ||
            b.data?.variant === "subtitle") &&
          typeof b.data?.text === "string"
      )
      .map((b) => {
        const text = b.data.text.trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");

        return {
          id,
          text,
          level: b.data.variant,
        };
      });
  }, [resource]);

  const activeId = useScrollSpy("h2, h3");
  const handleSummaryClick = (event, id) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", `#${id}`);
  };

  /* ================= STATES ================= */

  if (loading && !isInvalidSlug) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">Chargement de la ressource…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (isInvalidSlug || error || !resource) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Ressource introuvable.</p>
        </main>
        <Footer />
      </>
    );
  }

  /* ================= RENDER ================= */
  const startsWithHero = resource.blocks?.[0]?.type === "hero";

  return (
    <main className="bg-[#f7f7f6] min-h-screen text-[#111118]">
      <Navbar />

      {/* ================= BREADCRUMB ================= */}
      <div className="max-w-[1200px] mx-auto px-4 pt-8 pb-4">
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/"
            className="text-[#616189] hover:text-[#D0BB95] transition"
          >
            Accueil
          </Link>

          <span className="text-[#616189]">/</span>

          <Link
            href="/ressources"
            className="text-[#616189] hover:text-[#D0BB95] transition"
          >
            Ressources
          </Link>

          <span className="text-[#616189]">/</span>

          <span className="text-[#D0BB95] font-medium">
            {resource.title}
          </span>
        </div>
      </div>

      {!startsWithHero && (
        <section className="max-w-[1200px] mx-auto px-4 mb-14">
          <div
            className="relative overflow-hidden rounded-xl"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.4), rgba(59,61,237,0.4)),
                url('${safePublicImageUrl(resource.coverImage)}')
              `,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="min-h-[480px] flex flex-col items-center justify-center text-center p-8 gap-5">
              <span className="bg-[#D0BB95] text-white text-sm font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                {resource.category}
              </span>

              <h1 className="text-white text-4xl md:text-6xl font-black leading-tight">
                {resource.title}
              </h1>

              {resource.excerpt && (
                <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl">
                  {resource.excerpt}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ================= CONTENT GRID ================= */}
      <section className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* ===== SIDEBAR GAUCHE ===== */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-28 self-start space-y-8">

          {/* Sommaire */}
          {summaryItems.length > 0 && (
            <div>
              <h4 className="text-sm font-bold uppercase text-[#616189] mb-4 tracking-wider">
                Sommaire
              </h4>

              <ul className="space-y-3 text-sm">
                {summaryItems.map((item) => {
                  const isActive = activeId === item.id;

                  return (
                    <li
                      key={item.id}
                      className={`pl-3 border-l-2 transition ${
                        isActive
                          ? "border-[#D0BB95] text-[#D0BB95] font-bold"
                          : "border-transparent text-[#616189] hover:text-[#D0BB95]"
                      } ${item.level === "subtitle" ? "ml-4" : ""}`}
                    >
                      <a
                        href={`#${item.id}`}
                        onClick={(event) => handleSummaryClick(event, item.id)}
                        className="block"
                      >
                        {item.text}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Temps de lecture */}
          {resource.readingTime && (
            <div className="p-4 bg-[#D0BB95]/5 rounded-xl border border-[#D0BB95]/20">
              <p className="text-sm font-bold mb-2">Temps de lecture</p>
              <div className="flex items-center gap-2 text-[#D0BB95]">
                <MdSchedule />
                <span className="text-sm font-bold">
                  {resource.readingTime} minutes
                </span>
              </div>
            </div>
          )}
        </aside>

        {/* ===== ARTICLE ===== */}
        <article className="lg:col-span-6 space-y-10">
          <ResourceRenderer resource={resource} withAnchors />
        </article>

        {/* ===== SIDEBAR DROITE ===== */}
        <aside className="lg:col-span-3 lg:sticky lg:top-28 self-start space-y-8 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h4 className="text-lg font-bold mb-4">
              Rejoindre un groupe
            </h4>
            <p className="text-sm text-[#616189] mb-6">
              Mettez en pratique cet enseignement en rejoignant un groupe
              de prière local ou en ligne.
            </p>
            <button className="w-full bg-[#D0BB95] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
              <MdGroups /> Voir les groupes
            </button>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase text-[#616189] tracking-wider mb-4">
              Ressources suggérées
            </h4>

            {suggestedResources.length > 0 ? (
              <div className="space-y-3">
                {suggestedResources.map((suggestion) => {
                  const suggestionSlug = safeResourceSlug(suggestion.slug) || safeResourceSlug(suggestion._id);

                  return (
                    <Link
                      key={suggestion._id}
                      href={`/ressources/${suggestionSlug}`}
                      className="block rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#D0BB95]/60 hover:shadow-md"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#D0BB95]">
                        {suggestion.category || "Ressource"}
                      </span>
                      <h5 className="mt-1 text-sm font-extrabold leading-snug text-[#111118]">
                        {suggestion.title}
                      </h5>
                      {suggestion.readingTime && (
                        <p className="mt-2 text-xs font-bold text-[#616189]">
                          {suggestion.readingTime} min de lecture
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[#616189] italic">
                Aucune suggestion disponible pour le moment.
              </p>
            )}
          </div>
        </aside>
      </section>

      {/* ================= CTA ================= */}
      <section className="max-w-[1200px] mx-auto mt-24 px-4 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-[#D0BB95] p-10 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-black mb-4">
                Prêt à porter le fardeau des autres ?
              </h2>
              <p className="text-white/80 text-lg max-w-xl">
                Rejoignez le Mur de Prière et commencez à intercéder
                pour la communauté dès aujourd’hui.
              </p>
            </div>
            <Link
              href="/#PrayerWallSection"
              className="bg-white text-[#D0BB95] px-8 py-4 rounded-xl font-bold text-lg">
              Accéder au Mur
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
