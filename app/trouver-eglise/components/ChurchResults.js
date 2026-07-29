"use client";

import { FaClipboardList } from "react-icons/fa6";
import {
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiExternalLink,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";

function getDistanceKm(from, church) {
  const coordinates = church.coordinates?.coordinates;
  if (!from || !coordinates || coordinates.length !== 2) return null;

  const toRadians = (value) => (value * Math.PI) / 180;
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(coordinates[1]);
  const deltaLat = lat2 - lat1;
  const deltaLng = toRadians(coordinates[0] - from.lng);
  const value =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function safeWebsite(value) {
  if (!value) return null;
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export default function ChurchResults({
  churches = [],
  centerPosition = null,
  total = churches.length,
  currentPage = 1,
  pageCount = 1,
  loading = false,
  onPageChange,
  title = "Résultats",
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold text-lg">
        <FaClipboardList className="text-brand" />
        {title} ({total})
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {churches.length === 0 ? (
          <p className="text-gray-500 italic md:col-span-2">Aucune église trouvée.</p>
        ) : (
          churches.map((church, index) => {
            const distance = getDistanceKm(centerPosition, church);
            const website = safeWebsite(church.website);

            return (
              <article
                key={church._id || index}
                className="flex h-full flex-col rounded-xl border border-gray-200 p-4 transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[17px] mb-1">{church.name}</h3>
                    <p className="text-sm font-semibold text-[#8B1E3F]">
                      {[church.tradition, church.denomination].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {distance !== null && (
                    <span className="shrink-0 rounded-full bg-[#fff0e8] px-2 py-1 text-xs font-bold text-[#8B1E3F]">
                      {distance.toFixed(1)} km
                    </span>
                  )}
                </div>

                <p className="mt-3 flex items-start gap-2 text-sm text-gray-700">
                  <FiMapPin className="mt-0.5 shrink-0 text-[#d8947c]" />
                  {[church.address, church.postalCode, church.city].filter(Boolean).join(", ")}
                </p>
                {church.serviceTimes && (
                  <p className="mt-2 flex items-start gap-2 text-sm text-gray-600">
                    <FiClock className="mt-0.5 shrink-0" />
                    {church.serviceTimes}
                  </p>
                )}
                {church.description && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                    {church.description}
                  </p>
                )}
                {(church.childrenWelcome || church.accessibility || church.languages?.length > 0) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {church.childrenWelcome && (
                      <span className="rounded-full bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-700">
                        Accueil enfants
                      </span>
                    )}
                    {church.accessibility && (
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                        Accessible PMR
                      </span>
                    )}
                    {church.languages?.map((language) => (
                      <span
                        key={language}
                        className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  {church.phone && (
                    <a
                      href={`tel:${church.phone}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700"
                    >
                      <FiPhone /> Appeler
                    </a>
                  )}
                  {website && (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#fff0e8] px-3 py-1.5 text-xs font-semibold text-[#8B1E3F]"
                    >
                      <FiExternalLink /> Site web
                    </a>
                  )}
                  {church.source === "openstreetmap" && church.sourceUrl && (
                    <a
                      href={church.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-gray-500 underline underline-offset-2"
                    >
                      <FiExternalLink /> Source OpenStreetMap
                    </a>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {pageCount > 1 && onPageChange && (
        <nav
          className="mt-6 flex items-center justify-center gap-4 border-t border-gray-100 pt-5"
          aria-label="Pagination des églises"
        >
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={loading || currentPage === 1}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiChevronLeft />
            Précédent
          </button>
          <span className="text-sm font-semibold text-gray-600">
            Page {currentPage} sur {pageCount}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}
            disabled={loading || currentPage === pageCount}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Suivant
            <FiChevronRight />
          </button>
        </nav>
      )}
    </div>
  );
}
