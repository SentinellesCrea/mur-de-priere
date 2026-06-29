"use client";

import { useState } from "react";
import { uploadCloudinaryImage } from "../uploadCloudinaryImage";

export default function ImageBlockForm({ data = {}, onChange }) {
  const [uploading, setUploading] = useState(false);

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
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
              setUploading(true);
              const url = await uploadCloudinaryImage(file, "resource-blocks");
              onChange({ ...data, src: url });
            } catch (error) {
              alert(error.message || "Erreur upload image");
            } finally {
              setUploading(false);
              e.target.value = "";
            }
          }}
          className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
        />
        {uploading && (
          <p className="text-xs text-gray-500 mt-1">Upload en cours...</p>
        )}
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
