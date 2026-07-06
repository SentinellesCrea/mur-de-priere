"use client";

import Link from "next/link";
import { safePublicImageUrl, safePublicUrl } from "@/lib/publicSafeUrls";

export default function HeroBlock({
  title,
  subtitle,
  image,
  ctaLabel,
  ctaLink,
  layout = "center",
  align = "center",
  overlay = "medium",
  height = "large",
  buttonStyle = "solid",
}) {
  const safeImage = image ? safePublicImageUrl(image) : "";
  const safeCtaLink = safePublicUrl(ctaLink, "");
  const overlayClass = {
    light: "bg-black/30",
    medium: "bg-black/50",
    strong: "bg-black/65",
  }[overlay] || "bg-black/50";
  const heightClass = {
    compact: "min-h-[38vh]",
    medium: "min-h-[52vh]",
    large: "min-h-[64vh]",
  }[height] || "min-h-[60vh]";
  const alignClass = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  }[align] || "text-center items-center";
  const layoutClass = layout === "left" ? "justify-start" : "justify-center";
  const contentWidth = layout === "wide" ? "max-w-5xl" : "max-w-3xl";
  const buttonClass = buttonStyle === "outline"
    ? "border border-white/70 text-white hover:bg-white hover:text-gray-950"
    : "bg-[#d8947c] text-white hover:scale-105";

  return (
    <section
      className={`relative w-full ${heightClass} flex items-center ${layoutClass} text-white rounded-3xl overflow-hidden mb-12`}
      style={{
        backgroundImage: safeImage ? `url(${safeImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayClass}`} />

      {/* Content */}
      <div className={`relative z-10 ${contentWidth} px-6 sm:px-10 flex flex-col ${alignClass} space-y-4`}>
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
            className={`inline-block mt-4 px-6 py-3 rounded-full font-bold transition ${buttonClass}`}
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
