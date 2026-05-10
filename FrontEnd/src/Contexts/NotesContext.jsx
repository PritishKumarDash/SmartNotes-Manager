import { createContext, useContext, useEffect, useState } from "react";
import { useTrash } from "./TrashContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const NotesContext = createContext();
export const useNotes = () => useContext(NotesContext);

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("All Notes");
  const [loading, setLoading] = useState(true);
  const { addTrash } = useTrash();

  const fetchNotes = async () => {
    try {
      const res = await API.get("/api/notes");
      setNotes(res.data);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Failed to fetch notes:", error);
      }
      setNotes([]);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await API.get("/api/folders");
      setFolders(res.data);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Failed to fetch folders:", error);
      }
      setFolders([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchNotes(), fetchFolders()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const addNote = async (note) => {
    try {
      const res = await API.post("/api/notes", note);
      setNotes((prev) => [res.data, ...prev]);
      toast.success("Note created!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create note");
      console.error(error);
    }
  };

  const updateNote = async (id, updatedFields) => {
    try {
      const res = await API.put(`/api/notes/${id}`, updatedFields);
      setNotes((prev) => prev.map((n) => (n._id === id ? { ...n, ...res.data } : n)));
      toast.success("Note updated!");
      return res.data;
    } catch (error) {
      toast.error("Failed to update note");
      console.error(error);
    }
  };

  const deleteNote = async (id) => {
    try {
      const note = notes.find((n) => n._id === id);
      if (!note) return;
      await API.delete(`/api/notes/${id}`);
      addTrash({ ...note, deletedAt: new Date().toISOString() }, "note");
      setNotes((prev) => prev.filter((n) => n._id !== id));
      toast.success("Note moved to trash");
    } catch (error) {
      toast.error("Failed to delete note");
      console.error(error);
    }
  };

  const addFolder = async (name) => {
    try {
      await API.post("/api/folders", { name });
      setFolders((prev) => [...prev, name]);
      toast.success("Folder created!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create folder");
      console.error(error);
    }
  };

  const deleteFolder = async (name) => {
    try {
      await API.delete(`/api/folders/${encodeURIComponent(name)}`);
      setFolders((prev) => prev.filter((f) => f !== name));
      setNotes((prev) =>
        prev.map((n) => (n.folder === name ? { ...n, folder: "General" } : n))
      );
      setSelectedFolder("All Notes");
      toast.success("Folder deleted");
    } catch (error) {
      toast.error("Failed to delete folder");
      console.error(error);
    }
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        folders,
        loading,
        addNote,
        updateNote,
        deleteNote,
        addFolder,
        deleteFolder,
        selectedFolder,
        setSelectedFolder,
        refreshNotes: fetchNotes,
        refreshFolders: fetchFolders,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};