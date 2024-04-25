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

const vendorSchema = mongoose.Schema(
    {
        legalName: {
            type: String,
            require: true
        },
        businessType: {
            type: String,
            require: true
        },
        businessCategory: {
            type: String,
            require: true
        },
        taxTerritory: {
            type: String,
            require: true
        },
        status: {
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
            type: String,
            require: false
        },
        address: [addressSchema],
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

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;