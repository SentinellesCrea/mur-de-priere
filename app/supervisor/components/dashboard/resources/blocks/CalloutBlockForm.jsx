"use client";

export default function CalloutBlockForm({ data = {}, onChange }) {
  return (
    <div className="space-y-2">
      <input
        type="text"
        value={data.title || ""}
        onChange={(e) =>
          onChange({ ...data, title: e.target.value })
        }
        placeholder="Titre de l’encadré (optionnel)"
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />

      <textarea
        rows={4}
        value={data.text || ""}
        onChange={(e) =>
          onChange({ ...data, text: e.target.value })
        }
        placeholder="Message important / encouragement"
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />

      <select
        value={data.variant || "info"}
        onChange={(e) =>
          onChange({ ...data, variant: e.target.value })
        }
        className="w-full rounded-lg border px-3 py-2 text-sm"
      >
        <option value="info">Info</option>
        <option value="warning">Avertissement</option>
        <option value="success">Encouragement</option>
        <option value="prayer">Prière</option>
      </select>
    </div>
  );
}
