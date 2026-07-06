const VARIANTS = {
  info: "bg-[#F4F1FF] border-[#5c40e7] text-[#25185A]",
  warning: "bg-[#FFF8E8] border-[#D8941F] text-[#4A3512]",
  success: "bg-[#EEF9F3] border-[#2F9E6D] text-[#123222]",
  prayer: "bg-[#FFF4EC] border-[#d8947c] text-gray-900",
};

export default function CalloutBlock({ title, text, variant = "info" }) {
  if (!title && !text) return null;

  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className={`border-l-4 p-6 rounded-2xl ${VARIANTS[variant] || VARIANTS.info}`}>
        {title && (
          <h4 className="font-bold text-lg mb-2">
            {title}
          </h4>
        )}
        {text && (
          <p className="leading-relaxed whitespace-pre-line opacity-80">
            {text}
          </p>
        )}
      </div>
    </section>
  );
}
