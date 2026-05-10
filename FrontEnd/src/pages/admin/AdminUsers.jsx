import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ADMIN_API from "../../api/adminAxios";
import toast from "react-hot-toast";

function Avatar({ name }) {
  return (
    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
      {name?.slice(0, 2).toUpperCase() || "??"}
    </div>
  );
}

function Badge({ children, color }) {
  const colors = {
    green: "bg-emerald-500/15 text-emerald-400",
    red:   "bg-red-500/15 text-red-400",
    blue:  "bg-blue-500/15 text-blue-400",
    gray:  "bg-gray-800 text-gray-500",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
}

export default function AdminUsers() {
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [sortBy, setSortBy]             = useState("createdAt");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]         = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail]     = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await ADMIN_API.get("/api/admin/users");
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeleting(id);
      await ADMIN_API.delete(`/api/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted successfully");
      setConfirmDelete(null);
      if (selectedUser?._id === id) {
        setSelectedUser(null);
        setUserDetail(null);
      }
    } catch (err) {
      toast.error("Failed to delete user");
    } finally {
      setDeleting(null);
    }
  };

  const openDetail = async (user) => {
    setSelectedUser(user);
    setUserDetail(null);
    setDetailLoading(true);
    try {
      const res = await ADMIN_API.get(`/api/admin/users/${user._id}`);
      setUserDetail(res.data);
    } catch (err) {
      toast.error("Failed to load user details");
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = users
    .filter((u) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "notes")      return b.noteCount - a.noteCount;
      if (sortBy === "tasks")      return b.taskCount - a.taskCount;
      if (sortBy === "completion") return b.taskCompletionRate - a.taskCompletionRate;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {users.length} total · {users.filter((u) => u.isEmailVerified).length} verified
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 text-sm outline-none focus:border-blue-500 transition-all"
        >
          <option value="createdAt">Newest first</option>
          <option value="notes">Most notes</option>
          <option value="tasks">Most tasks</option>
          <option value="completion">Completion rate</option>
        </select>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tasks</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Done%</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((user, i) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.02 }}
                        onClick={() => openDetail(user)}
                        className={`border-b border-gray-800/50 cursor-pointer transition-colors ${
                          selectedUser?._id === user._id ? "bg-blue-600/10" : "hover:bg-gray-800/40"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.username} />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-200 truncate">{user.username}</p>
                              <p className="text-xs text-gray-600 truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <Badge color={user.isEmailVerified ? "green" : "red"}>
                            {user.isEmailVerified ? "Verified" : "Unverified"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold text-purple-400">{user.noteCount}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold text-emerald-400">{user.taskCount}</span>
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell">
                          <span className={`font-semibold text-sm ${
                            user.taskCompletionRate >= 70 ? "text-emerald-400"
                            : user.taskCompletionRate >= 40 ? "text-amber-400"
                            : "text-gray-500"
                          }`}>
                            {user.taskCount > 0 ? `${user.taskCompletionRate}%` : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-xs text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {confirmDelete === user._id ? (
                            <div
                              className="flex items-center gap-1 justify-end"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleDelete(user._id)}
                                disabled={deleting === user._id}
                                className="px-2 py-1 rounded text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                              >
                                {deleting === user._id ? "..." : "Confirm"}
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-2 py-1 rounded text-xs font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDelete(user._id); }}
                              className="px-2 py-1 rounded text-xs font-medium text-gray-600 hover:bg-red-600/15 hover:text-red-400 border border-gray-800 hover:border-red-500/30 transition-all"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-600 text-sm">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selectedUser && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-72 shrink-0 hidden xl:block"
            >
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden sticky top-4">
                <div className="p-4 border-b border-gray-800 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={selectedUser.username} />
                    <div>
                      <p className="font-semibold text-white text-sm">{selectedUser.username}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[140px]">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedUser(null); setUserDetail(null); }}
                    className="text-gray-600 hover:text-gray-400 text-sm w-6 h-6 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>

                {detailLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : userDetail && (
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { label: "Notes",   value: selectedUser.noteCount,        color: "text-purple-400"  },
                        { label: "Tasks",   value: selectedUser.taskCount,        color: "text-emerald-400" },
                        { label: "Folders", value: selectedUser.folderCount,      color: "text-amber-400"   },
                        { label: "Done%",   value: selectedUser.taskCount > 0 ? `${selectedUser.taskCompletionRate}%` : "—", color: "text-blue-400" },
                      ].map((s) => (
                        <div key={s.label} className="bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-600">{s.label}</p>
                          <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Status</p>
                      <Badge color={selectedUser.isEmailVerified ? "green" : "red"}>
                        {selectedUser.isEmailVerified ? "✓ Email Verified" : "✗ Not Verified"}
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Joined</p>
                      <p className="text-xs text-gray-400">
                        {new Date(selectedUser.createdAt).toLocaleDateString("en-US", {
                          weekday: "short", year: "numeric", month: "long", day: "numeric",
                        })}
                      </p>
                    </div>

                    {userDetail.notes?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                          Recent Notes
                        </p>
                        <div className="space-y-1.5">
                          {userDetail.notes.slice(0, 3).map((n) => (
                            <div key={n._id} className="bg-gray-800 rounded-lg px-3 py-2">
                              <p className="text-xs font-medium text-gray-300 truncate">{n.title}</p>
                              <p className="text-xs text-gray-600 truncate">{n.folder}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {userDetail.tasks?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                          Recent Tasks
                        </p>
                        <div className="space-y-1.5">
                          {userDetail.tasks.slice(0, 3).map((t) => (
                            <div key={t._id} className="bg-gray-800 rounded-lg px-3 py-2 flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                t.completed ? "bg-emerald-500" : "bg-gray-600"
                              }`} />
                              <p className={`text-xs truncate ${
                                t.completed ? "line-through text-gray-600" : "text-gray-300"
                              }`}>
                                {t.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}