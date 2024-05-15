const mongoose = require("mongoose");

const itemSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        version: {
            type: String,
            required: false
        },
        itemType: {
            type: String,
            required: true
        },
        pricing: {
            rate: {
                type: Number,
                required: true
            },
            unit: {
                type: String,
                required: true
            },
        },
        royalties: [
            {
                party: {
                    type: String,
                    required: false
                },
                percent: {
                    type: Number,
                    required: false
                },
                createdBy: {
                    type: String,
                    required: true
                },
                updatedBy: {
                    type: String,
                    required: true
                },
                createdAt: {
                    type: Date,
                    required: true
                },
                updatedAt: {
                    type: Date,
                    required: true
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