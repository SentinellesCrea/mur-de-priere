const TabButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 p-3 bg-white shadow rounded-md hover:bg-gray-100 transition"
  >
    <Icon /> {/* ✅ ici, on utilise le composant icône */}
    <span>{label}</span>
  </button>
);

export default TabButton;
