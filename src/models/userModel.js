const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        fname: {
            type: String,
            required: true
        },
        lname: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        access: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true
        },
        bookmark: [
            {
                title: {
                    type: String,
                    required: false
                },
                url: {
                    type: String,
                    required: false
                },
            },
        ],
        lastLogin: {
            type: String,
            required: false
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

const User = mongoose.model("User", userSchema);

module.exports = User;