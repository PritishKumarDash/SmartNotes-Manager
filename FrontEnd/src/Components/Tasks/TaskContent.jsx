import React, { useMemo, useState } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { useTask } from "../../Contexts/TaskContext";
import { motion, AnimatePresence } from "framer-motion";

const PRIORITY_CONFIG = {
  high:   { label: "High",   dot: "bg-red-500",    badge: "bg-red-100 text-red-700",    darkBadge: "bg-red-500/15 text-red-400" },
  medium: { label: "Medium", dot: "bg-amber-400",  badge: "bg-amber-100 text-amber-700",darkBadge: "bg-amber-500/15 text-amber-400" },
  low:    { label: "Low",    dot: "bg-emerald-500",badge: "bg-emerald-100 text-emerald-700",darkBadge: "bg-emerald-500/15 text-emerald-400" },
};

export default function TaskContent() {
  const { theme } = useTheme();
  const { tasks, addTask, deleteTask, updateTask, toggleComplete, clearCompleted } = useTask();
  const isDark = theme === "dark";

  const [taskText, setTaskText] = useState("");
  const [dueDate,  setDueDate]  = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter,   setFilter]   = useState("all");
  const [editId,   setEditId]   = useState(null);
  const [editText, setEditText] = useState("");
  const [adding,   setAdding]   = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const togglePin = (id) => {
    const task = tasks.find(t => t._id === id);
    updateTask(id, { pinned: !task?.pinned });
  };

  const startEdit = (task) => { setEditId(task._id); setEditText(task.text); };
  const saveEdit  = (id) => { updateTask(id, { text: editText }); setEditId(null); };

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    if (filter === "active")    result = result.filter(t => !t.completed);
    if (filter === "completed") result = result.filter(t => t.completed);
    result.sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned - a.pinned;
      const po = { high: 3, medium: 2, low: 1 };
      if (po[a.priority] !== po[b.priority]) return po[b.priority] - po[a.priority];
      if (a.completed !== b.completed) return a.completed - b.completed;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return result;
  }, [tasks, filter]);

  const add = async (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;
    setAdding(true);
    await addTask({ text: taskText.trim(), dueDate, priority });
    setTaskText(""); setDueDate(""); setPriority("medium");
    setAdding(false);
  };

  const completed = tasks.filter(t => t.completed).length;
  const total     = tasks.length;
  const pct       = total ? Math.round((completed / total) * 100) : 0;
  const overdue   = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today).length;

  const base  = isDark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900";
  const card  = isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200";
  const input = `px-3 py-2 rounded-md text-sm outline-none transition-colors border ${
    isDark
      ? "bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-blue-500"
      : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
  } focus:ring-2 focus:ring-blue-500/20`;

  return (
    <div className={`min-h-screen px-4 sm:px-6 py-6 ${base}`}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Tasks</h1>
          <p className={`text-sm mt-0.5 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            {completed}/{total} completed
            {overdue > 0 && <span className="ml-2 text-red-500">· {overdue} overdue</span>}
          </p>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className={`${card} rounded-lg p-4 mb-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>Progress</span>
              <span className="text-xs font-semibold text-blue-500">{pct}%</span>
            </div>
            <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full bg-blue-500"
              />
            </div>
          </div>
        )}

        {/* Add task */}
        <form onSubmit={add} className={`${card} rounded-lg p-4 mb-4`}>
          <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            New Task
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              value={taskText}
              onChange={e => setTaskText(e.target.value)}
              placeholder="What needs to be done?"
              className={`${input} flex-1 min-w-[200px]`}
            />
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className={`${input} flex-none`}
            />
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className={`${input} flex-none`}
            >
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
            <button
              type="submit"
              disabled={!taskText.trim() || adding}
              className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              {adding ? "Adding..." : "+ Add"}
            </button>
          </div>
        </form>

        {/* Filters + clear */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className={`flex items-center rounded-md border overflow-hidden ${isDark ? "border-gray-700" : "border-gray-300"}`}>
            {["all", "active", "completed"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : isDark
                      ? "bg-gray-800 text-gray-400 hover:text-gray-200"
                      : "bg-white text-gray-600 hover:text-gray-900"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {completed > 0 && (
            <button
              onClick={clearCompleted}
              className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                isDark
                  ? "border-gray-700 text-gray-500 hover:bg-red-600/15 hover:text-red-400 hover:border-red-500/30"
                  : "border-gray-300 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
              }`}
            >
              Clear {completed} completed
            </button>
          )}
        </div>

        {/* Task list */}
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-3 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
              ✅
            </div>
            <p className={`font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {filter === "completed" ? "No completed tasks" : filter === "active" ? "No active tasks" : "No tasks yet"}
            </p>
            <p className={`text-sm mt-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>Add your first task above</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {filteredTasks.map((task, i) => {
                const isOverdue = !task.completed && task.dueDate && task.dueDate < today;
                const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

                return (
                  <motion.div
                    key={task._id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className={`rounded-lg border transition-all duration-150 ${card} ${
                      isDark ? "hover:border-gray-700" : "hover:border-gray-300 hover:shadow-sm"
                    } ${task.pinned ? "ring-1 ring-blue-500/50" : ""}
                    ${task.completed ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleComplete(task._id)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          task.completed
                            ? "bg-emerald-500 border-emerald-500"
                            : isDark ? "border-gray-600 hover:border-blue-400" : "border-gray-400 hover:border-blue-500"
                        }`}
                      >
                        {task.completed && <span className="text-white text-[8px] font-bold">✓</span>}
                      </button>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        {editId === task._id ? (
                          <input
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && saveEdit(task._id)}
                            className={`w-full text-sm px-2 py-0.5 rounded border outline-none ${
                              isDark ? "bg-gray-800 border-gray-600 text-gray-100" : "bg-gray-100 border-gray-300 text-gray-900"
                            }`}
                            autoFocus
                          />
                        ) : (
                          <p className={`text-sm font-medium truncate ${
                            task.completed
                              ? `line-through ${isDark ? "text-gray-600" : "text-gray-400"}`
                              : isDark ? "text-gray-100" : "text-gray-900"
                          }`}>
                            {task.pinned && <span className="mr-1.5 text-xs">📌</span>}
                            {task.text}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded ${
                            isDark ? p.darkBadge : p.badge
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                            {p.label}
                          </span>
                          {task.dueDate && (
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                              isOverdue
                                ? isDark ? "bg-red-500/15 text-red-400" : "bg-red-100 text-red-600"
                                : isDark ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-400"
                            }`}>
                              {isOverdue ? "⚠️ " : ""}{task.dueDate}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {editId === task._id ? (
                          <>
                            <button
                              onClick={() => saveEdit(task._id)}
                              className="px-2.5 py-1 rounded text-xs font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                isDark ? "bg-gray-800 text-gray-400 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => togglePin(task._id)}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                isDark ? "bg-gray-800 text-gray-500 hover:bg-amber-500/15 hover:text-amber-400" : "bg-gray-100 text-gray-500 hover:bg-amber-100 hover:text-amber-600"
                              }`}
                            >
                              {task.pinned ? "Unpin" : "Pin"}
                            </button>
                            <button
                              onClick={() => startEdit(task)}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                isDark ? "bg-gray-800 text-gray-400 hover:bg-blue-600 hover:text-white" : "bg-gray-100 text-gray-600 hover:bg-blue-600 hover:text-white"
                              }`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteTask(task._id)}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                isDark ? "bg-gray-800 text-gray-400 hover:bg-red-600 hover:text-white" : "bg-gray-100 text-gray-600 hover:bg-red-600 hover:text-white"
                              }`}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}