import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ADMIN_API from "../../api/adminAxios";
import toast from "react-hot-toast";

const PRIORITY_CONFIG = { high: { dot: "bg-red-500", badge: "bg-red-500/15 text-red-400" }, medium: { dot: "bg-amber-400", badge: "bg-amber-500/15 text-amber-400" }, low: { dot: "bg-emerald-500", badge: "bg-emerald-500/15 text-emerald-400" } };

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ADMIN_API.get("/api/admin/tasks");
        setTasks(res.data);
      } catch (err) {
        toast.error("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const filtered = tasks
    .filter((t) => {
      const matchSearch = !search.trim() || t.text?.toLowerCase().includes(search.toLowerCase()) || t.user?.username?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filter === "all" || (filter === "completed" && t.completed) || (filter === "active" && !t.completed) || (filter === "overdue" && !t.completed && t.dueDate && t.dueDate < today);
      const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "priority") { const po = { high: 3, medium: 2, low: 1 }; return po[b.priority] - po[a.priority]; }
      return 0;
    });

  const stats = { total: tasks.length, completed: tasks.filter(t => t.completed).length, active: tasks.filter(t => !t.completed).length, overdue: tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today).length, high: tasks.filter(t => t.priority === "high").length };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm text-gray-500">Loading tasks...</p></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
      <div className="mb-6"><h1 className="text-xl font-semibold text-white">All Tasks</h1><p className="text-sm text-gray-500 mt-0.5">{tasks.length} tasks across all users</p></div>

      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { label: "Total", value: stats.total, color: "bg-gray-800 text-gray-300" },
          { label: "Completed", value: stats.completed, color: "bg-emerald-500/15 text-emerald-400" },
          { label: "Active", value: stats.active, color: "bg-blue-500/15 text-blue-400" },
          { label: "Overdue", value: stats.overdue, color: stats.overdue > 0 ? "bg-red-500/15 text-red-400" : "bg-gray-800 text-gray-500" },
          { label: "High Pri", value: stats.high, color: "bg-amber-500/15 text-amber-400" },
        ].map((s) => (<span key={s.label} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${s.color}`}>{s.label}: {s.value}</span>))}
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks or users..." className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all" />
        <div className="flex items-center rounded-lg border border-gray-800 overflow-hidden">
          {[{ id: "all", label: "All" }, { id: "active", label: "Active" }, { id: "completed", label: "Done" }, { id: "overdue", label: "Overdue" }].map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-2 text-xs font-medium transition-colors ${filter === f.id ? "bg-blue-600 text-white" : "bg-gray-900 text-gray-500 hover:text-gray-300"}`}>{f.label}</button>
          ))}
        </div>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 text-sm outline-none focus:border-blue-500 transition-all">
          <option value="all">All priorities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 text-sm outline-none focus:border-blue-500 transition-all">
          <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="priority">By priority</option>
        </select>
      </div>

      <p className="text-xs text-gray-600 mb-3">{filtered.length} results</p>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-8"></th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Task</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((task, i) => {
                  const isOverdue = !task.completed && task.dueDate && task.dueDate < today;
                  const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                  return (
                    <motion.tr key={task._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.015 } }} exit={{ opacity: 0 }} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${task.completed ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3"><div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${task.completed ? "bg-emerald-500 border-emerald-500" : "border-gray-600"}`}>{task.completed && <span className="text-white text-[8px] font-bold">✓</span>}</div></td>
                      <td className="px-4 py-3 max-w-[220px]"><p className={`font-medium text-sm truncate ${task.completed ? "line-through text-gray-600" : "text-gray-200"}`}>{task.pinned && <span className="mr-1 text-xs">📌</span>}{task.text}</p></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold">{task.user?.username?.slice(0, 1).toUpperCase() || "?"}</div><span className="text-xs text-gray-400">{task.user?.username}</span></div></td>
                      <td className="px-4 py-3 hidden sm:table-cell"><span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${p.badge}`}><span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />{task.priority}</span></td>
                      <td className="px-4 py-3 hidden md:table-cell">{task.dueDate ? (<span className={`text-xs font-medium px-2 py-0.5 rounded ${isOverdue ? "bg-red-500/15 text-red-400" : "bg-gray-800 text-gray-500"}`}>{isOverdue ? "⚠️ " : ""}{task.dueDate}</span>) : <span className="text-xs text-gray-700">—</span>}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${task.completed ? "bg-emerald-500/15 text-emerald-400" : isOverdue ? "bg-red-500/15 text-red-400" : "bg-blue-500/15 text-blue-400"}`}>{task.completed ? "Done" : isOverdue ? "Overdue" : "Active"}</span></td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-600 text-sm">No tasks found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}