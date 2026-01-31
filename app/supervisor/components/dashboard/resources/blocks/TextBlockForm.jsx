"use client";

export default function TextBlockForm({ data = {}, onChange }) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-700">
        Texte
      </label>

      {/* Choix du style */}
      <select
        value={data.variant || "paragraph"}
        onChange={(e) =>
          onChange({
            ...data,
            variant: e.target.value,
          })
        }
        className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
      >
        <option value="title">Titre</option>
        <option value="subtitle">Sous-titre</option>
        <option value="intro">Introduction</option>
        <option value="paragraph">Texte (paragraphe)</option>
      </select>

      {/* Contenu */}
      <textarea
        rows={data.variant === "paragraph" ? 6 : 3}
        value={data.text || ""}
        onChange={(e) =>
          onChange({
            ...data,
            text: e.target.value,
          })
        }
        placeholder="Écris ton texte ici..."
        className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#d8947c]"
      />
    </div>
  );
}
