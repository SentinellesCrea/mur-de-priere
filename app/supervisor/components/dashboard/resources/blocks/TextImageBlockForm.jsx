"use client";

import { useState } from "react";
import { uploadCloudinaryImage } from "../uploadCloudinaryImage";

export default function TextImageBlockForm({ data = {}, onChange }) {
  const [uploading, setUploading] = useState(false);

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={data.title || ""}
        onChange={(e) =>
          onChange({ ...data, title: e.target.value })
        }
        placeholder="Titre de la section (optionnel)"
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />

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

      <div className="grid grid-cols-3 gap-3">
        <select
          value={data.imageSize || "medium"}
          onChange={(e) =>
            onChange({ ...data, imageSize: e.target.value })
          }
          className="w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="compact">Image compacte</option>
          <option value="medium">Image moyenne</option>
          <option value="tall">Image haute</option>
        </select>

        <select
          value={data.imageShape || "rounded"}
          onChange={(e) =>
            onChange({ ...data, imageShape: e.target.value })
          }
          className="w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="soft">Coins doux</option>
          <option value="rounded">Coins généreux</option>
          <option value="square">Sans arrondi</option>
        </select>

        <select
          value={data.background || "none"}
          onChange={(e) =>
            onChange({ ...data, background: e.target.value })
          }
          className="w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="none">Sans fond</option>
          <option value="warm">Fond chaleureux</option>
          <option value="calm">Fond calme</option>
        </select>
      </div>

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
