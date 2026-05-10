import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ADMIN_API from "../../api/adminAxios";

function StatCard({ title, value, sub, icon, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value ?? "—"}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </motion.div>
  );
}

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-400 font-medium">{label}</span>
        <span className="text-gray-500">{value} ({pct}%)</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function WeekChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-xs text-gray-600 text-center py-4">No new user data this week</p>;
  }
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => {
        const h = Math.max((d.count / max) * 100, 4);
        const label = d._id?.slice(5);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-600">{d.count}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="w-full rounded-t bg-blue-500 min-h-[3px]"
              style={{ height: `${h}%` }}
            />
            <span className="text-[9px] text-gray-600">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ADMIN_API.get("/api/admin/stats");
        setStats(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">{today}</p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="text-blue-400" sub={`${stats.verifiedUsers} verified`} delay={0} />
        <StatCard title="Total Notes" value={stats.totalNotes} icon="📝" color="text-purple-400" sub={`+${stats.newNotesThisWeek} this week`} delay={0.05} />
        <StatCard title="Total Tasks" value={stats.totalTasks} icon="✅" color="text-emerald-400" sub={`${stats.taskCompletionRate}% done`} delay={0.1} />
        <StatCard title="Total Folders" value={stats.totalFolders} icon="📁" color="text-amber-400" sub="across all users" delay={0.15} />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard title="New Users" value={stats.newUsersThisWeek} icon="🆕" color="text-sky-400" sub="this week" delay={0.2} />
        <StatCard title="Completed Tasks" value={stats.completedTasks} icon="🎯" color="text-emerald-400" sub={`${stats.pendingTasks} pending`} delay={0.22} />
        <StatCard title="Overdue Tasks" value={stats.overdueTasks} icon="⚠️" color={stats.overdueTasks > 0 ? "text-red-400" : "text-emerald-400"} sub="past due date" delay={0.24} />
        <StatCard title="Unverified" value={stats.unverifiedUsers} icon="📧" color="text-orange-400" sub="email not verified" delay={0.26} />
      </div>

      {/* Middle section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="bg-gray-900 border border-gray-800 rounded-xl p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">User Registrations</p>
              <p className="text-sm text-gray-300 font-medium mt-0.5">Last 7 days</p>
            </div>
            <span className="text-xs px-2 py-1 bg-blue-500/15 text-blue-400 rounded-md font-medium">+{stats.newUsersThisWeek} total</span>
          </div>
          <WeekChart data={stats.userGrowth} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Task Priorities</p>
          <MiniBar label="High" value={stats.priorityBreakdown.high} max={stats.totalTasks} color="bg-red-500" />
          <MiniBar label="Medium" value={stats.priorityBreakdown.medium} max={stats.totalTasks} color="bg-amber-400" />
          <MiniBar label="Low" value={stats.priorityBreakdown.low} max={stats.totalTasks} color="bg-emerald-500" />
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Task Completion</p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-bold text-blue-400">{stats.taskCompletionRate}%</span>
            <span className="text-xs text-gray-600 mb-1">completion rate</span>
          </div>
          <div className="h-2 rounded-full bg-gray-800 overflow-hidden mb-3">
            <motion.div initial={{ width: 0 }} animate={{ width: `${stats.taskCompletionRate}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full rounded-full bg-blue-500" />
          </div>
          <div className="flex gap-4 text-xs">
            <div><span className="text-emerald-400 font-semibold">{stats.completedTasks}</span><span className="text-gray-600 ml-1">done</span></div>
            <div><span className="text-amber-400 font-semibold">{stats.pendingTasks}</span><span className="text-gray-600 ml-1">pending</span></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Note Colors</p>
          <div className="space-y-2">
            {(stats.noteColors || []).slice(0, 5).map((nc) => {
              const colorMap = { default: "bg-gray-500", yellow: "bg-amber-400", rose: "bg-rose-400", sky: "bg-sky-400", green: "bg-emerald-400", purple: "bg-purple-400" };
              return (
                <div key={nc._id} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${colorMap[nc._id] || "bg-gray-500"}`} />
                  <span className="text-xs text-gray-400 flex-1 capitalize">{nc._id || "default"}</span>
                  <span className="text-xs font-medium text-gray-500">{nc.count}</span>
                </div>
              );
            })}
            {(!stats.noteColors || stats.noteColors.length === 0) && <p className="text-xs text-gray-600">No notes yet</p>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</p>
          <div className="space-y-2">
            {[
              { label: "Manage Users", to: "/admin/users", icon: "👥", color: "hover:bg-blue-600/15 hover:text-blue-400" },
              { label: "Browse Notes", to: "/admin/notes", icon: "📝", color: "hover:bg-purple-600/15 hover:text-purple-400" },
              { label: "Browse Tasks", to: "/admin/tasks", icon: "✅", color: "hover:bg-emerald-600/15 hover:text-emerald-400" },
            ].map((action) => (
              <button
                key={action.to}
                onClick={() => navigate(action.to)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 border border-gray-800 transition-all duration-150 ${action.color}`}
              >
                <span>{action.icon}</span> {action.label} <span className="ml-auto text-xs opacity-50">→</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}