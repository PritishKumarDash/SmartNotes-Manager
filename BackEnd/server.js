require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/auth.routes");
const noteRoutes = require("./src/routes/note.routes");
const taskRoutes = require("./src/routes/task.routes");
const folderRoutes = require("./src/routes/folder.routes");
const adminRoutes = require("./src/routes/admin.routes");  // ADD THIS

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
].filter(Boolean);

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Database connection
connectDB();

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "SmartNotes API is running",
    status: "active",
    endpoints: {
      auth: "/api/auth",
      notes: "/api/notes",
      tasks: "/api/tasks",
      folders: "/api/folders",
      admin: "/api/admin",  // ADD THIS
    },
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/admin", adminRoutes);  // ADD THIS

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});