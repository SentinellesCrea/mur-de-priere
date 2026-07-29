export default function Button({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-brand hover:bg-brandDark text-white font-medium px-4 py-2 rounded-md transition transform hover:-translate-y-2 duration-300 disabled:cursor-not-allowed disabled:transform-none disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
