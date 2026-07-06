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

      <div className="grid grid-cols-2 gap-3">
        <select
          value={data.layout || "center"}
          onChange={(e) => onChange({ ...data, layout: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm bg-white"
        >
          <option value="center">Composition centrée</option>
          <option value="left">Texte à gauche</option>
          <option value="wide">Texte large</option>
        </select>

        <select
          value={data.height || "large"}
          onChange={(e) => onChange({ ...data, height: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm bg-white"
        >
          <option value="compact">Compact</option>
          <option value="medium">Moyen</option>
          <option value="large">Grand</option>
        </select>

        <select
          value={data.align || "center"}
          onChange={(e) => onChange({ ...data, align: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm bg-white"
        >
          <option value="left">Texte gauche</option>
          <option value="center">Texte centré</option>
          <option value="right">Texte droite</option>
        </select>

        <select
          value={data.overlay || "medium"}
          onChange={(e) => onChange({ ...data, overlay: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm bg-white"
        >
          <option value="light">Image claire</option>
          <option value="medium">Contraste moyen</option>
          <option value="strong">Contraste fort</option>
        </select>
      </div>

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
        placeholder="L’URL Cloudinary de l’image de fond apparaîtra ici après import"
        className="w-full border rounded bg-gray-50 px-3 py-2 text-sm text-gray-500"
        value={data.image || ""}
        readOnly
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

      <select
        value={data.buttonStyle || "solid"}
        onChange={(e) => onChange({ ...data, buttonStyle: e.target.value })}
        className="w-full border rounded px-3 py-2 text-sm bg-white"
      >
        <option value="solid">Bouton plein</option>
        <option value="outline">Bouton contour</option>
      </select>
    </div>
  );
}
