"use client";

import Link from "next/link";
import { safePublicImageUrl, safePublicUrl } from "@/lib/publicSafeUrls";

export default function HeroBlock({
  title,
  subtitle,
  image,
  ctaLabel,
  ctaLink,
}) {
  const safeImage = image ? safePublicImageUrl(image) : "";
  const safeCtaLink = safePublicUrl(ctaLink, "");

  return (
    <section
      className="relative w-full min-h-[60vh] flex items-center justify-center text-white rounded-xl overflow-hidden mb-12"
      style={{
        backgroundImage: safeImage ? `url(${safeImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl px-6 text-center space-y-4">
        {title && (
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            {title}
          </h1>
        )}

        {subtitle && (
          <p className="text-md md:text-xl text-white/90">
            {subtitle}
          </p>
        )}

        {ctaLabel && safeCtaLink && (
          <Link
            href={safeCtaLink}
            className="inline-block mt-4 px-6 py-3 rounded-full bg-[#d8947c] text-white font-bold hover:scale-105 transition"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
