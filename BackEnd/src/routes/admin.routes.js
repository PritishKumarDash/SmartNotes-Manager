const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  adminLogin,
  getDashboardStats,
  getAllUsers,
  getUserDetail,
  deleteUser,
  getAllNotes,
  getAllTasks,
  getPublicStats,
} = require("../controllers/admin.controller");

router.get("/public-stats", getPublicStats);

router.post("/login",          adminLogin);
router.get("/stats",           adminMiddleware, getDashboardStats);
router.get("/users",           adminMiddleware, getAllUsers);
router.get("/users/:id",       adminMiddleware, getUserDetail);
router.delete("/users/:id",    adminMiddleware, deleteUser);
router.get("/notes",           adminMiddleware, getAllNotes);
router.get("/tasks",           adminMiddleware, getAllTasks);

module.exports = router;