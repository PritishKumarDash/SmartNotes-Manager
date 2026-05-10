const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete
} = require("../controllers/task.controller");

router.use(authMiddleware);

router.get("/", getAllTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.patch("/:id/toggle", toggleComplete);

module.exports = router;