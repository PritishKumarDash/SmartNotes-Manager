import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://smartnotes-manager.onrender.com";

const features = [
  { icon: "📝", title: "Smart Notes", desc: "Create rich notes with colors, folders, and pin support. Organize your thoughts effortlessly." },
  { icon: "✅", title: "Task Management", desc: "Set priorities, due dates, and track progress. Never miss a deadline again." },
  { icon: "📁", title: "Smart Folders", desc: "Organize notes into custom folders. Keep your workspace clean and structured." },
  { icon: "📌", title: "Pin & Prioritize", desc: "Pin important notes and tasks to keep them at the top of your workspace." },
  { icon: "🗑", title: "Trash Recovery", desc: "Accidentally deleted something? Restore it instantly from trash." },
  { icon: "📊", title: "Insights", desc: "Track productivity with detailed analytics and daily motivation quotes." },
  { icon: "🎨", title: "Dark/Light Mode", desc: "Work comfortably day or night with beautiful themes." },
  { icon: "🔐", title: "Secure Auth", desc: "OTP verification and JWT-based security for your data." },
];

const testimonials = [
  { name: "Rahul Sharma", role: "Product Manager", content: "SmartNotes transformed how I manage my team's tasks. The insights feature is a game-changer!", rating: 5, avatar: "RS" },
  { name: "Priya Patel", role: "Software Developer", content: "Best note-taking app I've used. Clean UI, fast sync, and dark mode is perfect for night coding.", rating: 5, avatar: "PP" },
  { name: "Amit Kumar", role: "Student", content: "Perfect for organizing lecture notes and assignments. The folder system keeps everything tidy.", rating: 5, avatar: "AK" },
];

export default function LandingPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, totalNotes: 0, totalTasks: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.7]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fetchStats = async () => {
    setStatsLoading(true);
    setStatsError(false);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/public-stats`, { timeout: 8000 });
      setStats(res.data);
    } catch (err) {
      console.error("Stats fetch error:", err);
      setStatsError(true);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const bg = isDark ? "bg-gray-950 text-gray-100" : "bg-white text-gray-900";
  const muted = isDark ? "text-gray-500" : "text-gray-500";
  const card = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "text-blue-500" },
    { label: "Notes Created", value: stats.totalNotes, icon: "📝", color: "text-purple-500" },
    { label: "Tasks Completed", value: stats.totalTasks, icon: "✅", color: "text-emerald-500" },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bg}`}>
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 -left-40 w-96 h-96 rounded-full blur-3xl ${isDark ? "bg-blue-600/10" : "bg-blue-400/10"} animate-pulse`} />
        <div className={`absolute bottom-0 -right-40 w-96 h-96 rounded-full blur-3xl ${isDark ? "bg-purple-600/10" : "bg-purple-400/10"} animate-pulse delay-1000`} />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? isDark ? "bg-gray-950/95 backdrop-blur-xl border-b border-gray-800" : "bg-white/95 backdrop-blur-xl border-b border-gray-200"
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div
            onClick={() => navigate("/")}
            onDoubleClick={() => navigate("/admin/login")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform duration-300">
              S
            </div>
            <span className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
              Smart<span className="text-blue-500">Notes</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isDark ? "text-gray-300 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}>
              Sign In
            </Link>
            <Link to="/register" className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8 ${
              isDark ? "border-blue-500/30 text-blue-400 bg-blue-500/10" : "border-blue-200 text-blue-600 bg-blue-50"
            }`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Live from our database
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.15] mb-6">
              Organize your work,
              <span className="block bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">effortlessly.</span>
            </h1>

            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 opacity-80">
              Notes, tasks, and insights in one beautiful workspace. Stay focused, stay productive, stay inspired.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5">
                Start Free Trial →
              </Link>
              <button
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                className={`px-8 py-4 rounded-xl font-semibold border-2 transition-all duration-200 hover:-translate-y-0.5 ${
                  isDark ? "border-gray-700 text-gray-300 hover:border-blue-500 hover:text-blue-400" : "border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600"
                }`}
              >
                Explore Features
              </button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
          >
            {statCards.map((stat, idx) => (
              <div key={stat.label} className={`rounded-2xl border p-6 text-center transition-all duration-300 hover:-translate-y-1 ${card}`}>
                <div className="text-4xl mb-3">{stat.icon}</div>
                {statsLoading ? (
                  <>
                    <div className={`h-10 w-24 rounded-lg animate-pulse mx-auto ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
                    <div className={`h-4 w-20 rounded animate-pulse mx-auto mt-2 ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
                  </>
                ) : statsError ? (
                  <>
                    <p className="text-3xl font-bold text-gray-400">—</p>
                    <p className={`text-sm mt-1 ${muted}`}>{stat.label}</p>
                    <button onClick={fetchStats} className="text-xs text-blue-500 mt-2 hover:underline">Retry</button>
                  </>
                ) : (
                  <>
                    <p className={`text-4xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</p>
                    <p className={`text-sm mt-1 ${muted}`}>{stat.label}</p>
                  </>
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className={`text-lg max-w-2xl mx-auto ${muted}`}>A complete toolkit to boost your productivity</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                className={`rounded-2xl border p-6 transition-all duration-300 ${card} hover:border-blue-500/50 hover:shadow-xl`}
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className={`text-sm leading-relaxed ${muted}`}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by <span className="text-blue-500">Thousands</span></h2>
            <p className={`text-lg max-w-2xl mx-auto ${muted}`}>Don't just take our word for it</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className={`rounded-2xl border p-6 transition-all duration-300 ${card}`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className={`text-xs ${muted}`}>{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  "{testimonial.content}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`relative overflow-hidden rounded-3xl p-12 text-center border ${card}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Boost Your Productivity?</h2>
              <p className={`text-lg max-w-xl mx-auto mb-8 ${muted}`}>
                Join thousands of users who have transformed their workflow with SmartNotes.
              </p>
              <Link to="/register" className="inline-flex px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5">
                Get Started for Free
              </Link>
              <p className={`text-sm mt-4 ${muted}`}>No credit card required. Free forever with basic features.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-12 px-6 ${isDark ? "border-gray-800" : "border-gray-200"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm">S</div>
                <span className="font-bold">SmartNotes</span>
              </div>
              <p className={`text-sm ${muted}`}>Organize your life smarter with SmartNotes.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className={`${muted} hover:text-blue-500 transition-colors`}>Features</a></li>
                <li><Link to="/login" className={`${muted} hover:text-blue-500 transition-colors`}>Sign In</Link></li>
                <li><Link to="/register" className={`${muted} hover:text-blue-500 transition-colors`}>Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className={`${muted} hover:text-blue-500 transition-colors`}>About</a></li>
                <li><a href="#" className={`${muted} hover:text-blue-500 transition-colors`}>Blog</a></li>
                <li><a href="#" className={`${muted} hover:text-blue-500 transition-colors`}>Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className={`${muted} hover:text-blue-500 transition-colors`}>Privacy Policy</a></li>
                <li><a href="#" className={`${muted} hover:text-blue-500 transition-colors`}>Terms of Service</a></li>
                <li><a href="#" className={`${muted} hover:text-blue-500 transition-colors`}>Contact</a></li>
              </ul>
            </div>
          </div>
          <div className={`mt-8 pt-8 text-center text-sm ${muted}`}>
            <p>© {new Date().getFullYear()} SmartNotes. All rights reserved. Made with ✦ for productivity.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
