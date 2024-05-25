const mongoose = require("mongoose");

const accountSchema = mongoose.Schema(
    {
        number: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        company: {
            type: String,
            required: true
        },
        currency: {
            type: String,
            required: false
        },
        type: {
            type: String,
            required: true
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

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;