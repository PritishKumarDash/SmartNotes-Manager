import { useTrash } from "../Contexts/TrashContext";
import { useNotes } from "../Contexts/NotesContext";
import { useTask } from "../Contexts/TaskContext";
import { useTheme } from "../Contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

export default function TrashContent() {
  const { trash, deleteForever, setTrash } = useTrash();
  const { setNotes: _setNotes, refreshNotes } = useNotes();
  const { refreshTasks } = useTask();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [confirmClear, setConfirmClear] = useState(false);
  const [restoringId, setRestoringId] = useState(null);

  const restore = async (item) => {
    setRestoringId(item.id);
    try {
      if (item.type === "note") {
        const { _id, __v, createdAt, updatedAt, user, ...noteData } = item.data;
        await API.post("/api/notes", noteData);
        await refreshNotes();
        toast.success("Note restored!");
      } else if (item.type === "task") {
        const { _id, __v, createdAt, updatedAt, user, deletedAt, ...taskData } = item.data;
        await API.post("/api/tasks", taskData);
        await refreshTasks();
        toast.success("Task restored!");
      }
      setTrash((prev) => prev.filter((t) => t.id !== item.id));
    } catch (error) {
      toast.error("Failed to restore item");
      console.error(error);
    } finally {
      setRestoringId(null);
    }
  };

  const emptyTrash = () => {
    setTrash([]);
    setConfirmClear(false);
    toast.success("Trash emptied");
  };

  const base = isDark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900";
  const card = isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200";

  return (
    <div className={`min-h-screen px-4 sm:px-6 py-6 ${base}`}>
      <div className="max-w-5xl mx-auto">

        <div className="mb-6">
          <h1 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Trash</h1>
          <p className={`text-sm mt-0.5 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            {trash.length === 0
              ? "Trash is empty"
              : `${trash.length} deleted item${trash.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {trash.length > 0 && (
          <div className={`${card} rounded-lg p-4 mb-4 flex flex-wrap items-center justify-between gap-3`}>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Items can be restored or permanently deleted.
            </p>
            <div className="flex gap-2">
              {confirmClear ? (
                <>
                  <button
                    onClick={emptyTrash}
                    className="px-3.5 py-1.5 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    Confirm empty
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className={`px-3.5 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                      isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className={`px-3.5 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                    isDark
                      ? "border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white hover:border-transparent"
                      : "border-red-300 text-red-600 hover:bg-red-600 hover:text-white hover:border-transparent"
                  }`}
                >
                  Empty trash ({trash.length})
                </button>
              )}
            </div>
          </div>
        )}

        {trash.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-3 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
              🗑
            </div>
            <p className={`font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Trash is empty</p>
            <p className={`text-sm mt-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>Deleted notes and tasks appear here</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {trash.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
                exit={{ opacity: 0, scale: 0.97 }}
                className={`${card} rounded-lg p-4 transition-all duration-150 ${
                  isDark ? "hover:border-gray-700" : "hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${
                    item.type === "note"
                      ? isDark ? "bg-purple-500/15 text-purple-400" : "bg-purple-100 text-purple-700"
                      : isDark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {item.type === "note" ? "📝 Note" : "✅ Task"}
                  </span>
                  {item.deletedAt && (
                    <span className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                      {new Date(item.deletedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>

                <h3 className={`font-medium text-sm mb-1.5 leading-snug ${isDark ? "text-gray-100" : "text-gray-800"}`}>
                  {item.data.title || item.data.text}
                </h3>

                {item.data.content && (
                  <p className={`text-xs leading-relaxed mb-3 line-clamp-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    {item.data.content}
                  </p>
                )}

                {item.type === "task" && item.data.priority && (
                  <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded mb-3 ${
                    item.data.priority === "high"
                      ? isDark ? "bg-red-500/15 text-red-400" : "bg-red-100 text-red-600"
                      : item.data.priority === "medium"
                        ? isDark ? "bg-amber-500/15 text-amber-400" : "bg-amber-100 text-amber-600"
                        : isDark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-100 text-emerald-600"
                  }`}>
                    {item.data.priority} priority
                  </span>
                )}

                <div className="flex gap-1.5 mt-3">
                  <button
                    onClick={() => restore(item)}
                    disabled={restoringId === item.id}
                    className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50 ${
                      isDark ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-white" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-500 hover:text-white"
                    }`}
                  >
                    {restoringId === item.id ? "Restoring..." : "Restore"}
                  </button>
                  <button
                    onClick={() => deleteForever(item.id)}
                    className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                      isDark ? "bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white" : "bg-red-100 text-red-600 hover:bg-red-500 hover:text-white"
                    }`}
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}