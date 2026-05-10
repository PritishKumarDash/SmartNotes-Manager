import { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password) {
      return toast.error("All fields are required");
    }

    try {
      setLoading(true);

      await API.post("/api/auth/register", form);

      toast.success("OTP sent 📩");
      navigate("/verify", { state: { email: form.email } });

    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 dark:from-slate-900 dark:to-slate-800">

      <div className="hidden md:flex w-1/2 items-center justify-center">
        <img
          src="https://cdn-icons-png.flaticon.com/512/4149/4149676.png"
          className="w-80 drop-shadow-2xl"
        />
      </div>

      <div className="flex w-full md:w-1/2 items-center justify-center px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
          className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20"
        >
          <h2 className="text-3xl font-bold text-center mb-2 text-slate-800 dark:text-white">
            Create Account 🚀
          </h2>

          <div className="space-y-4 mt-6">

            <input
              value={form.username}
              placeholder="Username"
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800"
            />

            <input
              value={form.email}
              placeholder="Email"
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800"
            />

            <input
              type="password"
              value={form.password}
              placeholder="Password"
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800"
            />

            <button
              disabled={loading}
              className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg disabled:opacity-50"
            >
              {loading ? "Creating..." : "Register"}
            </button>

          </div>

          <p className="text-center mt-5 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}