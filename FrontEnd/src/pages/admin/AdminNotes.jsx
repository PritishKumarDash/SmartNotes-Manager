import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ADMIN_API from "../../api/adminAxios";
import toast from "react-hot-toast";

const COLOR_DOT = { default: "bg-gray-500", yellow: "bg-amber-400", rose: "bg-rose-400", sky: "bg-sky-400", green: "bg-emerald-400", purple: "bg-purple-400" };
const NOTE_BG = { default: "bg-gray-900", yellow: "bg-amber-900/20", rose: "bg-rose-900/20", sky: "bg-sky-900/20", green: "bg-emerald-900/20", purple: "bg-purple-900/20" };

export default function AdminNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [colorFilter, setColorFilter] = useState("all");
  const [view, setView] = useState("grid");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ADMIN_API.get("/api/admin/notes");
        setNotes(res.data);
      } catch (err) {
        toast.error("Failed to load notes");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = notes.filter((n) => {
    const matchSearch = !search.trim() || n.title?.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase()) || n.user?.username?.toLowerCase().includes(search.toLowerCase());
    const matchColor = colorFilter === "all" || n.color === colorFilter;
    return matchSearch && matchColor;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm text-gray-500">Loading notes...</p></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
      <div className="mb-6"><h1 className="text-xl font-semibold text-white">All Notes</h1><p className="text-sm text-gray-500 mt-0.5">{notes.length} notes across all users</p></div>

      <div className="flex flex-wrap gap-2 mb-5">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes, titles, users..." className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all" />
        <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 text-sm outline-none focus:border-blue-500 transition-all">
          <option value="all">All colors</option>
          {Object.keys(COLOR_DOT).map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <div className="flex items-center rounded-lg border border-gray-800 overflow-hidden">
          {[{ id: "grid", icon: "⊞" }, { id: "list", icon: "☰" }].map((v) => (
            <button key={v.id} onClick={() => setView(v.id)} className={`w-9 h-9 flex items-center justify-center text-sm transition-colors ${view === v.id ? "bg-blue-600 text-white" : "bg-gray-900 text-gray-500 hover:text-gray-300"}`}>{v.icon}</button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-600 mb-3">{filtered.length} results</p>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <AnimatePresence>
            {filtered.map((note, i) => (
              <motion.div key={note._id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.02 } }} exit={{ opacity: 0 }} className={`rounded-xl border border-gray-800 hover:border-gray-700 transition-all ${NOTE_BG[note.color] || NOTE_BG.default}`}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2"><div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${COLOR_DOT[note.color] || COLOR_DOT.default}`} /><span className="text-xs text-gray-600 capitalize">{note.color || "default"}</span></div>{note.pinned && <span className="text-xs">📌</span>}</div>
                  <h3 className="font-semibold text-sm text-gray-100 mb-1 leading-snug line-clamp-2">{note.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{note.content}</p>
                  <div className="flex items-center justify-between"><span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-500 rounded font-medium truncate max-w-[100px]">{note.folder}</span><div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold">{note.user?.username?.slice(0, 1).toUpperCase() || "?"}</div><span className="text-xs text-gray-600 max-w-[60px] truncate">{note.user?.username}</span></div></div>
                  <p className="text-[10px] text-gray-700 mt-2">{new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-800"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Content</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Folder</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th></tr></thead>
              <tbody>
                {filtered.map((note, i) => (
                  <tr key={note._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3"><p className="font-medium text-gray-200 truncate max-w-[180px]">{note.title}</p></td>
                    <td className="px-4 py-3 hidden md:table-cell"><p className="text-gray-500 text-xs truncate max-w-[200px]">{note.content}</p></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold">{note.user?.username?.slice(0, 1).toUpperCase() || "?"}</div><span className="text-xs text-gray-400">{note.user?.username}</span></div></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-500 rounded">{note.folder}</span></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><span className="text-xs text-gray-600">{new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-600 text-sm">No notes found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}