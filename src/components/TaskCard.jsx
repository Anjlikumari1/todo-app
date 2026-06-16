import { useState } from "react";
import Checkbox from "./Checkbox";

const PRIORITY = {
  normal:    { label: "Normal",    bg: "bg-slate-100",   text: "text-slate-500",  border: "border-l-slate-300",  badge: "bg-slate-100 text-slate-500 border border-slate-200",   dot: "bg-slate-400",   ring: "ring-slate-200" },
  medium:    { label: "Medium",    bg: "bg-sky-50",      text: "text-sky-600",    border: "border-l-sky-400",    badge: "bg-sky-50 text-sky-600 border border-sky-200",           dot: "bg-sky-400",     ring: "ring-sky-200"   },
  important: { label: "Important", bg: "bg-amber-50",    text: "text-amber-600",  border: "border-l-amber-400",  badge: "bg-amber-50 text-amber-600 border border-amber-200",     dot: "bg-amber-400",   ring: "ring-amber-200" },
  urgent:    { label: "Urgent",    bg: "bg-rose-50",     text: "text-rose-600",   border: "border-l-rose-400",   badge: "bg-rose-50 text-rose-600 border border-rose-200",         dot: "bg-rose-400",    ring: "ring-rose-200"  },
};

const formatDate = (d) => {
  if (!d) return null;
  const dt = new Date(d), today = new Date(), tom = new Date();
  tom.setDate(today.getDate()+1);
  if (dt.toDateString()===today.toDateString()) return "Today";
  if (dt.toDateString()===tom.toDateString()) return "Tomorrow";
  return dt.toLocaleDateString("en-US",{month:"short",day:"numeric"});
};

const isOverdue = (d) => d && new Date(d) < new Date(new Date().setHours(0,0,0,0));

export default function TaskCard({ task, onToggle, onEdit, onDelete, onToggleSub }) {
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
                <span className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <span className="block h-full bg-violet-400 rounded-full transition-all" style={{width: pct+"%"}} />
                </span>
              </button>
            )}
          </div>

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