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

const partySchema = mongoose.Schema(
    {
        name: {
            type: String,
            require: true
        },
        partyType: {
            type: String,
            require: true
        },
        tin: {
            type: String,
            require: false
        },
        businessType: {
            type: String,
            require: true
        },
        category: {
            type: String,
            require: true
        },
        territory: {
            type: String,
            require: true
        },
        email: {
            type: String,
            require: false
        },
        phone: {
            type: Number,
            require: false
        },
        altPhone: {
            type: Number,
            require: false
        },
        address: [addressSchema],
        billingAccount: {
            type: String,
            require: true
        },
        currency: {
            type: String,
            require: true
        },
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

const Party = mongoose.model("Party", partySchema);

module.exports = Party;