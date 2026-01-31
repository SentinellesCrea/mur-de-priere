"use client";

export default function VerseBlockForm({ data = {}, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-semibold text-gray-600">
          Verset
        </label>
        <textarea
          rows={3}
          value={data.verse || ""}
          onChange={(e) =>
            onChange({ ...data, verse: e.target.value })
          }
          placeholder="Texte du verset"
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-600">
          Référence
        </label>
        <input
          type="text"
          value={data.reference || ""}
          onChange={(e) =>
            onChange({ ...data, reference: e.target.value })
          }
          placeholder="Ex : Psaume 23:1"
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
