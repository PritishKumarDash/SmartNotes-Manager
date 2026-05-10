import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../Contexts/AuthContext";

/* ─────────────────────────────────────────────
   LOGIN
───────────────────────────────────────────── */
export function Login() {
  const [data, setData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const handleLogin = async () => {
    if (!data.username || !data.password) return toast.error("All fields are required");
    try {
      setLoading(true);
      const res = await API.post("/api/auth/login", data);
      if (res.data.token) localStorage.setItem("token", res.data.token);
      localStorage.removeItem("pendingVerificationEmail");
      const userData = await checkAuth();
      if (userData) {
        toast.success(`Welcome back, ${userData.username}!`);
        navigate("/notes");
      } else {
        toast.error("Login succeeded but couldn't load user");
        navigate("/");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            S
          </div>
          <span className="text-white font-semibold text-lg">SmartNotes</span>
        </div>

        <h2 className="text-2xl font-semibold text-white mb-1">Sign in</h2>
        <p className="text-gray-500 text-sm mb-7">Enter your credentials to access your workspace</p>

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Username or Email</label>
            <input
              type="text"
              value={data.username}
              onChange={e => setData({ ...data, username: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors text-sm"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={data.password}
                onChange={e => setData({ ...data, password: e.target.value })}
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-gray-900 border border-gray-800 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm"
              >
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : "Sign in"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   REGISTER
───────────────────────────────────────────── */
export function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password) return toast.error("All fields are required");
    if (!agreeTerms) return toast.error("Please agree to the terms");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return toast.error("Invalid email address");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");

    try {
      setLoading(true);
      await API.post("/api/auth/register", form);
      localStorage.setItem("pendingVerificationEmail", form.email);
      toast.success("Verification code sent! 📩");
      navigate("/verify", { state: { email: form.email } });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="text-white font-semibold text-lg">SmartNotes</span>
        </div>

        <h2 className="text-2xl font-semibold text-white mb-1">Create account</h2>
        <p className="text-gray-500 text-sm mb-7">Join SmartNotes and start organizing your work</p>

        <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors text-sm"
              placeholder="johndoe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors text-sm"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-gray-900 border border-gray-800 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors text-sm"
                placeholder="Min. 6 characters"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm">
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={e => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 checked:bg-blue-600"
            />
            <span className="text-sm text-gray-400">
              I agree to the{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : "Create account"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VERIFY OTP
───────────────────────────────────────────── */
export function VerifyOtp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("pendingVerificationEmail");
    const stateEmail = location.state?.email;
    if (stateEmail) {
      setEmail(stateEmail);
      localStorage.setItem("pendingVerificationEmail", stateEmail);
    } else if (stored) {
      setEmail(stored);
    } else {
      toast.error("Session expired. Please register again.");
      navigate("/register");
    }
  }, [location, navigate]);

  useEffect(() => {
    setCanResend(false);
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(timer); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async () => {
    const otpStr = otp.join("");
    if (otpStr.length !== 6) return toast.error("Enter the 6-digit code");
    try {
      setLoading(true);
      await API.post("/api/auth/verify-otp", { email, otp: otpStr });
      toast.success("Email verified!");
      localStorage.removeItem("pendingVerificationEmail");
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      setLoading(true);
      await API.post("/api/auth/resend-otp", { email });
      toast.success("New code sent!");
      setCanResend(false);
      setResendTimer(30);
      const timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) { clearInterval(timer); setCanResend(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to resend");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`)?.focus();
  };

  if (!email) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-2xl mx-auto mb-6">
          ✉️
        </div>

        <h2 className="text-2xl font-semibold text-white mb-1">Verify your email</h2>
        <p className="text-gray-500 text-sm mb-7">
          We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
        </p>

        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={e => handleOtpChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              className="w-11 h-11 text-center text-lg font-semibold rounded-lg bg-gray-900 border border-gray-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Verifying...
            </span>
          ) : "Verify account"}
        </button>

        <p className="text-sm text-gray-500">
          Didn't receive it?{" "}
          <button
            onClick={handleResend}
            disabled={!canResend || loading}
            className={`font-medium transition-colors ${
              canResend && !loading ? "text-blue-400 hover:text-blue-300" : "text-gray-600 cursor-not-allowed"
            }`}
          >
            Resend {!canResend && `(${resendTimer}s)`}
          </button>
        </p>

        <div className="mt-6">
          <Link to="/register" className="text-sm text-gray-600 hover:text-gray-400 transition-colors">
            ← Back to registration
          </Link>
        </div>
      </motion.div>
    </div>
  );
}