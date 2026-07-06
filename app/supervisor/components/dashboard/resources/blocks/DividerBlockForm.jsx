"use client";

export default function DividerBlockForm({ data = {}, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <select
        value={data.color || "warm"}
        onChange={(e) => onChange({ ...data, color: e.target.value })}
        className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
      >
        <option value="warm">Chaleureux</option>
        <option value="violet">Violet</option>
        <option value="green">Vert</option>
        <option value="gray">Gris</option>
      </select>

      <select
        value={data.width || "medium"}
        onChange={(e) => onChange({ ...data, width: e.target.value })}
        className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
      >
        <option value="short">Court</option>
        <option value="medium">Moyen</option>
        <option value="long">Long</option>
      </select>

      <select
        value={data.style || "gradient"}
        onChange={(e) => onChange({ ...data, style: e.target.value })}
        className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
      >
        <option value="gradient">Ligne douce</option>
        <option value="dots">Points</option>
      </select>
    </div>
  );
}
