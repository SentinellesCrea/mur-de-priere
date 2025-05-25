export default function Button({ children, onClick, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-brand hover:bg-brandDark text-white font-medium px-4 py-2 rounded-md transition transform hover:-translate-y-2 duration-300 ${className}`}
    >
      {children}
    </button>
  );
}
