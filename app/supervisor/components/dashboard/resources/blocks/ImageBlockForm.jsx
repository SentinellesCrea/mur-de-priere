"use client";

import { useState } from "react";
import { uploadCloudinaryImage } from "../uploadCloudinaryImage";

export default function ImageBlockForm({ data = {}, onChange }) {
  const [uploading, setUploading] = useState(false);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <select
          value={data.imageSize || "medium"}
          onChange={(e) =>
            onChange({ ...data, imageSize: e.target.value })
          }
          className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
        >
          <option value="small">Petite</option>
          <option value="medium">Moyenne</option>
          <option value="wide">Large</option>
          <option value="full">Pleine largeur</option>
        </select>

        <select
          value={data.imageShape || "rounded"}
          onChange={(e) =>
            onChange({ ...data, imageShape: e.target.value })
          }
          className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
        >
          <option value="soft">Coins doux</option>
          <option value="rounded">Coins généreux</option>
          <option value="square">Sans arrondi</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-600">
          Image importée
        </label>
        <input
          type="text"
          value={data.src || ""}
          readOnly
          placeholder="L’URL Cloudinary apparaîtra ici après import"
          className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-500"
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
              const url = await uploadCloudinaryImage(file, "ressources");
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
