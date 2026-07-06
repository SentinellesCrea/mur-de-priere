const VARIANTS = {
  summary: "bg-white border-[#E7E0D8]",
  encouragement: "bg-[#FFF4EC] border-[#F1C7A5]",
  action: "bg-[#F4F1FF] border-[#DED6FF]",
};

export default function TakeawayBlock({
  title = "À retenir",
  text,
  variant = "summary",
  listStyle = "paragraph",
}) {
  if (!text) return null;

  const listItems = String(text)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const isList = ["bullets", "numbers"].includes(listStyle) && listItems.length > 0;
  const ListTag = listStyle === "numbers" ? "ol" : "ul";

  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div
        className={`rounded-3xl border p-6 sm:p-8 shadow-sm ${
          VARIANTS[variant] || VARIANTS.summary
        }`}
      >
        <div className="flex items-start gap-4">
          <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#5c40e7] text-white font-extrabold">
            ✓
          </span>
          <div>
            <h3 className="text-xl font-extrabold text-gray-950">
              {title}
            </h3>
            {isList ? (
              <ListTag
                className={`mt-4 space-y-3 text-gray-700 leading-7 ${
                  listStyle === "numbers" ? "list-decimal pl-5" : "list-disc pl-5"
                }`}
              >
                {listItems.map((item, index) => (
                  <li key={`${item}-${index}`}>
                    {item}
                  </li>
                ))}
              </ListTag>
            ) : (
              <p className="mt-3 text-gray-700 leading-7 whitespace-pre-line">
                {text}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
