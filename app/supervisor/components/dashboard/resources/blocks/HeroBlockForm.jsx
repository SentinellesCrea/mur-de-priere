"use client";

export default function HeroBlockForm({ data, onChange }) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-gray-700">
        Bloc Hero
      </h4>

      <input
        type="text"
        placeholder="Titre principal"
        className="w-full border rounded px-3 py-2 text-sm"
        value={data.title || ""}
        onChange={(e) =>
          onChange({ ...data, title: e.target.value })
        }
      />

      <textarea
        placeholder="Sous-titre"
        className="w-full border rounded px-3 py-2 text-sm"
        rows={2}
        value={data.subtitle || ""}
        onChange={(e) =>
          onChange({ ...data, subtitle: e.target.value })
        }
      />

      <input
        type="text"
        placeholder="URL image de fond"
        className="w-full border rounded px-3 py-2 text-sm"
        value={data.image || ""}
        onChange={(e) =>
          onChange({ ...data, image: e.target.value })
        }
      />

      <input
        type="text"
        placeholder="Texte du bouton"
        className="w-full border rounded px-3 py-2 text-sm"
        value={data.ctaLabel || ""}
        onChange={(e) =>
          onChange({ ...data, ctaLabel: e.target.value })
        }
      />

      <input
        type="text"
        placeholder="Lien du bouton"
        className="w-full border rounded px-3 py-2 text-sm"
        value={data.ctaLink || ""}
        onChange={(e) =>
          onChange({ ...data, ctaLink: e.target.value })
        }
      />
    </div>
  );
}
