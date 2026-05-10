import React, { useMemo, useState } from "react";
import { useNotes } from "../Contexts/NotesContext";
import { useTheme } from "../Contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const NOTE_COLORS_LIGHT = {
  default: "bg-white",
  yellow:  "bg-amber-50",
  rose:    "bg-rose-50",
  sky:     "bg-sky-50",
  green:   "bg-emerald-50",
  purple:  "bg-purple-50",
};
const NOTE_COLORS_DARK = {
  default: "bg-gray-900",
  yellow:  "bg-amber-900/20",
  rose:    "bg-rose-900/20",
  sky:     "bg-sky-900/20",
  green:   "bg-emerald-900/20",
  purple:  "bg-purple-900/20",
};
const COLOR_OPTIONS = [
  { id: "default", bg: "bg-gray-300", darkBg: "bg-gray-600" },
  { id: "yellow",  bg: "bg-amber-400" },
  { id: "rose",    bg: "bg-rose-400"  },
  { id: "sky",     bg: "bg-sky-400"   },
  { id: "green",   bg: "bg-emerald-400" },
  { id: "purple",  bg: "bg-purple-400" },
];

export default function NotesPage() {
  const { theme } = useTheme();
  const { notes, addNote, deleteNote, updateNote, folders, selectedFolder, setSelectedFolder, loading } = useNotes();
  const isDark = theme === "dark";

  const [title,    setTitle]    = useState("");
  const [content,  setContent]  = useState("");
  const [folder,   setFolder]   = useState("");
  const [color,    setColor]    = useState("default");
  const [search,   setSearch]   = useState("");
  const [sort,     setSort]     = useState("newest");
  const [view,     setView]     = useState("grid");
  const [editNote, setEditNote] = useState(null);
  const [creating, setCreating] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setCreating(true);
    await addNote({
      title: title.trim(),
      content: content.trim(),
      folder: folder || folders[0] || "General",
      color,
      pinned: false,
    });
    setTitle(""); setContent(""); setColor("default");
    setCreating(false);
  };

  const handleEditSave = async () => {
    if (!editNote) return;
    await updateNote(editNote._id, {
      title: editNote.title,
      content: editNote.content,
      folder: editNote.folder,
      color: editNote.color || "default",
    });
    setEditNote(null);
  };

  const togglePin = (note) => updateNote(note._id, { pinned: !note.pinned });

  const filtered = useMemo(() => {
    let res = [...notes];
    if (selectedFolder !== "All Notes") res = res.filter(n => n.folder === selectedFolder);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }
    if (sort === "newest") res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "oldest") res.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === "az")     res.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "za")     res.sort((a, b) => b.title.localeCompare(a.title));
    return res;
  }, [notes, selectedFolder, search, sort]);

  const pinned = filtered.filter(n => n.pinned);
  const others = filtered.filter(n => !n.pinned);

  const noteColor = (c) => isDark
    ? NOTE_COLORS_DARK[c] || NOTE_COLORS_DARK.default
    : NOTE_COLORS_LIGHT[c] || NOTE_COLORS_LIGHT.default;

  const base = isDark
    ? "bg-gray-950 text-gray-100"
    : "bg-gray-50 text-gray-900";

  const card = isDark
    ? "bg-gray-900 border border-gray-800"
    : "bg-white border border-gray-200";

  const input = `w-full px-3 py-2 rounded-md text-sm outline-none transition-colors border ${
    isDark
      ? "bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-blue-500"
      : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
  } focus:ring-2 focus:ring-blue-500/20`;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${base}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen px-4 sm:px-6 py-6 ${base}`}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Notes</h1>
          <p className={`text-sm mt-0.5 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            {notes.length} notes · {folders.length} folders
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">

          {/* Sidebar */}
          <div className="lg:sticky lg:top-20">
            <div className={`${card} rounded-lg overflow-hidden`}>
              <div className={`px-3 py-2 border-b text-xs font-medium uppercase tracking-wider ${
                isDark ? "border-gray-800 text-gray-500" : "border-gray-100 text-gray-400"
              }`}>
                Folders
              </div>
              <div className="p-1.5">
                {["All Notes", ...folders].map(f => {
                  const count = f === "All Notes" ? notes.length : notes.filter(n => n.folder === f).length;
                  const active = selectedFolder === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setSelectedFolder(f)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-colors font-medium ${
                        active
                          ? isDark ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
                          : isDark
                            ? "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span className="truncate">{f}</span>
                      <span className={`text-xs ml-2 px-1.5 py-0.5 rounded font-medium ${
                        active
                          ? "bg-white/20 text-white"
                          : isDark ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-500"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="min-w-0">

            {/* Create note */}
            <div className={`${card} rounded-lg p-4 mb-4`}>
              <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                New Note
              </p>
              <input
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={`${input} mb-2 font-medium`}
              />
              <textarea
                placeholder="Write your note..."
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={3}
                className={`${input} mb-3 resize-none`}
              />
              <div className="flex flex-wrap items-center gap-3">
                {/* Color picker */}
                <div className="flex items-center gap-1.5">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setColor(c.id)}
                      title={c.id}
                      className={`w-4 h-4 rounded-full transition-all ${c.bg} ${
                        color === c.id
                          ? "ring-2 ring-offset-1 ring-blue-500 ring-offset-transparent scale-110"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>

                {folders.length > 0 && (
                  <select
                    value={folder || folders[0] || ""}
                    onChange={e => setFolder(e.target.value)}
                    className={`text-sm px-2.5 py-1.5 rounded-md border outline-none transition-colors ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-gray-300 focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-700 focus:border-blue-500"
                    }`}
                  >
                    {folders.map(f => <option key={f}>{f}</option>)}
                  </select>
                )}

                <button
                  onClick={handleSave}
                  disabled={!title.trim() || !content.trim() || creating}
                  className="ml-auto px-4 py-1.5 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
                >
                  {creating ? "Adding..." : "+ Add Note"}
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <input
                placeholder="Search notes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`${input} flex-1 min-w-[160px] max-w-xs`}
              />
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className={`text-sm px-2.5 py-2 rounded-md border outline-none transition-colors ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-gray-300"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
              </select>
              <div className={`flex items-center rounded-md border overflow-hidden ${
                isDark ? "border-gray-700" : "border-gray-300"
              }`}>
                {[{ id: "grid", icon: "⊞" }, { id: "list", icon: "☰" }].map(v => (
                  <button
                    key={v.id}
                    onClick={() => setView(v.id)}
                    className={`w-8 h-8 flex items-center justify-center text-sm transition-colors ${
                      view === v.id
                        ? "bg-blue-600 text-white"
                        : isDark ? "bg-gray-800 text-gray-400 hover:text-gray-200" : "bg-white text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {v.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Pinned */}
            {pinned.length > 0 && (
              <div className="mb-5">
                <p className={`text-xs font-medium uppercase tracking-wider mb-2.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  Pinned
                </p>
                <NoteGrid notes={pinned} view={view} onPin={togglePin} onEdit={setEditNote} onDelete={deleteNote} noteColor={noteColor} isDark={isDark} card={card} />
              </div>
            )}

            {/* All notes */}
            {others.length === 0 && pinned.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-3 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                  📝
                </div>
                <p className={`font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>No notes yet</p>
                <p className={`text-sm mt-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>Add your first note above</p>
              </div>
            ) : others.length > 0 && (
              <div>
                {pinned.length > 0 && (
                  <p className={`text-xs font-medium uppercase tracking-wider mb-2.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    All Notes
                  </p>
                )}
                <NoteGrid notes={others} view={view} onPin={togglePin} onEdit={setEditNote} onDelete={deleteNote} noteColor={noteColor} isDark={isDark} card={card} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editNote && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditNote(null)}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.97, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97 }}
              onClick={e => e.stopPropagation()}
              className={`w-full max-w-lg rounded-xl shadow-xl border p-6 ${
                isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Edit Note</h3>
                <button
                  onClick={() => setEditNote(null)}
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-sm transition-colors ${
                    isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  ✕
                </button>
              </div>
              <input
                value={editNote.title}
                onChange={e => setEditNote({ ...editNote, title: e.target.value })}
                className={`${input} mb-2.5 font-medium`}
                placeholder="Title"
              />
              <textarea
                value={editNote.content}
                onChange={e => setEditNote({ ...editNote, content: e.target.value })}
                rows={6}
                className={`${input} mb-3 resize-none`}
                placeholder="Content"
              />
              <div className="flex items-center gap-1.5 mb-4">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setEditNote({ ...editNote, color: c.id })}
                    className={`w-4 h-4 rounded-full transition-all ${c.bg} ${
                      (editNote.color || "default") === c.id
                        ? "ring-2 ring-offset-1 ring-blue-500 scale-110"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditNote(null)}
                  className={`px-3.5 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                    isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="px-3.5 py-1.5 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NoteGrid({ notes, view, onPin, onEdit, onDelete, noteColor, isDark, card }) {
  return (
    <div className={
      view === "grid"
        ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
        : "flex flex-col gap-2"
    }>
      <AnimatePresence>
        {notes.map((n, i) => (
          <motion.div
            key={n._id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
            exit={{ opacity: 0, scale: 0.97 }}
            className={`rounded-lg border transition-all duration-150 group ${noteColor(n.color || "default")} ${
              isDark ? "border-gray-800 hover:border-gray-700" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
            } ${n.pinned ? `ring-1 ring-blue-500/50` : ""}`}
          >
            {view === "grid" ? (
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`font-medium text-sm leading-snug flex-1 truncate ${isDark ? "text-gray-100" : "text-gray-900"}`}>
                    {n.title}
                  </h3>
                  <button
                    onClick={() => onPin(n)}
                    className="ml-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    title={n.pinned ? "Unpin" : "Pin"}
                  >
                    {n.pinned ? "📌" : "📍"}
                  </button>
                </div>
                <p className={`text-xs leading-relaxed mb-3 line-clamp-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {n.content}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    isDark ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-500"
                  }`}>
                    {n.folder}
                  </span>
                  <span className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                    {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onEdit(n)}
                    className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                      isDark
                        ? "bg-gray-800 text-gray-300 hover:bg-blue-600 hover:text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-blue-600 hover:text-white"
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(n._id)}
                    className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                      isDark
                        ? "bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-red-600 hover:text-white"
                    }`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-2.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  n.color === "yellow" ? "bg-amber-400"
                  : n.color === "rose" ? "bg-rose-400"
                  : n.color === "sky" ? "bg-sky-400"
                  : n.color === "green" ? "bg-emerald-400"
                  : n.color === "purple" ? "bg-purple-400"
                  : isDark ? "bg-gray-600" : "bg-gray-300"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isDark ? "text-gray-100" : "text-gray-900"}`}>{n.title}</p>
                  <p className={`text-xs truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}>{n.content}</p>
                </div>
                <span className={`text-xs shrink-0 px-2 py-0.5 rounded ${isDark ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-400"}`}>
                  {n.folder}
                </span>
                <span className={`text-xs shrink-0 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                  {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => onPin(n)} className="text-sm opacity-40 hover:opacity-100 transition-opacity">
                    {n.pinned ? "📌" : "📍"}
                  </button>
                  <button
                    onClick={() => onEdit(n)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      isDark ? "bg-gray-800 text-gray-400 hover:bg-blue-600 hover:text-white" : "bg-gray-100 text-gray-600 hover:bg-blue-600 hover:text-white"
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(n._id)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      isDark ? "bg-gray-800 text-gray-400 hover:bg-red-600 hover:text-white" : "bg-gray-100 text-gray-600 hover:bg-red-600 hover:text-white"
                    }`}
                  >
                    Del
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}