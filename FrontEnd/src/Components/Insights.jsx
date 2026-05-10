import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNotes } from "../Contexts/NotesContext";
import { useTask } from "../Contexts/TaskContext";
import { useTrash } from "../Contexts/TrashContext";
import { useTheme } from "../Contexts/ThemeContext";
import { motion } from "framer-motion";

export default function Insights() {
  const { notes, folders } = useNotes();
  const { tasks }          = useTask();
  const { trash }          = useTrash();
  const { theme }          = useTheme();
  const isDark = theme === "dark";

  const [quote,   setQuote]   = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchQuote = async () => {
    try {
      setLoading(true); setQuote(null);
      const res = await axios.get("https://dummyjson.com/quotes/random");
      setQuote({ q: res.data.quote, a: res.data.author });
    } catch { setQuote("error"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchQuote(); }, []);

  const totalNotes    = notes.length;
  const totalFolders  = folders.length;
  const totalTasks    = tasks.length;
  const deletedItems  = trash.length;
  const pendingTasks  = tasks.filter(t => !t.completed).length;
  const doneTasks     = tasks.filter(t => t.completed).length;
  const completionPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const highTasks     = tasks.filter(t => t.priority === "high").length;
  const mediumTasks   = tasks.filter(t => t.priority === "medium").length;
  const lowTasks      = tasks.filter(t => t.priority === "low").length;
  const today         = new Date().toISOString().split("T")[0];
  const overdueTasks  = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today).length;
  const pinnedNotes   = notes.filter(n => n.pinned).length;

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const base = isDark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900";
  const card = isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200";

  const statCards = [
    { title: "Notes",   value: totalNotes,   color: "text-blue-500",    icon: "📝" },
    { title: "Folders", value: totalFolders, color: "text-purple-500",  icon: "📁" },
    { title: "Tasks",   value: totalTasks,   color: "text-emerald-500", icon: "✅" },
    { title: "Trash",   value: deletedItems, color: "text-red-500",     icon: "🗑" },
  ];

  return (
    <div className={`min-h-screen px-4 sm:px-6 py-6 ${base}`}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Insights</h1>
          <p className={`text-sm mt-0.5 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            {greeting} · {todayStr}
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}
              className={`${card} rounded-lg p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>{s.title}</span>
                <span className="text-base">{s.icon}</span>
              </div>
              <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">

          {/* Task progress */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
            className={`${card} rounded-lg p-4`}
          >
            <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Task Progress
            </p>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-semibold text-blue-500">{completionPct}%</span>
              <span className={`text-xs mb-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>complete</span>
            </div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden mb-2 ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-blue-500"
              />
            </div>
            <p className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>{doneTasks} done · {pendingTasks} pending</p>
          </motion.div>

          {/* Priority breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}
            className={`${card} rounded-lg p-4`}
          >
            <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Priority Breakdown
            </p>
            {[
              { label: "High",   count: highTasks,   color: "bg-red-500",     text: "text-red-500"     },
              { label: "Medium", count: mediumTasks, color: "bg-amber-400",   text: "text-amber-500"   },
              { label: "Low",    count: lowTasks,    color: "bg-emerald-500", text: "text-emerald-500" },
            ].map(({ label, count, color, text }) => (
              <div key={label} className="mb-2.5 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className={`font-medium ${text}`}>{label}</span>
                  <span className={isDark ? "text-gray-600" : "text-gray-400"}>{count}</span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: totalTasks ? `${(count / totalTasks) * 100}%` : "0%" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className={`h-full rounded-full ${color}`}
                  />
                </div>
              </div>
            ))}
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            className={`${card} rounded-lg p-4`}
          >
            <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Quick Stats
            </p>
            <div className="space-y-2.5">
              {[
                { label: "Pending tasks",    value: pendingTasks,  color: "text-blue-500"    },
                { label: "Overdue",          value: overdueTasks,  color: overdueTasks > 0 ? "text-red-500" : "text-emerald-500" },
                { label: "Pinned notes",     value: pinnedNotes,   color: "text-amber-500"   },
                { label: "Completed tasks",  value: doneTasks,     color: "text-emerald-500" },
                { label: "Notes per folder", value: totalFolders ? (totalNotes / totalFolders).toFixed(1) : "—", color: "text-purple-500" },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{s.label}</span>
                  <span className={`font-semibold text-sm ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Folder breakdown */}
        {folders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.25 } }}
            className={`${card} rounded-lg p-4 mb-4`}
          >
            <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Notes by Folder
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {folders.map(f => {
                const count = notes.filter(n => n.folder === f).length;
                const pct   = totalNotes ? Math.round((count / totalNotes) * 100) : 0;
                return (
                  <div key={f} className={`p-3 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                    <p className={`text-xs font-medium truncate mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{f}</p>
                    <p className="text-xl font-semibold text-blue-500">{count}</p>
                    <p className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>{pct}%</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Quote card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
          className={`${card} rounded-lg p-6`}
        >
          <div className="flex items-center justify-between mb-4">
            <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Daily Quote
            </p>
            <button
              onClick={fetchQuote}
              disabled={loading}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors"
            >
              {loading ? "Loading..." : "New quote"}
            </button>
          </div>

          {loading && (
            <div className="flex gap-1.5 py-4">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.6 }}
                  className="w-1.5 h-1.5 rounded-full bg-blue-400"
                />
              ))}
            </div>
          )}

          {quote === "error" && (
            <p className="text-sm text-red-500">Failed to load quote. Try again.</p>
          )}

          {quote && quote !== "error" && !loading && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <p className={`text-base leading-relaxed mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                "{quote.q}"
              </p>
              <p className={`text-sm ${isDark ? "text-gray-600" : "text-gray-400"}`}>— {quote.a}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}