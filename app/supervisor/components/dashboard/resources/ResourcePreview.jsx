"use client";

import ResourceRenderer from "../../../../components/resources/ResourceRenderer";

export default function ResourcePreview({ resource }) {
  if (!resource) return null;

  return (
    <div className="bg-[#f7f7f6] rounded-xl p-6 shadow-inner border">
      <div className="mb-4 text-sm font-bold text-gray-500 uppercase tracking-wide">
        Aperçu en temps réel
      </div>

      {/* ✅ on passe resource, pas blocks */}
      <ResourceRenderer resource={resource} withAnchors={false} />
    </div>
  );
}
