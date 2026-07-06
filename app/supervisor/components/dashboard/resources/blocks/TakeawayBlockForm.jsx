"use client";

export default function TakeawayBlockForm({ data = {}, onChange }) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={data.title || ""}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="Titre, ex : À retenir"
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />

      <textarea
        rows={data.listStyle && data.listStyle !== "paragraph" ? 6 : 4}
        value={data.text || ""}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        placeholder={
          data.listStyle && data.listStyle !== "paragraph"
            ? "Une ligne par élément de liste..."
            : "Résumé, action concrète ou pensée finale..."
        }
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />

      <select
        value={data.listStyle || "paragraph"}
        onChange={(e) => onChange({ ...data, listStyle: e.target.value })}
        className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
      >
        <option value="paragraph">Texte simple</option>
        <option value="bullets">Liste à puces</option>
        <option value="numbers">Liste numérotée</option>
      </select>

      <select
        value={data.variant || "summary"}
        onChange={(e) => onChange({ ...data, variant: e.target.value })}
        className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
      >
        <option value="summary">Résumé</option>
        <option value="encouragement">Encouragement</option>
        <option value="action">Action</option>
      </select>
    </div>
  );
}
