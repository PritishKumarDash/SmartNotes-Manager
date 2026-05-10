const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure folder names are unique per user
folderSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Folder", folderSchema);