"use client";

export default function VideoBlockForm({ data = {}, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-600">
        URL de la vidéo
      </label>

      <input
        type="text"
        value={data.url || ""}
        onChange={(e) =>
          onChange({ ...data, url: e.target.value })
        }
        placeholder="https://youtube.com/..."
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
    </div>
  );
}
