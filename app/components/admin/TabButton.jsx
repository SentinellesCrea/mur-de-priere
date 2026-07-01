export default function TabButton({ onClick, icon: Icon, label, active = false, badge = null }) {
  return (
    <button
      onClick={onClick}
      className={`group flex min-h-[72px] w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition ${
        active
          ? "border-[#8B1E3F] bg-[#8B1E3F] text-white shadow-sm"
          : "border-[#eadfd3] bg-[#fffaf5] text-[#5f5146] hover:border-[#d9b99f] hover:bg-[#FFF2E7] hover:text-[#8B1E3F]"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            active ? "bg-white/15 text-white" : "bg-white text-[#8B1E3F] group-hover:bg-white"
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-sm font-bold leading-5">{label}</span>
      </span>
      {badge !== null && badge !== undefined && (
        <span
          className={`rounded-md px-2 py-1 text-xs font-bold ${
            active ? "bg-white/15 text-white" : "bg-white text-[#7a6b5f]"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
