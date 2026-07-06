"use client";

import { useRef } from "react";

export default function TextBlockForm({ data = {}, onChange }) {
  const textareaRef = useRef(null);

  const applyInlineStyle = (startMarker, endMarker = startMarker) => {
    const textarea = textareaRef.current;
    const currentText = data.text || "";

    if (!textarea) return;

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const selectedText = currentText.slice(selectionStart, selectionEnd) || "texte";
    const nextText = `${currentText.slice(0, selectionStart)}${startMarker}${selectedText}${endMarker}${currentText.slice(selectionEnd)}`;

    onChange({
      ...data,
      text: nextText,
    });

    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        selectionStart + startMarker.length,
        selectionStart + startMarker.length + selectedText.length
      );
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-700">
        Texte
      </label>

      {/* Choix du style */}
      <select
        value={data.variant || "paragraph"}
        onChange={(e) =>
          onChange({
            ...data,
            variant: e.target.value,
          })
        }
        className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
      >
        <option value="title">Titre</option>
        <option value="subtitle">Sous-titre</option>
        <option value="intro">Introduction</option>
        <option value="paragraph">Texte (paragraphe)</option>
      </select>

      <div className="grid grid-cols-2 gap-3">
        <select
          value={data.align || "left"}
          onChange={(e) =>
            onChange({
              ...data,
              align: e.target.value,
            })
          }
          className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
        >
          <option value="left">Aligné à gauche</option>
          <option value="center">Centré</option>
          <option value="right">Aligné à droite</option>
        </select>

        <select
          value={data.width || "normal"}
          onChange={(e) =>
            onChange({
              ...data,
              width: e.target.value,
            })
          }
          className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
        >
          <option value="narrow">Largeur étroite</option>
          <option value="normal">Largeur normale</option>
          <option value="wide">Largeur grande</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applyInlineStyle("**")}
          className="rounded-lg border border-[#E6DED6] bg-white px-3 py-2 text-sm font-extrabold text-gray-700 hover:text-[#5c40e7]"
          title="Mettre en gras"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => applyInlineStyle("*")}
          className="rounded-lg border border-[#E6DED6] bg-white px-3 py-2 text-sm italic font-bold text-gray-700 hover:text-[#5c40e7]"
          title="Mettre en italique"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => applyInlineStyle("==")}
          className="rounded-lg border border-[#E6DED6] bg-yellow-100 px-3 py-2 text-sm font-extrabold text-gray-700 hover:text-[#5c40e7]"
          title="Surligner"
        >
          Surligner
        </button>
      </div>

      {/* Contenu */}
      <textarea
        ref={textareaRef}
        rows={data.variant === "paragraph" ? 6 : 3}
        value={data.text || ""}
        onChange={(e) =>
          onChange({
            ...data,
            text: e.target.value,
          })
        }
        placeholder="Écris ton texte ici..."
        className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#d8947c]"
      />
    </div>
  );
}
