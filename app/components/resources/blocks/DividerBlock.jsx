const COLORS = {
  warm: "via-[#d8947c]",
  violet: "via-[#5c40e7]",
  green: "via-[#2F9E6D]",
  gray: "via-gray-300",
};

export default function DividerBlock({
  color = "warm",
  width = "medium",
  style = "gradient",
}) {
  const widthClass = {
    short: "w-28",
    medium: "w-64",
    long: "w-full max-w-3xl",
  }[width] || "w-64";
  const colorClass = COLORS[color] || COLORS.warm;

  return (
    <div className="my-16 flex justify-center">
      {style === "dots" ? (
        <div className="flex gap-2">
          {[0, 1, 2].map((item) => (
            <span
              key={item}
              className={`size-2 rounded-full bg-gradient-to-r from-transparent ${colorClass} to-transparent opacity-80`}
            />
          ))}
        </div>
      ) : (
        <div className={`h-[3px] ${widthClass} rounded-full bg-gradient-to-r from-transparent ${colorClass} to-transparent opacity-70`} />
      )}
    </div>
  );
}
