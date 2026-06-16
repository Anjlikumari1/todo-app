export default function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 select-none">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-violet-50 rounded-3xl flex items-center justify-center">
          <svg className="w-12 h-12 text-violet-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
        </div>
      </div>
      <p className="text-slate-700 font-semibold text-base mb-1">All clear!</p>
      <p className="text-slate-400 text-sm mb-6">Add a task to get started</p>
      <button
        onClick={onAdd}
        className="px-5 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 active:scale-95 transition-all shadow-sm shadow-violet-200"
      >
        Add first task
      </button>
    </div>
  );
}