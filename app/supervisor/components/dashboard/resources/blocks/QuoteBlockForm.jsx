"use client";

export default function QuoteBlockForm({ data = {}, onChange }) {
  return (
    <div className="space-y-3">
      <textarea
        rows={3}
        value={data.text || ""}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        placeholder="Phrase forte, citation, pensée..."
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />

      <input
        type="text"
        value={data.author || ""}
        onChange={(e) => onChange({ ...data, author: e.target.value })}
        placeholder="Auteur ou source (optionnel)"
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />

      <select
        value={data.variant || "soft"}
        onChange={(e) => onChange({ ...data, variant: e.target.value })}
        className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
      >
        <option value="soft">Doux</option>
        <option value="warm">Chaleureux</option>
        <option value="deep">Profond</option>
      </select>
    </div>
  );
}
