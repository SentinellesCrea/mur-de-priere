"use client";

import ResourceRenderer from "../../../../components/resources/ResourceRenderer";

export default function ResourcePreview({ resource }) {
  if (!resource) return null;

  return (
    <div className="rounded-[1.75rem] border border-[#E7E0D8] bg-white p-4 sm:p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#5c40e7]">
            Aperçu
          </p>
          <h2 className="mt-1 text-lg font-extrabold text-gray-950">
            Rendu public
          </h2>
        </div>
        <span className="rounded-full bg-[#F4F1FF] px-3 py-1 text-xs font-extrabold text-[#5c40e7]">
          Direct
        </span>
      </div>

      <div className="max-h-[78vh] overflow-y-auto rounded-3xl border border-[#E6DED6] bg-[#F8F5EF] p-3 sm:p-4">
        {/* ✅ on passe resource, pas blocks */}
        <ResourceRenderer resource={resource} withAnchors={false} />
      </div>
    </div>
  );
}
