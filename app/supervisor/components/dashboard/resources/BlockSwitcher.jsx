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
  FiMessageSquare,
  FiHelpCircle,
  FiCheckSquare,
  FiList,
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
  {
    type: "quote",
    label: "Citation",
    icon: FiMessageSquare,
  },
  {
    type: "reflection",
    label: "Question",
    icon: FiHelpCircle,
  },
  {
    type: "takeaway",
    label: "À retenir",
    icon: FiCheckSquare,
  },
  {
    type: "accordion",
    label: "Accordéon",
    icon: FiList,
  },
];

export default function BlockSwitcher({ onAdd }) {
  return (
    <div className="border border-[#E6DED6] rounded-3xl bg-white p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="font-extrabold text-sm text-gray-800">
          Ajouter un bloc
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Composez la ressource morceau par morceau.
        </p>
      </div>

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
                h-24 rounded-2xl border border-[#E6DED6]
                text-sm font-semibold
                text-gray-600
                hover:border-[#5c40e7]
                hover:text-[#5c40e7]
                hover:bg-[#F4F1FF]
                transition
              "
            >
              <Icon className="text-xl mb-2" />
              {block.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
