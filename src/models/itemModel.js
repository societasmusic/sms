const mongoose = require("mongoose");

const itemSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        upc: {
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
        }
    },
    {
        timestamps: true
    }
)

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;