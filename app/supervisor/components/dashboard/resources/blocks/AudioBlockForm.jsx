"use client";

export default function AudioBlockForm({ data = {}, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-600">
        URL audio
      </label>

      <input
        type="text"
        value={data.url || ""}
        onChange={(e) =>
          onChange({ ...data, url: e.target.value })
        }
        placeholder="https://..."
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
    </div>
  );
}
