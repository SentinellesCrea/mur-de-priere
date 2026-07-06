"use client";

export default function ReflectionBlockForm({ data = {}, onChange }) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={data.title || ""}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="Titre du bloc, ex : Question de réflexion"
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />

      <textarea
        rows={3}
        value={data.question || ""}
        onChange={(e) => onChange({ ...data, question: e.target.value })}
        placeholder="Quelle question voulez-vous poser au lecteur ?"
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />

      <textarea
        rows={2}
        value={data.helper || ""}
        onChange={(e) => onChange({ ...data, helper: e.target.value })}
        placeholder="Aide ou piste de méditation (optionnel)"
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />

      <select
        value={data.variant || "question"}
        onChange={(e) => onChange({ ...data, variant: e.target.value })}
        className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
      >
        <option value="question">Question</option>
        <option value="prayer">Prière</option>
        <option value="journal">Journal</option>
      </select>
    </div>
  );
}
