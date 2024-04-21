const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
    {
        assigned: {
            type: String,
            required: true
        },
        approval: {
            isRequired: {
                type: Boolean,
                required: true
            },
            approvedAt: {
                type: String,
                required: false
            },
            approvedBy: {
                type: String,
                required: false
            },
        },
        createdBy: {
            type: String,
            required: true
        },
        updatedBy: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;