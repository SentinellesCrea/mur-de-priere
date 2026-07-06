const VARIANTS = {
  question: "bg-[#F4F1FF] border-[#DED6FF] text-[#25185A]",
  prayer: "bg-[#EEF9F3] border-[#CFEBDD] text-[#123222]",
  journal: "bg-[#FFF8E8] border-[#F5DFAD] text-[#4A3512]",
};

export default function ReflectionBlock({
  title = "Question de réflexion",
  question,
  helper,
  variant = "question",
}) {
  if (!question) return null;

  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div
        className={`rounded-3xl border p-6 sm:p-8 ${
          VARIANTS[variant] || VARIANTS.question
        }`}
      >
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] opacity-60 mb-3">
          {title}
        </p>
        <p className="text-xl sm:text-2xl font-extrabold leading-snug">
          {question}
        </p>
        {helper && (
          <p className="mt-4 text-sm leading-6 opacity-75">
            {helper}
          </p>
        )}
      </div>
    </section>
  );
}
