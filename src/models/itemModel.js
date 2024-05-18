const mongoose = require("mongoose");

const itemSchema = mongoose.Schema(
    {
        number: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        version: {
            type: String,
            required: false
        },
        type: {
            type: String,
            required: true
        },
        pricing: {
            rate: {
                type: Number,
                required: false
            },
            uom: {
                type: String,
                required: false
            },
        },
        royalties: [
            {
                party: {
                    type: String,
                    required: false
                },
                rate: {
                    type: Number,
                    required: false
                },
                maxReserveRate: {
                    type: Number,
                    required: false
                },
                threshold: {
                    type: Number,
                    required: false
                },
                createdAt: {
                    type: Date,
                    required: false
                },
            }
        ],
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
    },
)

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;