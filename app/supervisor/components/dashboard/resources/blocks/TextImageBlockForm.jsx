"use client";

export default function TextImageBlockForm({ data = {}, onChange }) {
  return (
    <div className="space-y-3">
      <select
        value={data.position || "left"}
        onChange={(e) =>
          onChange({ ...data, position: e.target.value })
        }
        className="w-full rounded-lg border px-3 py-2 text-sm"
      >
        <option value="left">Image à gauche</option>
        <option value="right">Image à droite</option>
      </select>

      <input
        type="text"
        value={data.src || ""}
        onChange={(e) =>
          onChange({ ...data, src: e.target.value })
        }
        placeholder="URL de l’image"
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />

      <textarea
        rows={4}
        value={data.text || ""}
        onChange={(e) =>
          onChange({ ...data, text: e.target.value })
        }
        placeholder="Texte associé"
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
    </div>
  );
}
