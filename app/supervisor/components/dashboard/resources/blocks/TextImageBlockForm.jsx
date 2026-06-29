"use client";

import { useState } from "react";
import { uploadCloudinaryImage } from "../uploadCloudinaryImage";

export default function TextImageBlockForm({ data = {}, onChange }) {
  const [uploading, setUploading] = useState(false);

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
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
      {uploading && (
        <p className="text-xs text-gray-500">Upload en cours...</p>
      )}

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
