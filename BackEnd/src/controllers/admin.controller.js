const User   = require("../models/user");
const Note   = require("../models/note");
const Task   = require("../models/task");
const Folder = require("../models/folder");
const jwt    = require("jsonwebtoken");

exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin@smartnotes123";

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      { id: "admin", role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.json({ message: "Admin login successful", token });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      totalNotes,
      totalTasks,
      totalFolders,
      completedTasks,
      pendingTasks,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isEmailVerified: true }),
      Note.countDocuments(),
      Task.countDocuments(),
      Folder.countDocuments(),
      Task.countDocuments({ completed: true }),
      Task.countDocuments({ completed: false }),
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [newUsersThisWeek, newNotesThisWeek, newTasksThisWeek,
           highTasks, mediumTasks, lowTasks] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Note.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Task.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Task.countDocuments({ priority: "high" }),
      Task.countDocuments({ priority: "medium" }),
      Task.countDocuments({ priority: "low" }),
    ]);

    const today = new Date().toISOString().split("T")[0];
    const overdueTasks = await Task.countDocuments({
      completed: false,
      dueDate: { $lt: today, $ne: null },
    });

    let userGrowth = [];
    try {
      userGrowth = await User.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id:   { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
    } catch (e) {
      console.error("userGrowth aggregation error:", e);
    }

    let noteColors = [];
    try {
      noteColors = await Note.aggregate([
        { $group: { _id: "$color", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
    } catch (e) {
      console.error("noteColors aggregation error:", e);
    }

    res.json({
      totalUsers,
      verifiedUsers,
      unverifiedUsers: totalUsers - verifiedUsers,
      totalNotes,
      totalTasks,
      totalFolders,
      completedTasks,
      pendingTasks,
      overdueTasks,
      newUsersThisWeek,
      newNotesThisWeek,
      newTasksThisWeek,
      taskCompletionRate: totalTasks
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0,
      priorityBreakdown: { high: highTasks, medium: mediumTasks, low: lowTasks },
      userGrowth,
      noteColors,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -emailOtp -otpExpiry")
      .sort({ createdAt: -1 });

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [noteCount, taskCount, folderCount, completedTaskCount] =
          await Promise.all([
            Note.countDocuments({ user: user._id }),
            Task.countDocuments({ user: user._id }),
            Folder.countDocuments({ user: user._id }),
            Task.countDocuments({ user: user._id, completed: true }),
          ]);

        return {
          _id:                user._id,
          username:           user.username,
          email:              user.email,
          isEmailVerified:    user.isEmailVerified,
          createdAt:          user.createdAt,
          noteCount,
          taskCount,
          folderCount,
          completedTaskCount,
          taskCompletionRate: taskCount > 0
            ? Math.round((completedTaskCount / taskCount) * 100)
            : 0,
        };
      })
    );

    res.json(usersWithStats);
  } catch (err) {
    console.error("Admin get users error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password -emailOtp -otpExpiry");
    if (!user) return res.status(404).json({ message: "User not found" });

    const [notes, tasks, folders] = await Promise.all([
      Note.find({ user: id }).sort({ createdAt: -1 }).limit(10),
      Task.find({ user: id }).sort({ createdAt: -1 }).limit(10),
      Folder.find({ user: id }).sort({ createdAt: -1 }),
    ]);

    res.json({ user, notes, tasks, folders });
  } catch (err) {
    console.error("Get user detail error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await Promise.all([
      User.findByIdAndDelete(id),
      Note.deleteMany({ user: id }),
      Task.deleteMany({ user: id }),
      Folder.deleteMany({ user: id }),
    ]);

    res.json({ message: "User and all associated data deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(notes);
  } catch (err) {
    console.error("Get all notes error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(tasks);
  } catch (err) {
    console.error("Get all tasks error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getPublicStats = async (req, res) => {
  try {
    const [totalUsers, totalNotes, totalTasks] = await Promise.all([
      User.countDocuments({ isEmailVerified: true }),
      Note.countDocuments(),
      Task.countDocuments(),
    ]);

    res.json({ totalUsers, totalNotes, totalTasks });
  } catch (err) {
    console.error("Public stats error:", err);
    res.status(500).json({ message: err.message });
  }
};