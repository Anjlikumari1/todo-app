import { useState, useRef, useEffect } from "react";
import Checkbox from "./Checkbox";

const PRIORITY = {
  normal:    { label: "Normal",    bg: "bg-slate-100",   text: "text-slate-500",  border: "border-l-slate-300",  badge: "bg-slate-100 text-slate-500 border border-slate-200",   dot: "bg-slate-400",   ring: "ring-slate-200" },
  medium:    { label: "Medium",    bg: "bg-sky-50",      text: "text-sky-600",    border: "border-l-sky-400",    badge: "bg-sky-50 text-sky-600 border border-sky-200",           dot: "bg-sky-400",     ring: "ring-sky-200"   },
  important: { label: "Important", bg: "bg-amber-50",    text: "text-amber-600",  border: "border-l-amber-400",  badge: "bg-amber-50 text-amber-600 border border-amber-200",     dot: "bg-amber-400",   ring: "ring-amber-200" },
  urgent:    { label: "Urgent",    bg: "bg-rose-50",     text: "text-rose-600",   border: "border-l-rose-400",   badge: "bg-rose-50 text-rose-600 border border-rose-200",         dot: "bg-rose-400",    ring: "ring-rose-200"  },
};

const genId = () => Math.random().toString(36).slice(2,10);

export default function TaskModal({ task, listId, onSave, onClose }) {
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