import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, []);

  const handleVerify = async () => {
    if (!otp) return toast.error("Enter OTP");

    try {
      setLoading(true);

      await API.post("/api/auth/verify-otp", { email, otp });

      toast.success("Verified 🎉");
      navigate("/login");

    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await API.post("/api/auth/resend-otp", { email });
      toast.success("OTP resent 📩");
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 dark:from-slate-900 dark:to-slate-800">

      <div className="flex w-full items-center justify-center px-6">
        <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white/80 dark:bg-slate-900/80 text-center">

          <h2 className="text-3xl font-bold mb-2">Verify OTP 🔐</h2>

          <p className="text-sm mb-6">
            Code sent to <b>{email}</b>
          </p>

          <input
            value={otp}
            maxLength="6"
            onChange={e => setOtp(e.target.value)}
            placeholder="••••••"
            className="w-full px-4 py-3 text-center text-lg tracking-widest rounded-lg bg-slate-100 dark:bg-slate-800 mb-4"
          />

          <button
            onClick={handleVerify}
            className="w-full py-3 bg-green-600 text-white rounded-lg mb-3"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            onClick={handleResend}
            className="text-indigo-600 hover:underline"
          >
            Resend OTP
          </button>

        </div>
      </div>
    </div>
  );
}