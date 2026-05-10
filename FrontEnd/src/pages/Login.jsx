import { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [data, setData] = useState({
    username: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!data.username || !data.password) {
      return toast.error("All fields are required");
    }

    try {
      setLoading(true);

      await API.post("/api/auth/login", data);

      toast.success("Login successful 🚀");
      navigate("/dashboard");

    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 dark:from-slate-900 dark:to-slate-800">

      <div className="hidden md:flex w-1/2 items-center justify-center">
        <img
          src="https://cdn-icons-png.flaticon.com/512/4149/4149683.png"
          className="w-80 drop-shadow-2xl"
        />
      </div>

      <div className="flex w-full md:w-1/2 items-center justify-center px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20"
        >
          <h2 className="text-3xl font-bold text-center mb-2 text-slate-800 dark:text-white">
            Welcome Back 👋
          </h2>

          <p className="text-center text-sm text-slate-500 mb-6">
            Login to your account
          </p>

          <div className="space-y-4">

            <input
              value={data.username}
              placeholder="Username"
              onChange={e => setData({ ...data, username: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <input
              type="password"
              value={data.password}
              placeholder="Password"
              onChange={e => setData({ ...data, password: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <button
              disabled={loading}
              className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </div>

          <p className="text-center mt-5 text-sm text-slate-600 dark:text-slate-300">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}