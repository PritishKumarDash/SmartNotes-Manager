import React, { useState } from "react";
import { useTheme } from "../Contexts/ThemeContext";
import { useTrash } from "../Contexts/TrashContext";
import { useAuth } from "../Contexts/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { to: "/notes",    label: "Notes",    icon: "📝" },
  { to: "/tasks",    label: "Tasks",    icon: "✅" },
  { to: "/folder",   label: "Folders",  icon: "📁" },
  { to: "/insights", label: "Insights", icon: "📊" },
  { to: "/trash",    label: "Trash",    icon: "🗑",  hasBadge: true },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { trash } = useTrash();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "U";

  // Admin access on double click logo
  const handleAdminAccess = (e) => {
    e.preventDefault();
    window.location.href = "/admin/login";
  };

  if (!user) return null;

  return (
    <nav className={`sticky top-0 z-50 transition-colors duration-200 ${
      isDark
        ? "bg-gray-950 border-b border-gray-800"
        : "bg-white border-b border-gray-200"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo - Double click for admin access */}
        <div 
          onClick={() => navigate("/notes")}
          onDoubleClick={handleAdminAccess}
          className="flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            S
          </div>
          <span className={`font-semibold text-sm tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            SmartNotes
          </span>
        </div>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-0.5 list-none m-0 p-0">
          {navLinks.map(link => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 no-underline ${
                    isActive
                      ? isDark
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-900"
                      : isDark
                        ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`
                }
              >
                <span className="text-sm">{link.icon}</span>
                {link.label}
                {link.hasBadge && trash.length > 0 && (
                  <span className="ml-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {trash.length > 9 ? "9+" : trash.length}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              {user?.username}
            </span>
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
              {initials}
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className={`w-8 h-8 rounded-md flex items-center justify-center text-sm transition-colors ${
              isDark
                ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
            title="Toggle theme"
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          <button
            onClick={handleLogout}
            className={`hidden md:flex w-8 h-8 rounded-md items-center justify-center text-sm transition-colors ${
              isDark
                ? "text-gray-400 hover:text-red-400 hover:bg-gray-800"
                : "text-gray-500 hover:text-red-600 hover:bg-gray-100"
            }`}
            title="Logout"
          >
            ↩
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
              isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className={`md:hidden overflow-hidden border-t ${
              isDark ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200"
            }`}
          >
            <div className="px-4 py-3 space-y-0.5">
              {/* User info */}
              <div className={`flex items-center gap-3 px-3 py-2.5 mb-2 rounded-md ${
                isDark ? "bg-gray-900" : "bg-gray-50"
              }`}>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                  {initials}
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{user?.username}</p>
                  <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{user?.email}</p>
                </div>
              </div>

              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors no-underline ${
                      isActive
                        ? isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
                        : isDark ? "text-gray-400 hover:bg-gray-800 hover:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <span className="flex items-center gap-2">
                    <span>{link.icon}</span> {link.label}
                  </span>
                  {link.hasBadge && trash.length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {trash.length}
                    </span>
                  )}
                </NavLink>
              ))}

              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
                  isDark ? "text-gray-400 hover:bg-gray-800 hover:text-red-400" : "text-gray-600 hover:bg-gray-50 hover:text-red-600"
                }`}
              >
                ↩ Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}