"use client";

import { useState } from "react";

function parseItems(items = "") {
  const rawItems = String(items || "").trim();

  if (!rawItems) return [];

  const lineItems = rawItems
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const separators = ["::", " — ", " - "];
      const separator = separators.find((value) => line.includes(value));

      if (!separator) return null;

      const [rawTitle, ...rest] = line.split(separator);

      return {
        title: rawTitle?.trim() || `Section ${index + 1}`,
        text: rest.join(separator).trim(),
      };
    })
    .filter(Boolean)
    .filter((item) => item.title && item.text);

  if (lineItems.length > 0) return lineItems;

  return rawItems
    .split(/\n\s*\n/)
    .map((section, index) => {
      const lines = section
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length === 0) return null;

      if (lines.length === 1) {
        return {
          title: `Section ${index + 1}`,
          text: lines[0],
        };
      }

      return {
        title: lines[0],
        text: lines.slice(1).join("\n"),
      };
    })
    .filter(Boolean)
    .filter((item) => item.title && item.text);
}

export default function AccordionBlock({ title = "Pour aller plus loin", items }) {
  const parsedItems = parseItems(items);
  const [openIndex, setOpenIndex] = useState(0);

  if (parsedItems.length === 0) return null;

  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      {title && (
        <h3 className="text-2xl font-extrabold mb-5 text-gray-950">
          {title}
        </h3>
      )}

      <div className="space-y-3">
        {parsedItems.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={`${item.title}-${index}`}
              className="rounded-2xl border border-[#E7E0D8] bg-white overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
              >
                <span className="font-extrabold text-gray-950">
                  {item.title}
                </span>
                <span className="text-xl font-bold text-[#5c40e7]">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen && (
                <p className="px-5 pb-5 text-sm leading-6 text-gray-600 whitespace-pre-line">
                  {item.text}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
