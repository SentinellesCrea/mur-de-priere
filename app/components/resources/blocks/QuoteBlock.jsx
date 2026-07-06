const VARIANTS = {
  soft: "bg-[#F8F5EF] border-[#E7D8C8] text-gray-800",
  deep: "bg-[#171427] border-[#171427] text-white",
  warm: "bg-[#FFF4EC] border-[#F1C7A5] text-gray-900",
};

export default function QuoteBlock({ text, author, variant = "soft" }) {
  if (!text) return null;

  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <figure
        className={`rounded-3xl border p-7 sm:p-9 shadow-sm ${
          VARIANTS[variant] || VARIANTS.soft
        }`}
      >
        <blockquote className="text-2xl sm:text-3xl font-extrabold leading-snug">
          “{text}”
        </blockquote>
        {author && (
          <figcaption className="mt-5 text-sm font-bold opacity-70">
            {author}
          </figcaption>
        )}
      </figure>
    </section>
  );
}
