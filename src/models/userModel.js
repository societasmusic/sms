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
        mailingAddress: [
            {
                line1: {
                    type: String,
                    required: false
                },
                line2: {
                    type: String,
                    required: false
                },
                city: {
                    type: String,
                    required: false
                },
                stateProvince: {
                    type: String,
                    required: false
                },
                zip: {
                    type: String,
                    required: false
                },
                country: {
                    type: String,
                    required: false
                },
            },
        ],
        emergencyContacts: [
            {
                name: {
                    type: String,
                    required: false
                },
                relation: {
                    type: String,
                    required: false
                },
                email: {
                    type: String,
                    required: false
                },
                phone: {
                    type: Number,
                    required: false
                },
            },
        ],
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