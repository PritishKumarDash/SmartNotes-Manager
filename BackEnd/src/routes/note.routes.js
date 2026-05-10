const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
    getAllNotes,
    createNote,
    updateNote,
    deleteNote,
    getNoteById
} = require("../controllers/note.controller");

router.use(authMiddleware);

router.get("/", getAllNotes);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.get("/:id", getNoteById);

module.exports = router;