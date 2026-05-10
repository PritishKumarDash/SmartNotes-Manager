const Folder = require("../models/folder");
const Note = require("../models/note");

exports.getAllFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user }).sort({ createdAt: -1 });
    const folderNames = folders.map((f) => f.name);
    res.json(folderNames);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createFolder = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Folder name is required" });
    }

    const existingFolder = await Folder.findOne({ user: req.user, name: name.trim() });
    if (existingFolder) {
      return res.status(400).json({ message: "Folder already exists" });
    }

    const folder = await Folder.create({ user: req.user, name: name.trim() });
    res.status(201).json({ name: folder.name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name);
    const folder = await Folder.findOneAndDelete({ user: req.user, name });

    if (!folder) return res.status(404).json({ message: "Folder not found" });

    await Note.updateMany({ user: req.user, folder: name }, { folder: "General" });

    res.json({ message: "Folder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};