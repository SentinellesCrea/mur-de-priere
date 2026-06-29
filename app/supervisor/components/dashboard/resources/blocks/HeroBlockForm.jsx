"use client";

import { useState } from "react";
import { uploadCloudinaryImage } from "../uploadCloudinaryImage";

export default function HeroBlockForm({ data, onChange }) {
  const [uploading, setUploading] = useState(false);

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-gray-700">
        Bloc Hero
      </h4>

      <input
        type="text"
        placeholder="Titre principal"
        className="w-full border rounded px-3 py-2 text-sm"
        value={data.title || ""}
        onChange={(e) =>
          onChange({ ...data, title: e.target.value })
        }
      />

      <textarea
        placeholder="Sous-titre"
        className="w-full border rounded px-3 py-2 text-sm"
        rows={2}
        value={data.subtitle || ""}
        onChange={(e) =>
          onChange({ ...data, subtitle: e.target.value })
        }
      />

      <input
        type="text"
        placeholder="URL image de fond"
        className="w-full border rounded px-3 py-2 text-sm"
        value={data.image || ""}
        onChange={(e) =>
          onChange({ ...data, image: e.target.value })
        }
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
            onChange({ ...data, image: url });
          } catch (error) {
            alert(error.message || "Erreur upload image");
          } finally {
            setUploading(false);
            e.target.value = "";
          }
        }}
        className="w-full border rounded px-3 py-2 text-sm"
      />
      {uploading && (
        <p className="text-xs text-gray-500">Upload en cours...</p>
      )}

      <input
        type="text"
        placeholder="Texte du bouton"
        className="w-full border rounded px-3 py-2 text-sm"
        value={data.ctaLabel || ""}
        onChange={(e) =>
          onChange({ ...data, ctaLabel: e.target.value })
        }
      />

      <input
        type="text"
        placeholder="Lien du bouton"
        className="w-full border rounded px-3 py-2 text-sm"
        value={data.ctaLink || ""}
        onChange={(e) =>
          onChange({ ...data, ctaLink: e.target.value })
        }
      />
    </div>
  );
}
