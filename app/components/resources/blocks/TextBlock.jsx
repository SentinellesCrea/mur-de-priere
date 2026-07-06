export default function TextBlock({
  text,
  variant = "paragraph",
  align = "left",
  width = "normal",
  withAnchors = false, // 👈 clé magique
}) {
  if (!text) return null;

  const stripInlineMarkup = (value) =>
    value
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/==(.*?)==/g, "$1")
      .replace(/\*(.*?)\*/g, "$1");

  const renderFormattedText = (value) => {
    const parts = value.split(/(\*\*.*?\*\*|==.*?==|\*.*?\*)/g);

    return parts.map((part, index) => {
      if (!part) return null;

      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-extrabold">
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (part.startsWith("==") && part.endsWith("==")) {
        return (
          <mark key={index} className="rounded bg-yellow-200 px-1 text-inherit">
            {part.slice(2, -2)}
          </mark>
        );
      }

      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={index}>
            {part.slice(1, -1)}
          </em>
        );
      }

      return part;
    });
  };

  const slugify = (str) =>
    stripInlineMarkup(str)
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  /* ===== TITRE ===== */
  if (variant === "title") {
    const id = withAnchors ? slugify(text) : undefined;

    return (
      <h2
        id={id}
        className={`text-3xl md:text-4xl font-extrabold mb-6 scroll-mt-32 ${align === "center" ? "text-center" : ""}`}
      >
        {renderFormattedText(text)}
      </h2>
    );
  }

  /* ===== SOUS-TITRE ===== */
  if (variant === "subtitle") {
    const id = withAnchors ? slugify(text) : undefined;

    return (
      <h3
        id={id}
        className={`text-xl md:text-2xl font-bold mb-4 scroll-mt-32 ${align === "center" ? "text-center" : ""}`}
      >
        {renderFormattedText(text)}
      </h3>
    );
  }

  /* ===== TEXTE ===== */
  const styles = {
    intro: "text-lg text-gray-700 leading-relaxed mb-6 whitespace-pre-line",
    paragraph: "text-base text-gray-700 leading-relaxed mb-4 whitespace-pre-line",
  };
  const widthClass = {
    narrow: "max-w-2xl",
    normal: "max-w-3xl",
    wide: "max-w-5xl",
  }[width] || "max-w-3xl";
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align] || "text-left";

  return (
    <p className={`${widthClass} mx-auto px-6 ${alignClass} ${styles[variant] || styles.paragraph}`}>
      {renderFormattedText(text)}
    </p>
  );
}
