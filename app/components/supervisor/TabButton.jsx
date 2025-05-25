const TabButton = ({ icon: Icon, label, onClick, color = "#d4967d"}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 p-3 shadow rounded-md hover:bg-gray-100 transition"
    style={{ backgroundColor: color }}
  >
    <Icon /> {/* ✅ ici, on utilise le composant icône */}
    <span>{label}</span>
  </button>
);

export default TabButton;
