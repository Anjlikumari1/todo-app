import { useState, useMemo, useCallback, useRef, useEffect } from "react";

const PRIORITY = {
  normal:    { label: "Normal",    bg: "bg-slate-100",   text: "text-slate-500",  border: "border-l-slate-300",  badge: "bg-slate-100 text-slate-500 border border-slate-200",   dot: "bg-slate-400",   ring: "ring-slate-200" },
  medium:    { label: "Medium",    bg: "bg-sky-50",      text: "text-sky-600",    border: "border-l-sky-400",    badge: "bg-sky-50 text-sky-600 border border-sky-200",           dot: "bg-sky-400",     ring: "ring-sky-200"   },
  important: { label: "Important", bg: "bg-amber-50",    text: "text-amber-600",  border: "border-l-amber-400",  badge: "bg-amber-50 text-amber-600 border border-amber-200",     dot: "bg-amber-400",   ring: "ring-amber-200" },
  urgent:    { label: "Urgent",    bg: "bg-rose-50",     text: "text-rose-600",   border: "border-l-rose-400",   badge: "bg-rose-50 text-rose-600 border border-rose-200",         dot: "bg-rose-400",    ring: "ring-rose-200"  },
};

const LIST_COLORS = ["#7C3AED","#0EA5E9","#10B981","#F59E0B","#EF4444","#EC4899","#8B5CF6","#06B6D4"];

const genId = () => Math.random().toString(36).slice(2,10);

const formatDate = (d) => {
  if (!d) return null;
  const dt = new Date(d), today = new Date(), tom = new Date();
  tom.setDate(today.getDate()+1);
  if (dt.toDateString()===today.toDateString()) return "Today";
  if (dt.toDateString()===tom.toDateString()) return "Tomorrow";
  return dt.toLocaleDateString("en-US",{month:"short",day:"numeric"});
};

const isOverdue = (d) => d && new Date(d) < new Date(new Date().setHours(0,0,0,0));

/* ─── Checkbox ─── */
function Checkbox({ checked, onChange, size = "md" }) {
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

/* ─── Empty State ─── */
function EmptyState({ onAdd }) {
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

/* ─── Task Modal ─── */
function TaskModal({ task, listId, onSave, onClose }) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [date, setDate] = useState(task?.date || "");
  const [time, setTime] = useState(task?.time || "");
  const [priority, setPriority] = useState(task?.priority || "normal");
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);
  const [newSub, setNewSub] = useState("");
  const titleRef = useRef(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const addSub = () => {
    if (!newSub.trim()) return;
    setSubtasks(p => [...p, { id: genId(), title: newSub.trim(), completed: false }]);
    setNewSub("");
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: task?.id || genId(),
      title: title.trim(), description: description.trim(),
      date, time, priority, subtasks,
      completed: task?.completed || false,
      listId, createdAt: task?.createdAt || Date.now(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" />
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header stripe */}
        <div className="h-1.5 bg-violet-600 rounded-t-3xl" />

        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-violet-600 uppercase tracking-widest">
            {task ? "Edit task" : "New task"}
          </span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          <input
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSave()}
            placeholder="What needs to be done?"
            className="w-full text-xl font-semibold placeholder-slate-300 text-slate-800 outline-none pb-2 border-b-2 border-transparent focus:border-violet-500 transition-colors bg-transparent"
          />

          <div className="relative">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a note…"
              rows={2}
              className="w-full text-sm text-slate-600 placeholder-slate-300 outline-none resize-none bg-slate-50 rounded-2xl p-3.5 focus:bg-slate-100 transition-colors leading-relaxed"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Date", type: "date", value: date, set: setDate, icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              )},
              { label: "Time", type: "time", value: time, set: setTime, icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              )},
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1.5">
                  <span className="text-slate-300">{f.icon}</span>{f.label}
                </label>
                <input
                  type={f.type}
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition-all bg-white"
                />
              </div>
            ))}
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-2">Priority</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(PRIORITY).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setPriority(key)}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center gap-1.5 ${cfg.badge} ${
                    priority === key ? "ring-2 " + cfg.ring + " shadow-sm scale-[1.04]" : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-2">Subtasks</label>
            {subtasks.length > 0 && (
              <div className="space-y-1.5 mb-2.5 bg-slate-50 rounded-xl p-3">
                {subtasks.map(s => (
                  <div key={s.id} className="flex items-center gap-2.5 group">
                    <Checkbox size="sm" checked={s.completed} onChange={() =>
                      setSubtasks(p => p.map(x => x.id === s.id ? {...x, completed: !x.completed} : x))
                    }/>
                    <span className={`text-sm flex-1 ${s.completed ? "line-through text-slate-400" : "text-slate-700"}`}>{s.title}</span>
                    <button
                      onClick={() => setSubtasks(p => p.filter(x => x.id !== s.id))}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-400 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={newSub}
                onChange={e => setNewSub(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSub(); }}}
                placeholder="Add a subtask…"
                className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition-all placeholder-slate-300"
              />
              <button
                onClick={addSub}
                disabled={!newSub.trim()}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm rounded-xl transition-colors disabled:opacity-40 font-medium"
              >Add</button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-2.5">
          <button onClick={onClose} className="flex-1 py-3 text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 py-3 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all disabled:opacity-40 shadow-sm shadow-violet-200 active:scale-[0.98]"
          >
            {task ? "Save changes" : "Add task"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Task Card ─── */
function TaskCard({ task, onToggle, onEdit, onDelete, onToggleSub }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = PRIORITY[task.priority] || PRIORITY.normal;
  const overdue = isOverdue(task.date) && !task.completed;
  const doneSubs = task.subtasks?.filter(s => s.completed).length || 0;
  const totalSubs = task.subtasks?.length || 0;
  const pct = totalSubs ? Math.round((doneSubs / totalSubs) * 100) : 0;

  return (
    <div className={`group relative bg-white rounded-2xl border border-l-4 border-slate-200 transition-all duration-200 overflow-hidden ${
      task.completed ? "opacity-50 border-l-slate-200" : cfg.border + " hover:shadow-md hover:shadow-slate-100 hover:-translate-y-0.5"
    }`}>
      <div className="flex items-start gap-3 px-4 py-4">
        <div className="pt-0.5">
          <Checkbox checked={task.completed} onChange={() => onToggle(task.id)} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug transition-all ${task.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
            {task.title}
          </p>

          {task.description && !task.completed && (
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-1">{task.description}</p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            {task.priority !== "normal" && (
              <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-semibold ${cfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            )}
            {task.date && (
              <span className={`text-xs font-medium inline-flex items-center gap-1 ${overdue ? "text-rose-500" : "text-slate-400"}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                {overdue && "Overdue · "}{formatDate(task.date)}{task.time ? ` · ${task.time}` : ""}
              </span>
            )}
            {totalSubs > 0 && (
              <button onClick={() => setExpanded(!expanded)} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-500 transition-colors">
                <svg className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                </svg>
                <span className="font-medium">{doneSubs}/{totalSubs}</span>
                {/* Mini progress bar */}
                <span className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <span className="block h-full bg-violet-400 rounded-full transition-all" style={{width: pct+"%"}} />
                </span>
              </button>
            )}
          </div>

          {/* Subtasks expand */}
          {expanded && (
            <div className="mt-3 pl-2 space-y-2 border-l-2 border-violet-100">
              {task.subtasks.map(s => (
                <div key={s.id} className="flex items-center gap-2">
                  <Checkbox size="sm" checked={s.completed} onChange={() => onToggleSub(task.id, s.id)} />
                  <span className={`text-xs ${s.completed ? "line-through text-slate-400" : "text-slate-600"}`}>{s.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-300 hover:text-violet-500 hover:bg-violet-50 rounded-lg transition-all"
            aria-label="Edit task"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-rose-50 rounded-lg transition-all"
            aria-label="Delete task"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [lists, setLists] = useState([{ id: "my-tasks", name: "My Tasks", color: LIST_COLORS[0] }]);
  const [tasks, setTasks] = useState([]);
  const [activeListId, setActiveListId] = useState("my-tasks");
  const [modal, setModal] = useState(null);
  const [showDone, setShowDone] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [addingList, setAddingList] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const newListRef = useRef(null);

  useEffect(() => { if (addingList) newListRef.current?.focus(); }, [addingList]);

  const allActive = useMemo(() => tasks.filter(t => t.listId === activeListId && !t.completed), [tasks, activeListId]);
  const allDone   = useMemo(() => tasks.filter(t => t.listId === activeListId && t.completed),  [tasks, activeListId]);

  const filtered = useMemo(() => {
    let base = allActive;
    if (filter === "today")     base = base.filter(t => t.date && formatDate(t.date) === "Today");
    else if (filter === "urgent")    base = base.filter(t => t.priority === "urgent");
    else if (filter === "important") base = base.filter(t => t.priority === "important");
    if (search.trim()) base = base.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    return base;
  }, [allActive, filter, search]);

  const activeList = useMemo(() => lists.find(l => l.id === activeListId), [lists, activeListId]);

  const priCounts = useMemo(() => {
    const c = { urgent:0, important:0, medium:0, normal:0 };
    allActive.forEach(t => { if (c[t.priority]!==undefined) c[t.priority]++; });
    return c;
  }, [allActive]);

  const handleSave = useCallback((task) => {
    setTasks(p => { const i = p.findIndex(t => t.id===task.id); if(i>=0){const n=[...p];n[i]=task;return n;} return [...p,task]; });
  }, []);
  const handleToggle   = useCallback((id) => setTasks(p => p.map(t => t.id===id ? {...t,completed:!t.completed} : t)), []);
  const handleDelete   = useCallback((id) => setTasks(p => p.filter(t => t.id!==id)), []);
  const handleToggleSub = useCallback((tid,sid) => setTasks(p => p.map(t => t.id!==tid ? t : {...t,subtasks:t.subtasks.map(s=>s.id===sid?{...s,completed:!s.completed}:s)})), []);

  const addList = () => {
    if (!newListName.trim()) { setAddingList(false); return; }
    const id = genId(), color = LIST_COLORS[lists.length % LIST_COLORS.length];
    setLists(p => [...p, { id, name: newListName.trim(), color }]);
    setActiveListId(id); setNewListName(""); setAddingList(false); setSidebarOpen(false);
  };

  const FILTERS = [
    { key:"all",       label:"All",       count: allActive.length },
    { key:"today",     label:"Today",     count: allActive.filter(t=>t.date&&formatDate(t.date)==="Today").length },
    { key:"urgent",    label:"Urgent",    count: priCounts.urgent },
    { key:"important", label:"Important", count: priCounts.important },
  ];

  return (
    <div className="min-h-screen bg-[#F4F2FF] flex font-sans">
      {sidebarOpen && <div className="fixed inset-0 bg-black/25 z-20 sm:hidden" onClick={()=>setSidebarOpen(false)}/>}

      {/* ── Sidebar ── */}
      <aside className={`fixed sm:sticky top-0 left-0 h-screen z-30 sm:z-auto w-64 bg-white flex flex-col shadow-xl shadow-violet-100/50 transition-transform duration-300 ${sidebarOpen?"translate-x-0":"-translate-x-full sm:translate-x-0"}`}>
        {/* Brand */}
        <div className="px-5 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center shadow-sm shadow-violet-300">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm leading-none">Tasks</p>
              <p className="text-xs text-slate-400 mt-0.5">Stay organized</p>
            </div>
          </div>
        </div>

        {/* Lists */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">My Lists</p>
          <div className="space-y-0.5">
            {lists.map(list => {
              const count = tasks.filter(t=>t.listId===list.id&&!t.completed).length;
              const active = activeListId===list.id;
              return (
                <div key={list.id} className="group flex items-center gap-1">
                  <button
                    onClick={() => { setActiveListId(list.id); setSidebarOpen(false); setFilter("all"); }}
                    className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"}`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background: list.color}} />
                    <span className="flex-1 truncate text-left">{list.name}</span>
                    {count > 0 && (
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${active?"bg-violet-600 text-white":"bg-slate-100 text-slate-500"}`}>{count}</span>
                    )}
                  </button>
                  {list.id !== "my-tasks" && (
                    <button
                      onClick={() => {
                        setLists(p=>p.filter(l=>l.id!==list.id));
                        setTasks(p=>p.filter(t=>t.listId!==list.id));
                        if(activeListId===list.id) setActiveListId("my-tasks");
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-400 rounded-lg transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add list */}
        <div className="p-3 border-t border-slate-100">
          {addingList ? (
            <div className="flex gap-2">
              <input
                ref={newListRef}
                value={newListName}
                onChange={e=>setNewListName(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")addList();if(e.key==="Escape"){setAddingList(false);setNewListName("");}}}
                placeholder="List name…"
                className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent placeholder-slate-300"
              />
              <button onClick={addList} className="px-3 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-xl hover:bg-violet-700 transition-colors">Add</button>
            </div>
          ) : (
            <button
              onClick={()=>setAddingList(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-medium"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              New list
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#F4F2FF]/90 backdrop-blur-md px-4 sm:px-8 py-4">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button onClick={()=>setSidebarOpen(true)} className="sm:hidden p-2 -ml-1 text-slate-500 hover:bg-white/70 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2.5">
                <h1 className="text-2xl font-bold text-slate-800 truncate">{activeList?.name}</h1>
                {allActive.length > 0 && (
                  <span className="text-sm text-slate-400 font-medium flex-shrink-0">{allActive.length} task{allActive.length!==1?"s":""}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 sm:px-8 pb-28 max-w-2xl mx-auto w-full">

          {/* Search bar */}
          {allActive.length > 0 && (
            <div className="relative mb-5">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                value={search}
                onChange={e=>setSearch(e.target.value)}
                placeholder="Search tasks…"
                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-300 outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition-all shadow-sm"
              />
              {search && (
                <button onClick={()=>setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              )}
            </div>
          )}

          {/* Progress Dashboard */}
          {(allActive.length > 0 || allDone.length > 0) && (() => {
            const total = allActive.length + allDone.length;
            const pct = total ? Math.round((allDone.length / total) * 100) : 0;
            const overdueCnt = allActive.filter(t => isOverdue(t.date)).length;
            const barColor = pct === 100 ? "#10B981" : pct >= 60 ? "#7C3AED" : pct >= 30 ? "#F59E0B" : "#CBD5E1";
            return (
              <div className="mb-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-800 leading-none">{allActive.length}</div>
                      <div className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wide">Pending</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-800 leading-none">{allDone.length}</div>
                      <div className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wide">Completed</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3.5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">Overall progress</span>
                    <div className="flex items-center gap-3">
                      {overdueCnt > 0 && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-rose-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                          </svg>
                          {overdueCnt} overdue
                        </span>
                      )}
                      <span className="text-sm font-bold text-violet-600">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{width: pct + "%", background: barColor}} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-slate-400">{allDone.length} of {total} tasks done</span>
                    {pct === 100 && <span className="text-[10px] font-semibold text-emerald-500">All done!</span>}
                  </div>
                </div>

                {allActive.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key:"urgent",    label:"Urgent",    num: priCounts.urgent,    bg:"bg-rose-50",  text:"text-rose-600",  border:"border-rose-200"  },
                      { key:"important", label:"Important", num: priCounts.important, bg:"bg-amber-50", text:"text-amber-600", border:"border-amber-200" },
                      { key:"medium",    label:"Medium",    num: priCounts.medium,    bg:"bg-sky-50",   text:"text-sky-600",   border:"border-sky-200"   },
                      { key:"normal",    label:"Normal",    num: priCounts.normal,    bg:"bg-slate-50", text:"text-slate-500", border:"border-slate-200" },
                    ].map(s => (
                      <div key={s.key} className={`${s.bg} border ${s.border} rounded-xl p-2.5 text-center`}>
                        <div className={`text-lg font-bold ${s.text}`}>{s.num}</div>
                        <div className={`text-[9px] font-bold uppercase tracking-wide ${s.text} opacity-70`}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Filter chips */}
          {allActive.length > 0 && (
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={()=>setFilter(f.key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    filter===f.key
                      ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                      : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  {f.label}
                  {f.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filter===f.key?"bg-white/20 text-white":"bg-slate-100 text-slate-400"}`}>
                      {f.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Task list */}
          {allActive.length === 0 ? (
            <EmptyState onAdd={()=>setModal({task:null})}/>
          ) : (
            <div className="space-y-2.5">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">No tasks match</div>
              ) : filtered.map(t => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onToggle={handleToggle}
                  onEdit={t=>setModal({task:t})}
                  onDelete={handleDelete}
                  onToggleSub={handleToggleSub}
                />
              ))}
            </div>
          )}

          {/* Completed section */}
          {allDone.length > 0 && (
            <div className="mt-8">
              <button
                onClick={()=>setShowDone(!showDone)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-600 mb-3 transition-colors group"
              >
                <div className={`w-5 h-5 rounded-full border-2 border-current flex items-center justify-center transition-transform ${showDone?"rotate-180":""}`}>
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
                </div>
                Completed
                <span className="text-[11px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold">{allDone.length}</span>
              </button>
              {showDone && (
                <div className="space-y-2">
                  {allDone.map(t => (
                    <TaskCard key={t.id} task={t} onToggle={handleToggle} onEdit={t=>setModal({task:t})} onDelete={handleDelete} onToggleSub={handleToggleSub}/>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FAB */}
        <div className="fixed bottom-0 left-0 right-0 sm:left-64 pointer-events-none z-10">
          <div className="max-w-2xl mx-auto px-4 sm:px-8 pb-6 pt-8 flex justify-end pointer-events-auto">
            <button
              onClick={()=>setModal({task:null})}
              className="group flex items-center gap-2.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-violet-300/60 transition-all font-semibold text-sm"
            >
              <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Add task
            </button>
          </div>
        </div>
      </main>

      {modal && (
        <TaskModal
          task={modal.task}
          listId={activeListId}
          onSave={handleSave}
          onClose={()=>setModal(null)}
        />
      )}
    </div>
  );
}
