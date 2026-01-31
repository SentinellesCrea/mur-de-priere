"use client";

import {
  FiType,
  FiImage,
  FiVideo,
  FiHeadphones,
  FiAlignLeft,
  FiBookOpen,
  FiMinus,
  FiStar,
  FiLayout,
} from "react-icons/fi";

/* ======================================================
   BLOCK SWITCHER
====================================================== */

const BLOCKS = [
  {
    type: "hero",
    label: "Hero",
    icon: FiLayout,
  },
  {
    type: "text",
    label: "Texte",
    icon: FiType,
  },
  {
    type: "verse",
    label: "Verset",
    icon: FiBookOpen,
  },
  {
    type: "textImage",
    label: "Texte + Image",
    icon: FiAlignLeft,
  },
  {
    type: "image",
    label: "Image",
    icon: FiImage,
  },
  {
    type: "video",
    label: "Vidéo",
    icon: FiVideo,
  },
  {
    type: "audio",
    label: "Audio",
    icon: FiHeadphones,
  },
  {
    type: "divider",
    label: "Séparateur",
    icon: FiMinus,
  },
  {
    type: "callout",
    label: "Encadré",
    icon: FiStar,
  },
];

export default function BlockSwitcher({ onAdd }) {
  return (
    <div className="border rounded-xl bg-white p-4">
      <h3 className="font-bold mb-4 text-sm text-gray-700">
        Ajouter un bloc
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {BLOCKS.map((block) => {
          const Icon = block.icon;

          return (
            <button
              key={block.type}
              type="button"
              onClick={() => onAdd(block.type)}
              className="
                flex flex-col items-center justify-center
                h-20 rounded-lg border
                text-sm font-semibold
                text-gray-600
                hover:border-[#d8947c]
                hover:text-[#d8947c]
                hover:bg-[#d8947c]/5
                transition
              "
            >
              <Icon className="text-xl mb-1" />
              {block.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
