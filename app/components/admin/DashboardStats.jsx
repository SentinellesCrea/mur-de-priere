export default function DashboardStats({ pendingVolunteers, missions, urgentMissions, moderations }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="p-4 bg-yellow-100 rounded shadow">
        <p className="text-sm text-gray-600">🕒 Bénévoles en attente</p>
        <h3 className="text-xl font-bold text-yellow-700">{pendingVolunteers}</h3>
      </div>
      <div className="p-4 bg-blue-100 rounded shadow">
        <p className="text-sm text-gray-600">📤 Missions à dispatcher</p>
        <h3 className="text-xl font-bold text-blue-700">{missions}</h3>
      </div>
      <div className="p-4 bg-red-100 rounded shadow">
        <p className="text-sm text-gray-700 animate-pulse">Missions Urgentes 🚨</p>
        <h3 className="text-xl font-bold text-red-700">{urgentMissions}</h3>
      </div>
      <div className="p-4 bg-pink-100 rounded shadow">
        <p className="text-sm text-gray-600">💬 Témoignages en modération</p>
        <h3 className="text-xl font-bold text-pink-700">{moderations}</h3>
      </div>
    </div>
  );
}
