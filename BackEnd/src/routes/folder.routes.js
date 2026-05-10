const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
    getAllFolders,
    createFolder,
    deleteFolder
} = require("../controllers/folder.controller");

router.use(authMiddleware);

router.get("/", getAllFolders);
router.post("/", createFolder);
router.delete("/:name", deleteFolder);

module.exports = router;