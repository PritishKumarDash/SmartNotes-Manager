import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import NotesPage from "./Components/NotesPage";
import FolderPage from "./Components/FolderPage";
import TaskContent from "./Components/Tasks/TaskContent";
import TrashContent from "./Components/TrashContent";
import Insights from "./Components/Insights";
import ProtectedRoute from "./Components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import { Login, Register, VerifyOtp } from "./pages/AuthPages";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminNotes from "./pages/admin/AdminNotes";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminProtectedRoute from "./pages/admin/AdminProtectedRoute";

import "./index.css";

import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

function App() {
  const location = useLocation();
  const isAuthPage = ["/login", "/register", "/verify"].includes(location.pathname);
  const isLandingPage = location.pathname === "/";
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            borderRadius: "12px",
            border: "1px solid rgba(0,0,0,0.06)",
          },
        }}
      />

      {!isAuthPage && !isLandingPage && !isAdminPage && <Navbar />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<VerifyOtp />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="notes" element={<AdminNotes />} />
            <Route path="tasks" element={<AdminTasks />} />
          </Route>

          <Route path="/notes"    element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
          <Route path="/tasks"    element={<ProtectedRoute><TaskContent /></ProtectedRoute>} />
          <Route path="/folder"   element={<ProtectedRoute><FolderPage /></ProtectedRoute>} />
          <Route path="/trash"    element={<ProtectedRoute><TrashContent /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAuthPage && !isLandingPage && !isAdminPage && <Footer />}
    </div>
  );
}

export default App;