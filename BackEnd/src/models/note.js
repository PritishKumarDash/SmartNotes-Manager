const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        default: ""
    },
    folder: {
        type: String,
        default: "General"
    },
    color: {
        type: String,
        default: "default",
        enum: ["default", "yellow", "rose", "sky", "green", "purple"]
    },
    pinned: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true  // This automatically handles createdAt and updatedAt
});

module.exports = mongoose.model("Note", noteSchema);