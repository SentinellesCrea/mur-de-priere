export default function TabButton({ onClick, icon: Icon, label, color = "#d4967d" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-white px-4 py-2 rounded flex items-center justify-center gap-2`}
      style={{ backgroundColor: color }}
    >
      <Icon className="inline" />
      {label}
    </button>
  );
}
