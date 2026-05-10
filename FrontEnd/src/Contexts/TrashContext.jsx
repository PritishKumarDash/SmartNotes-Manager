import toast from "react-hot-toast";
import { useContext, createContext, useEffect, useState } from "react";

const TrashContext = createContext();
export const useTrash = () => useContext(TrashContext);

export const TrashProvider = ({ children }) => {
  const [trash, setTrash] = useState(() => {
    try {
      const stored = localStorage.getItem("trash");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("trash", JSON.stringify(trash));
    } catch (e) {
      console.error("Failed to save trash to localStorage", e);
    }
  }, [trash]);

  const addTrash = (item, type) => {
    const trashItem = {
      id: item._id || item.id || String(Date.now()),
      type,
      data: item,
      deletedAt: item.deletedAt || new Date().toISOString(),
    };
    setTrash((prev) => [trashItem, ...prev]);
  };

  const deleteForever = (id) => {
    setTrash((prev) => prev.filter((t) => t.id !== id));
    toast.success("Item permanently deleted");
  };

  return (
    <TrashContext.Provider value={{ trash, setTrash, addTrash, deleteForever }}>
      {children}
    </TrashContext.Provider>
  );
};