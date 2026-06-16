export default function Checkbox({ checked, onChange, size = "md" }) {
  const s = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <button
      onClick={onChange}
      className={`${s} rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
        checked ? "bg-violet-600 border-violet-600 scale-90" : "border-slate-300 hover:border-violet-400 hover:bg-violet-50"
      }`}
    >
      {checked && (
        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7"/>
        </svg>
      )}
    </button>
  );
}