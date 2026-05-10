import { createContext, useContext, useEffect, useState } from "react";
import { useTrash } from "./TrashContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const TaskContext = createContext();
export const useTask = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addTrash } = useTrash();

  const fetchTasks = async () => {
    try {
      const res = await API.get("/api/tasks");
      setTasks(res.data);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Failed to fetch tasks:", error);
      }
      setTasks([]);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchTasks();
      setLoading(false);
    };
    load();
  }, []);

  const addTask = async (taskData) => {
    try {
      const res = await API.post("/api/tasks", taskData);
      setTasks((prev) => [res.data, ...prev]);
      toast.success("Task created!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
      console.error(error);
    }
  };

  const updateTask = async (id, updatedFields) => {
    try {
      const res = await API.put(`/api/tasks/${id}`, updatedFields);
      setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, ...res.data } : t)));
      return res.data;
    } catch (error) {
      toast.error("Failed to update task");
      console.error(error);
    }
  };

  const deleteTask = async (id) => {
    try {
      const task = tasks.find((t) => t._id === id);
      if (!task) return;
      await API.delete(`/api/tasks/${id}`);
      addTrash({ ...task, deletedAt: new Date().toISOString() }, "task");
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast.success("Task moved to trash");
    } catch (error) {
      toast.error("Failed to delete task");
      console.error(error);
    }
  };

  const toggleComplete = async (id) => {
    try {
      const res = await API.patch(`/api/tasks/${id}/toggle`);
      setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, ...res.data } : t)));
    } catch (error) {
      toast.error("Failed to update task");
      console.error(error);
    }
  };

  const clearCompleted = async () => {
    const completed = tasks.filter((t) => t.completed);
    if (completed.length === 0) return;
    try {
      await Promise.all(completed.map((t) => API.delete(`/api/tasks/${t._id}`)));
      completed.forEach((t) =>
        addTrash({ ...t, deletedAt: new Date().toISOString() }, "task")
      );
      setTasks((prev) => prev.filter((t) => !t.completed));
      toast.success(`Cleared ${completed.length} completed task${completed.length > 1 ? "s" : ""}`);
    } catch (error) {
      toast.error("Failed to clear tasks");
      console.error(error);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        clearCompleted,
        refreshTasks: fetchTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};