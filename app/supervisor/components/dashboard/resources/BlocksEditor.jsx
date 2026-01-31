"use client";

import BlockSwitcher from "./BlockSwitcher";

// Block forms
import HeroBlockForm from "./blocks/HeroBlockForm";
import TextBlockForm from "./blocks/TextBlockForm";
import VerseBlockForm from "./blocks/VerseBlockForm";
import ImageBlockForm from "./blocks/ImageBlockForm";
import TextImageBlockForm from "./blocks/TextImageBlockForm";
import VideoBlockForm from "./blocks/VideoBlockForm";
import AudioBlockForm from "./blocks/AudioBlockForm";
import DividerBlockForm from "./blocks/DividerBlockForm";
import CalloutBlockForm from "./blocks/CalloutBlockForm";

import useMounted from "@/hooks/useMounted";

/* ======================================================
   BlocksEditor
====================================================== */

export default function BlocksEditor({ blocks = [], onChange }) {
  /* ================= ADD BLOCK ================= */
  const addBlock = (type) => {
    const newBlock = {
      type,
      data: {},
      order: blocks.length,
    };

    onChange([...blocks, newBlock]);
  };

  /* ================= UPDATE BLOCK ================= */
  const updateBlock = (index, newData) => {
    const updated = [...blocks];
    updated[index] = {
      ...updated[index],
      data: newData,
    };
    onChange(updated);
  };

  /* ================= REMOVE BLOCK ================= */
  const removeBlock = (index) => {
    const updated = blocks.filter((_, i) => i !== index);
    onChange(updated.map((b, i) => ({ ...b, order: i })));
  };

  /* ================= MOVE BLOCK ================= */
  const moveBlock = (from, to) => {
    if (to < 0 || to >= blocks.length) return;

    const updated = [...blocks];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);

    onChange(updated.map((b, i) => ({ ...b, order: i })));
  };

  /* ================= RENDER FORM ================= */
  const renderBlockForm = (block, index) => {
    const props = {
      data: block.data,
      onChange: (data) => updateBlock(index, data),
    };

    switch (block.type) {
      case "hero":
        return <HeroBlockForm {...props} />;
      case "text":
        return <TextBlockForm {...props} />;

      case "verse":
        return <VerseBlockForm {...props} />;

      case "image":
        return <ImageBlockForm {...props} />;

      case "textImage":
        return <TextImageBlockForm {...props} />;

      case "video":
        return <VideoBlockForm {...props} />;

      case "audio":
        return <AudioBlockForm {...props} />;

      case "divider":
        return <DividerBlockForm />;

      case "callout":
        return <CalloutBlockForm {...props} />;

      default:
        return (
          <p className="text-xs text-red-500">
            Bloc inconnu : {block.type}
          </p>
        );
    }
  };

  const mounted = useMounted();

  if (!mounted) {
    // 🔒 empêche toute différence SSR / client
    return null;
  }

  return (
    <div className="space-y-6">
      {/* ================= BLOCKS LIST ================= */}
      {blocks.map((block, index) => (
        <div
          key={index}
          className="border rounded-xl p-4 bg-white shadow-sm space-y-4"
        >
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-[#d8947c]">
              {block.type}
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => moveBlock(index, index - 1)}
                className="text-xs px-2 py-1 border rounded"
              >
                ↑
              </button>
              <button
                onClick={() => moveBlock(index, index + 1)}
                className="text-xs px-2 py-1 border rounded"
              >
                ↓
              </button>
              <button
                onClick={() => removeBlock(index)}
                className="text-xs px-2 py-1 border border-red-300 text-red-500 rounded"
              >
                Supprimer
              </button>
            </div>
          </div>

          {/* FORM */}
          {renderBlockForm(block, index)}
        </div>
      ))}

      {/* ================= ADD BLOCK ================= */}
      <BlockSwitcher onAdd={addBlock} />
    </div>
  );
}
