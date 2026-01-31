"use client";

export default function ImageBlockForm({ data = {}, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-semibold text-gray-600">
          URL de l’image
        </label>
        <input
          type="text"
          value={data.src || ""}
          onChange={(e) =>
            onChange({ ...data, src: e.target.value })
          }
          placeholder="https://..."
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-600">
          Légende (optionnel)
        </label>
        <input
          type="text"
          value={data.caption || ""}
          onChange={(e) =>
            onChange({ ...data, caption: e.target.value })
          }
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
