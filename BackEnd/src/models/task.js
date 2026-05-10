const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ["high", "medium", "low"],
        default: "medium"
    },
    dueDate: {
        type: String,
        default: null
    },
    pinned: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true  // This automatically handles createdAt and updatedAt
});

module.exports = mongoose.model("Task", taskSchema);