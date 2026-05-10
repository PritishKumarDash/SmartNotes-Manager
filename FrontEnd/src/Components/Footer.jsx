import { useTheme } from "../Contexts/ThemeContext";

export default function Footer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer className={`border-t transition-colors duration-200 ${
      isDark ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200"
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold">
            S
          </div>
          <span className={`font-medium ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            SmartNotes © {new Date().getFullYear()}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {["Privacy", "Terms", "Support"].map(item => (
            <span
              key={item}
              className={`cursor-pointer transition-colors ${
                isDark ? "text-gray-600 hover:text-gray-400" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}