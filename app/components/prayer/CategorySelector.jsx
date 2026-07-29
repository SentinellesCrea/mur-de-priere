"use client";

import { prayerCategories } from "../../config/prayerCategories";

export default function CategorySelector({
  idPrefix = "prayer",
  category,
  setCategory,
  subcategory,
  setSubcategory,
}) {
  const subcats = prayerCategories[category] || [];
  const hasOtherSub = subcats.includes("__OTHER__");

  return (
    <>
      {/* ================= CATÉGORIE ================= */}
      <label
        htmlFor={`${idPrefix}-category`}
        className="block text-sm font-semibold text-gray-800"
      >
        Catégorie <span className="text-red-600">*</span>
      </label>
      <select
        id={`${idPrefix}-category`}
        className="w-full rounded-md border p-3 focus:border-[#d8947c] focus:outline-none focus:ring-2 focus:ring-[#d8947c]/30"
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setSubcategory("");
        }}
        required
      >
        <option value="">-- Sélectionnez une catégorie --</option>
        {Object.keys(prayerCategories).map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* ================= CAS 1 : CATÉGORIE = AUTRES ================= */}
      {category === "Autres" && (
        <div>
          <label
            htmlFor={`${idPrefix}-subcategory-other`}
            className="mb-2 block text-sm font-semibold text-gray-800"
          >
            Précisez la catégorie
          </label>
          <input
            id={`${idPrefix}-subcategory-other`}
            type="text"
            className="w-full rounded-md border p-3 focus:border-[#d8947c] focus:outline-none focus:ring-2 focus:ring-[#d8947c]/30"
            placeholder="Précisez votre sujet"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            required
          />
        </div>
      )}

      {/* ================= CAS 2 : AUTRES CATÉGORIES ================= */}
      {category && category !== "Autres" && (
        <>
          <label
            htmlFor={`${idPrefix}-subcategory`}
            className="block text-sm font-semibold text-gray-800"
          >
            Sous-catégorie <span className="font-normal text-gray-500">(optionnel)</span>
          </label>
          <select
            id={`${idPrefix}-subcategory`}
            className="w-full rounded-md border p-3 focus:border-[#d8947c] focus:outline-none focus:ring-2 focus:ring-[#d8947c]/30"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
          >
            <option value="">-- Sous-catégorie (optionnel) --</option>

            {subcats
              .filter((sub) => sub !== "__OTHER__")
              .map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}

            {hasOtherSub && (
              <option value="__OTHER__">Autre</option>
            )}
          </select>

          {/* Champ libre si "Autre" en sous-catégorie */}
          {subcategory === "__OTHER__" && (
            <div>
              <label
                htmlFor={`${idPrefix}-subcategory-custom`}
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Précisez la sous-catégorie
              </label>
              <input
                id={`${idPrefix}-subcategory-custom`}
                type="text"
                className="w-full rounded-md border p-3 focus:border-[#d8947c] focus:outline-none focus:ring-2 focus:ring-[#d8947c]/30"
                placeholder="Précisez la sous-catégorie"
                onChange={(e) => setSubcategory(e.target.value)}
                required
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
