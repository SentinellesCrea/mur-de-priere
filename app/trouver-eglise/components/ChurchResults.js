import { FaClipboardList } from "react-icons/fa6";

export default function ChurchResults({ churches = [] }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold text-lg">
        <FaClipboardList className="text-brand" />
        Résultats ({churches.length})
      </div>
      <div className="space-y-3">
        {churches.length === 0 ? (
          <p className="text-gray-500 italic">Aucune église trouvée.</p>
        ) : (
          churches.map((church, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
            >
              <h3 className="font-bold text-[17px] mb-1">{church.name}</h3>
              <p className="text-sm text-gray-700">{church.address}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
