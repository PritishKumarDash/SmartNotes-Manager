import React, { useState } from "react";
import { useNotes } from "../Contexts/NotesContext";
import { useTheme } from "../Contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const FOLDER_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
];

export default function FolderPage() {
  const [newFolder, setNewFolder] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [creating, setCreating] = useState(false);
  const { folders, addFolder, deleteFolder, notes } = useNotes();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleAdd = async () => {
    const trimmed = newFolder.trim();
    if (!trimmed) return;
    setCreating(true);
    await addFolder(trimmed);
    setNewFolder("");
    setCreating(false);
  };

  const totalNotes = notes.length;

  const base = isDark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900";
  const card = isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200";
  const input = `w-full px-3 py-2 rounded-md text-sm outline-none transition-colors border ${
    isDark
      ? "bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-blue-500"
      : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
  } focus:ring-2 focus:ring-blue-500/20`;

  return (
    <div className={`min-h-screen px-4 sm:px-6 py-6 ${base}`}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Folders</h1>
          <p className={`text-sm mt-0.5 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            {folders.length} folders · {totalNotes} notes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Folders", value: folders.length,    color: "text-blue-500"    },
            { label: "Notes",   value: totalNotes,         color: "text-emerald-500" },
            { label: "Avg",     value: folders.length ? (totalNotes / folders.length).toFixed(1) : "—", color: "text-amber-500" },
          ].map(s => (
            <div key={s.label} className={`${card} rounded-lg p-4`}>
              <p className={`text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>{s.label}</p>
              <p className={`text-2xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Create folder */}
        <div className={`${card} rounded-lg p-4 mb-5`}>
          <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            New Folder
          </p>
          <div className="flex gap-2">
            <input
              value={newFolder}
              onChange={e => setNewFolder(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              placeholder="Folder name..."
              maxLength={40}
              className={input}
            />
            <button
              onClick={handleAdd}
              disabled={!newFolder.trim() || creating}
              className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors whitespace-nowrap"
            >
              {creating ? "Creating..." : "+ Create"}
            </button>
          </div>
        </div>

        {/* Empty state */}
        {folders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-3 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
              📁
            </div>
            <p className={`font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>No folders yet</p>
            <p className={`text-sm mt-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>Create your first folder above</p>
          </div>
        )}

        {/* Folder grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <AnimatePresence>
            {folders.map((folder, idx) => {
              const count    = notes.filter(n => n.folder === folder).length;
              const colorCls = FOLDER_COLORS[idx % FOLDER_COLORS.length];

              return (
                <motion.div
                  key={folder}
                  layout
                  initial={{ opacity: 0, scale: 0.97, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`${card} rounded-lg overflow-hidden transition-all duration-150 ${
                    isDark ? "hover:border-gray-700" : "hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  {/* Color strip */}
                  <div className={`h-1 w-full ${colorCls}`} />

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-lg ${colorCls} flex items-center justify-center text-white text-base`}>
                        📁
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        isDark ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-500"
                      }`}>
                        {count} {count === 1 ? "note" : "notes"}
                      </span>
                    </div>

                    <h3 className={`font-medium text-sm truncate mb-4 ${isDark ? "text-gray-100" : "text-gray-900"}`} title={folder}>
                      {folder}
                    </h3>

                    {confirmDelete === folder ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => { deleteFolder(folder); setConfirmDelete(null); }}
                          className="flex-1 py-1.5 rounded text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                            isDark ? "bg-gray-800 text-gray-400 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(folder)}
                        className={`w-full py-1.5 rounded text-xs font-medium transition-colors ${
                          isDark
                            ? "bg-gray-800 text-gray-500 hover:bg-red-500/15 hover:text-red-400"
                            : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        }`}
                      >
                        Delete folder
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}