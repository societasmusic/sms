const mongoose = require("mongoose");

const addressSchema = mongoose.Schema(
    {
        line1: {
            type: String,
            required: false,
        },
        line2: {
            type: String,
            required: false,
        },
        city: {
            type: String,
            required: false,
        },
        state: {
            type: String,
            required: false,
        },
        zip: {
            type: String,
            required: false,
        },
        country: {
            type: String,
            required: false,
        },
    },
);
const attachmentSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: false,
        },
        type: {
            type: String,
            required: false,
        },
        path: {
            type: String,
            required: false,
        },
        createdBy: {
            type: String,
            required: false
        },
        updatedBy: {
            type: String,
            required: false
        },
    },
    {
        timestamps: true
    },
);

const accountSchema = mongoose.Schema(
    {
        legalname: {
            type: String,
            require: true
        },
        businesstype: {
            type: String,
            require: true
        },
        territory: {
            type: String,
            require: true
        },
        address: [addressSchema],
        contact: [
            {
                type: String,
                required: false,
            },
        ],
        attachments: [attachmentSchema],
        createdBy: {
            type: String,
            required: true
        },
        updatedBy: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    },
);

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;