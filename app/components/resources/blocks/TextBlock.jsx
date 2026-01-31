export default function TextBlock({
  text,
  variant = "paragraph",
  withAnchors = false, // 👈 clé magique
}) {
  if (!text) return null;

  const slugify = (str) =>
    str
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  /* ===== TITRE ===== */
  if (variant === "title") {
    const id = withAnchors ? slugify(text) : undefined;

    return (
      <h2
        id={id}
        className="text-3xl md:text-4xl font-extrabold mb-6 scroll-mt-32"
      >
        {text}
      </h2>
    );
  }

  /* ===== SOUS-TITRE ===== */
  if (variant === "subtitle") {
    const id = withAnchors ? slugify(text) : undefined;

    return (
      <h3
        id={id}
        className="text-xl md:text-2xl font-bold mb-4 scroll-mt-32"
      >
        {text}
      </h3>
    );
  }

  /* ===== TEXTE ===== */
  const styles = {
    intro: "text-lg text-gray-700 leading-relaxed mb-6",
    paragraph: "text-base text-gray-700 leading-relaxed mb-4",
  };

  return (
    <p className={styles[variant] || styles.paragraph}>
      {text}
    </p>
  );
}
